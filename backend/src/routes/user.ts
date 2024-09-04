import { FastifyInstance, FastifyReply } from "fastify";
import * as bcrypt from "bcryptjs";
import { validateEmail, validatePassword } from "gpinterface-shared/string";
import { Static } from "@sinclair/typebox";
import { sign } from "jsonwebtoken";
import { Payload } from "../types/jwt";
import { createEntity } from "../util/prisma";
import { HttpError } from "@fastify/sensible";
import {
  UserCreateSchema,
  UserGetMeResponse,
  UserGetResponse,
  UserGetSchema,
  UserGithubSchema,
  UserGoogleSchema,
  UserLoginSchema,
  UserUpdatePasswordSchema,
  UserUpdateSchema,
} from "gpinterface-shared/type/user";

function getAccessToken(
  internalServerError: (msg?: string | undefined) => HttpError,
  payload: Payload
) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw internalServerError(
      "An error occurred in the system. Please wait a moment and try again."
    );
  }

  const accessToken = sign(payload, secret, { expiresIn: "30d" });
  return accessToken;
}
function cookieReply(
  reply: FastifyReply,
  accessToken: string,
  user: UserGetMeResponse["user"]
) {
  const response: UserGetMeResponse = { user };
  return reply
    .setCookie("access_token", accessToken, {
      path: "/",
      httpOnly: true,
      secure: true,
    })
    .send(response);
}
export default async function (fastify: FastifyInstance) {
  const { httpErrors } = fastify;

  fastify.get("/", async (request, reply) => {
    try {
      const {
        user: { hashId },
      } = await fastify.getUser(request, reply);
      const user = await fastify.prisma.user.findFirst({
        where: { hashId },
        select: { hashId: true, email: true, name: true },
      });
      if (!user) {
        throw httpErrors.badRequest("no user");
      }

      const { email, ...payload } = user;
      const accessToken = getAccessToken(httpErrors.internalServerError, {
        user: payload,
      });
      return cookieReply(reply, accessToken, user);
    } catch (ex) {
      console.error("path: /user, method: get, error:", ex);
      throw ex;
    }
  });
  fastify.get("/logout", async (request, reply) => {
    return reply.clearCookie("access_token").send({});
  });
  fastify.delete("/", async (request, reply) => {
    try {
      const {
        user: { hashId },
      } = await fastify.getUser(request, reply);

      const user = await fastify.prisma.user.findFirst({ where: { hashId } });
      if (!user) {
        throw httpErrors.badRequest("You already deleted your account.");
      }

      await fastify.prisma.apiKey.deleteMany({ where: { userHashId: hashId } });
      await fastify.prisma.history.updateMany({
        where: { userHashId: hashId },
        data: { userHashId: null },
      });
      await fastify.prisma.user.delete({ where: { hashId } });
      return reply.clearCookie("access_token").send({});
    } catch (ex) {
      console.error("path: /user, method: delete, error:", ex);
      throw ex;
    }
  });
  fastify.post<{ Body: Static<typeof UserLoginSchema> }>(
    "/login",
    { schema: { body: UserLoginSchema } },
    async (request, reply) => {
      try {
        const { email, password } = request.body;
        const user = await fastify.prisma.user.findFirst({
          where: { email },
          select: { hashId: true, name: true, password: true },
        });
        if (!user) {
          throw httpErrors.badRequest("No user found with that email :(");
        }
        if (!user.password) {
          throw httpErrors.badRequest(
            "Your account doesn't require password. Please try different method."
          );
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw httpErrors.unauthorized(
            "Please check the password and try again"
          );
        }

        const { hashId, name, ...rest } = user;
        const accessToken = getAccessToken(httpErrors.internalServerError, {
          user: { hashId, name },
        });
        return cookieReply(reply, accessToken, { hashId, name, email });
      } catch (ex) {
        console.error("path: /user/login, method: post, error: ", ex);
        throw ex;
      }
    }
  );
  fastify.post<{ Body: Static<typeof UserCreateSchema> }>(
    "/signup",
    { schema: { body: UserCreateSchema } },
    async (request, reply) => {
      try {
        const { email, password, name } = request.body;
        if (!validateEmail(email)) {
          throw httpErrors.badRequest("Please check the email and try again");
        }
        if (!validatePassword(password)) {
          throw httpErrors.badRequest("Please use secure password");
        }

        let user = await fastify.prisma.user.findFirst({
          where: { email },
          select: { hashId: true },
        });
        if (user) {
          throw httpErrors.badRequest(
            "This email address is already signed up"
          );
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        user = await createEntity(fastify.prisma.user.create, {
          data: { email, password: hashedPassword, name },
          select: { hashId: true },
        });

        const accessToken = getAccessToken(httpErrors.internalServerError, {
          user: { hashId: user.hashId, name },
        });
        const me = { ...user, email, name };
        return cookieReply(reply, accessToken, me);
      } catch (ex) {
        console.error("path: /user/signup, method: post, error: ", ex);
        throw ex;
      }
    }
  );
  fastify.post<{ Body: Static<typeof UserGoogleSchema> }>(
    "/google",
    { schema: { body: UserGoogleSchema } },
    async (request, reply) => {
      try {
        const { access_token } = request.body;
        const endpoint = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw httpErrors.unauthorized(
            "Google login failed. Please try again."
          );
        }
        const userinfo = (await response.json()) as {
          name?: string;
          email?: string;
        };
        if (!userinfo?.name || !userinfo?.email) {
          throw httpErrors.unauthorized(
            "Google login failed. Please try again."
          );
        }

        let { name, email } = userinfo;
        name = name.replace(/\s+/g, "");
        let user = await fastify.prisma.user.findFirst({
          where: { email },
          select: { hashId: true, email: true, name: true },
        });
        if (user) {
          const accessToken = getAccessToken(httpErrors.internalServerError, {
            user: { hashId: user.hashId, name: user.name },
          });
          const me = user;
          return cookieReply(reply, accessToken, me);
        }

        const newUser = await createEntity(fastify.prisma.user.create, {
          data: { email, name },
          select: { hashId: true },
        });

        const accessToken = getAccessToken(httpErrors.internalServerError, {
          user: { hashId: newUser.hashId, name },
        });
        const me = { hashId: newUser.hashId, email, name };
        return cookieReply(reply, accessToken, me);
      } catch (ex) {
        console.error("path: /user/google, method: post, error: ", ex);
        throw ex;
      }
    }
  );
  fastify.get<{ Querystring: Static<typeof UserGithubSchema> }>(
    "/github",
    { schema: { querystring: UserGithubSchema } },
    async (request, reply) => {
      try {
        const { code } = request.query;
        const endpoint = `https://github.com/login/oauth/access_token`;
        const tokenResponse = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
            client_secret: process.env.GITHUB_OAUTH_SECRET,
            code,
          }),
        });
        if (!tokenResponse.ok) {
          throw httpErrors.unauthorized(
            "Github login failed. Please try again."
          );
        }
        const token = (await tokenResponse.json()) as {
          access_token: string;
        };

        const userResponse = await fetch("https://api.github.com/user", {
          headers: { Authorization: `Bearer ${token.access_token}` },
        });
        if (!userResponse.ok) {
          throw httpErrors.unauthorized(
            "Github login failed. Please try again."
          );
        }
        const identity = (await userResponse.json()) as {
          login: string;
          email: string | null | undefined;
        };
        let email = identity.email;
        if (!email) {
          const emailResponse = await fetch(
            "https://api.github.com/user/emails",
            {
              headers: {
                Accept: "application/vnd.github+json",
                Authorization: `Bearer ${token.access_token}`,
                "X-GitHub-Api-Version": "2022-11-28",
              },
            }
          );
          if (!emailResponse.ok) {
            throw httpErrors.unauthorized(
              "Github login failed. Please try again."
            );
          }
          const emailAddress = (await emailResponse.json()) as {
            email: string;
            primary: boolean;
          }[];
          email = emailAddress.find((e) => e.primary)?.email;
        }
        if (!email) {
          throw httpErrors.unauthorized(
            "Github login failed. Please try again."
          );
        }

        let user = await fastify.prisma.user.findFirst({
          where: { email },
          select: { hashId: true, email: true, name: true },
        });
        if (user) {
          const accessToken = getAccessToken(httpErrors.internalServerError, {
            user: { hashId: user.hashId, name: user.name },
          });
          const me = user;
          return cookieReply(reply, accessToken, me);
        }

        throw httpErrors.unauthorized("Github login failed. Please try again.");
      } catch (ex) {
        console.error("path: /user/github, method: get, error: ", ex);
        throw ex;
      }
    }
  );
  fastify.post<{ Body: Static<typeof UserGithubSchema> }>(
    "/github",
    { schema: { body: UserGithubSchema } },
    async (request, reply) => {
      try {
        const { code } = request.body;
        const endpoint = `https://github.com/login/oauth/access_token`;
        const tokenResponse = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
            client_secret: process.env.GITHUB_OAUTH_SECRET,
            code,
          }),
        });
        if (!tokenResponse.ok) {
          throw httpErrors.unauthorized(
            "Github login failed. Please try again."
          );
        }
        const token = (await tokenResponse.json()) as {
          access_token: string;
        };

        const userResponse = await fetch("https://api.github.com/user", {
          headers: { Authorization: `Bearer ${token.access_token}` },
        });
        if (!userResponse.ok) {
          throw httpErrors.unauthorized(
            "Github login failed. Please try again."
          );
        }
        const identity = (await userResponse.json()) as {
          login: string;
          email: string | null | undefined;
        };
        let name = identity.login;
        let email = identity.email;
        if (!email) {
          const emailResponse = await fetch(
            "https://api.github.com/user/emails",
            {
              headers: {
                Accept: "application/vnd.github+json",
                Authorization: `Bearer ${token.access_token}`,
                "X-GitHub-Api-Version": "2022-11-28",
              },
            }
          );
          if (!emailResponse.ok) {
            throw httpErrors.unauthorized(
              "Github login failed. Please try again."
            );
          }
          const emailAddress = (await emailResponse.json()) as {
            email: string;
            primary: boolean;
          }[];
          email = emailAddress.find((e) => e.primary)?.email;
        }
        if (!email) {
          throw httpErrors.unauthorized(
            "Github login failed. Please try again."
          );
        }

        name = name.replace(/\s+/g, "");
        let user = await fastify.prisma.user.findFirst({
          where: { email },
          select: { hashId: true, email: true, name: true },
        });
        if (user) {
          const accessToken = getAccessToken(httpErrors.internalServerError, {
            user: { hashId: user.hashId, name: user.name },
          });
          const me = user;
          return cookieReply(reply, accessToken, me);
        }

        const newUser = await createEntity(fastify.prisma.user.create, {
          data: { email, name },
          select: { hashId: true },
        });

        const accessToken = getAccessToken(httpErrors.internalServerError, {
          user: { hashId: newUser.hashId, name },
        });
        const me = { hashId: newUser.hashId, email, name };
        return cookieReply(reply, accessToken, me);
      } catch (ex) {
        console.error("path: /user/github, method: post, error: ", ex);
        throw ex;
      }
    }
  );
  fastify.get<{ Params: Static<typeof UserGetSchema> }>(
    "/:hashId",
    { schema: { params: UserGetSchema } },
    async (request, reply): Promise<UserGetResponse> => {
      try {
        const { hashId } = request.params;

        const user = await fastify.prisma.user.findFirst({
          where: { hashId },
          select: { name: true, hashId: true },
        });
        if (!user) {
          throw httpErrors.unauthorized("User isn't available");
        }

        return { user };
      } catch (ex) {
        console.error("path: /user/:hashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.put<{ Body: Static<typeof UserUpdateSchema> }>(
    "/",
    { schema: { body: UserUpdateSchema } },
    async (request, reply): Promise<UserGetMeResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { name } = request.body;
        const updatedUser = await fastify.prisma.user.update({
          where: { hashId: user.hashId },
          data: { name },
          select: { hashId: true, email: true, name: true },
        });

        return { user: updatedUser };
      } catch (ex) {
        console.error("path: /user, method: put, error: ", ex);
        throw ex;
      }
    }
  );
  fastify.put<{ Body: Static<typeof UserUpdatePasswordSchema> }>(
    "/password",
    { schema: { body: UserUpdatePasswordSchema } },
    async (request, reply) => {
      try {
        const {
          user: { hashId },
        } = await fastify.getUser(request, reply);
        const { oldPassword, newPassword, newPasswordRepeat } = request.body;
        if (newPassword !== newPasswordRepeat) {
          throw httpErrors.badRequest("New passwords don't match");
        }
        if (!validatePassword(newPassword)) {
          throw httpErrors.badRequest("Please use secure password");
        }

        const user = await fastify.prisma.user.findFirst({
          where: { hashId },
          select: { password: true },
        });
        if (!user) {
          throw httpErrors.badRequest("User isn't available");
        }
        if (!user.password) {
          throw httpErrors.badRequest("Your account doesn't require password.");
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          throw httpErrors.unauthorized(
            "Please check the original password and try again"
          );
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        await fastify.prisma.user.update({
          where: { hashId },
          data: { password: hashedPassword },
        });

        return { success: true };
      } catch (ex) {
        console.error("path: /user/password, method: put, error: ", ex);
        throw ex;
      }
    }
  );
}
