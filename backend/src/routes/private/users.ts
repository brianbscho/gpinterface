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
  // Initialize the user service with the Fastify instance.
  const userService = new UserService(fastify);

  /**
   * Route: GET /
   * Purpose: Retrieves the currently authenticated user's information.
   * Response: The user's data (e.g., profile information).
   */
  fastify.get("/", userService.getMe);

  /**
   * Route: GET /logout
   * Purpose: Logs the user out by clearing session or authentication tokens.
   * Response: Acknowledgment of successful logout.
   */
  fastify.get("/logout", async (request, reply) => {
    return userService.logout(reply);
  });

  /**
   * Route: DELETE /
   * Purpose: Deletes the currently authenticated user's account.
   * Response: Confirmation of account deletion.
   */
  fastify.delete("/", userService.deleteUser);

  /**
   * Route: POST /signin
   * Purpose: Authenticates a user and logs them in using the provided credentials.
   * Body Params: UserLoginSchema - Contains user login credentials (e.g., email, password).
   * Response: Authentication token or session data.
   */
  fastify.post(
    "/signin",
    { schema: { body: UserLoginSchema } },
    userService.signIn
  );

  /**
   * Route: POST /signup
   * Purpose: Registers a new user account with the provided data.
   * Body Params: UserCreateSchema - Contains user registration details (e.g., email, password).
   * Response: Newly created user data or authentication token.
   */
  fastify.post(
    "/signup",
    { schema: { body: UserCreateSchema } },
    userService.signUp
  );

  /**
   * Route: POST /google
   * Purpose: Authenticates or registers a user using Google OAuth.
   * Body Params: UserGoogleSchema - Contains Google OAuth data (e.g., access token).
   * Response: Authentication token or user data.
   */
  fastify.post(
    "/google",
    { schema: { body: UserGoogleSchema } },
    userService.googleSignIn
  );

  /**
   * Route: PATCH /
   * Purpose: Updates the user's profile with the provided information.
   * Body Params: UserUpdateSchema - Contains fields to update the user's profile (e.g., name, email).
   * Response: Updated user profile data.
   */
  fastify.patch(
    "/",
    { schema: { body: UserUpdateSchema } },
    userService.updateUser
  );

  /**
   * Route: PATCH /password
   * Purpose: Updates the user's password.
   * Body Params: UserUpdatePasswordSchema - Contains old and new passwords for update.
   * Response: Confirmation of password update.
   */
  fastify.patch(
    "/password",
    { schema: { body: UserUpdatePasswordSchema } },
    userService.updatePassword
  );
}
