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
function getNotification(
  notifications: { createdAt: Date; user: { notificationCheckedAt: Date } }[]
) {
  return (
    notifications.length > 0 &&
    notifications[0].createdAt > notifications[0].user.notificationCheckedAt
  );
}
export default async function (fastify: FastifyInstance) {
  const { httpErrors } = fastify;

  const getNotifications = async (userHashId: string) => {
    const notifications = await fastify.prisma.notification.findMany({
      where: { userHashId },
      select: {
        createdAt: true,
        user: { select: { notificationCheckedAt: true } },
      },
      orderBy: { id: "desc" },
      take: 1,
    });

    return notifications;
  };

  fastify.get("/", async (request, reply) => {
    try {
      const {
        user: { hashId },
      } = await fastify.getUser(request, reply);
      const user = await fastify.prisma.user.findFirst({
        where: { hashId },
        select: { hashId: true, email: true, name: true, bio: true },
      });
      const notifications = await getNotifications(hashId);
      if (!user) {
        throw httpErrors.badRequest("no user");
      }

      const accessToken = getAccessToken(httpErrors.internalServerError, {
        user: { hashId, name: user.name },
      });
      return cookieReply(reply, accessToken, {
        ...user,
        notification: getNotification(notifications),
      });
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

      await fastify.prisma.post.deleteMany({ where: { userHashId: hashId } });
      await fastify.prisma.apiKey.deleteMany({ where: { userHashId: hashId } });
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
          select: { hashId: true, name: true, password: true, bio: true },
        });
        if (!user) {
          throw httpErrors.badRequest("No user found with that email :(");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw httpErrors.unauthorized(
            "Please check the password and try again"
          );
        }

        const notiifcations = await getNotifications(user.hashId);
        const { hashId, name, bio, ...rest } = user;
        const accessToken = getAccessToken(httpErrors.internalServerError, {
          user: { hashId, name },
        });
        return cookieReply(reply, accessToken, {
          hashId,
          name,
          email,
          bio,
          notification: getNotification(notiifcations),
        });
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
        const { email, password, name, chatHashId } = request.body;
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
        user = await createEntity(
          fastify.prisma.user.create,
          {
            data: { email, password: hashedPassword, name },
            select: { hashId: true },
          },
          12
        );
        if (chatHashId) {
          await fastify.prisma.chat.update({
            where: { hashId: chatHashId, userHashId: null },
            data: { userHashId: user.hashId },
          });
        }

        const accessToken = getAccessToken(httpErrors.internalServerError, {
          user: { hashId: user.hashId, name },
        });
        const me = { ...user, email, name, bio: "", notification: false };
        return cookieReply(reply, accessToken, me);
      } catch (ex) {
        console.error("path: /user/signup, method: post, error: ", ex);
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
          select: { name: true, hashId: true, bio: true },
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
          select: { hashId: true, email: true, name: true, bio: true },
        });

        const notifications = await getNotifications(user.hashId);
        return {
          user: {
            ...updatedUser,
            notification: getNotification(notifications),
          },
        };
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
