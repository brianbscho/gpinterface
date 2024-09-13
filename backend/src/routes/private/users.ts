import { FastifyInstance } from "fastify";
import {
  UserCreateSchema,
  UserGoogleSchema,
  UserLoginSchema,
  UserUpdatePasswordSchema,
  UserUpdateSchema,
} from "gpinterface-shared/type/user";
import { UserService } from "../../services/user";

export default async function (fastify: FastifyInstance) {
  const userService = new UserService(fastify);

  fastify.get("/", userService.getMe);
  fastify.get("/logout", async (request, reply) => {
    return userService.logout(reply);
  });
  fastify.delete("/", userService.deleteUser);
  fastify.post(
    "/signin",
    { schema: { body: UserLoginSchema } },
    userService.signIn
  );
  fastify.post(
    "/signup",
    { schema: { body: UserCreateSchema } },
    userService.signUp
  );
  fastify.post(
    "/google",
    { schema: { body: UserGoogleSchema } },
    userService.googleSignIn
  );
  fastify.patch(
    "/",
    { schema: { body: UserUpdateSchema } },
    userService.updateUser
  );
  fastify.patch(
    "/password",
    { schema: { body: UserUpdatePasswordSchema } },
    userService.updatePassword
  );
}
