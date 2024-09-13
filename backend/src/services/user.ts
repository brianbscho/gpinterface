import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcryptjs";
import { validateEmail, validatePassword } from "gpinterface-shared/string";
import { sign } from "jsonwebtoken";
import fetch from "node-fetch";
import { Payload } from "../types/jwt";
import {
  UserLoginSchema,
  UserCreateSchema,
  UserGoogleSchema,
  UserUpdatePasswordSchema,
  UserUpdateSchema,
  UserGetMeResponse,
} from "gpinterface-shared/type/user";
import { UserRepository } from "../repositories/user";
import { HttpError } from "@fastify/sensible";
import { Static } from "@sinclair/typebox";
import { ApiKeyRepository } from "../repositories/api-key";
import { HistoryRepository } from "../repositories/history";

/**
 * Service class responsible for handling user-related business logic.
 */
export class UserService {
  private userRepository: UserRepository;
  private apiKeyRepository: ApiKeyRepository;
  private historyRepository: HistoryRepository;

  /**
   * Initializes the UserService with necessary repositories.
   * @param fastify - The FastifyInstance for accessing Prisma and HTTP errors.
   */
  constructor(private fastify: FastifyInstance) {
    this.userRepository = new UserRepository(fastify.prisma.user);
    this.apiKeyRepository = new ApiKeyRepository(fastify.prisma.apiKey);
    this.historyRepository = new HistoryRepository(fastify.prisma.history);
  }

  /**
   * Generates a JWT access token for the given payload.
   * @param internalServerError - Function to throw internal server errors.
   * @param payload - The payload to encode in the JWT.
   * @returns The generated JWT access token.
   * @throws {InternalServerError} If JWT_SECRET is not defined.
   */
  private getAccessToken(
    internalServerError: (msg?: string | undefined) => HttpError,
    payload: Payload
  ): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw internalServerError(
        "An error occurred in the system. Please wait a moment and try again."
      );
    }

    const accessToken = sign(payload, secret, { expiresIn: "30d" });
    return accessToken;
  }

  /**
   * Sets the access token as a cookie and sends the user data in the response.
   * @param reply - The FastifyReply object to modify.
   * @param accessToken - The JWT access token to set as a cookie.
   * @param user - The user data to send in the response.
   */
  private cookieReply(
    reply: FastifyReply,
    accessToken: string,
    user: UserGetMeResponse
  ): FastifyReply {
    return reply
      .setCookie("access_token", accessToken, {
        path: "/",
        httpOnly: true,
        secure: true,
      })
      .send(user);
  }

  /**
   * Retrieves the current user's information and sends it in the response.
   * @param request - The FastifyRequest object containing the user.
   * @param reply - The FastifyReply object to modify.
   * @returns The user's information suitable for the response.
   * @throws {BadRequestError} If no user is found.
   */
  async getMe(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<UserGetMeResponse> {
    const {
      user: { hashId },
    } = await this.fastify.getUser(request, reply);

    const user = await this.userRepository.findUserByHashId(hashId);
    if (!user) {
      throw this.fastify.httpErrors.badRequest("No user found");
    }

    const { email, ...payload } = user;
    const accessToken = this.getAccessToken(
      this.fastify.httpErrors.internalServerError,
      { user: payload }
    );
    return this.cookieReply(reply, accessToken, user);
  }

  /**
   * Logs out the user by clearing the access token cookie.
   * @param reply - The FastifyReply object to modify.
   */
  async logout(reply: FastifyReply): Promise<void> {
    reply.clearCookie("access_token");
  }

  /**
   * Deletes the user's account and associated data.
   * @param request - The FastifyRequest object containing the user.
   * @param reply - The FastifyReply object to modify.
   * @throws {BadRequestError} If the user does not exist.
   */
  async deleteUser(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const {
      user: { hashId },
    } = await this.fastify.getUser(request, reply);

    const user = await this.userRepository.findUserByHashId(hashId);
    if (!user) {
      throw this.fastify.httpErrors.badRequest(
        "You already deleted your account."
      );
    }

    await this.apiKeyRepository.deleteByUserHashId(hashId);
    await this.historyRepository.deleteByUserHashId(hashId);
    await this.userRepository.deleteUser(hashId);
    reply.clearCookie("access_token");
  }

  /**
   * Authenticates a user with email and password, then sends the user data in the response.
   * @param request - The FastifyRequest object containing the user credentials.
   * @param reply - The FastifyReply object to modify.
   * @returns The authenticated user's information suitable for the response.
   * @throws {BadRequestError} If the user is not found or password is not required.
   * @throws {UnauthorizedError} If the password does not match.
   */
  async signIn(
    request: FastifyRequest<{ Body: Static<typeof UserLoginSchema> }>,
    reply: FastifyReply
  ): Promise<UserGetMeResponse> {
    const { email, password } = request.body;

    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw this.fastify.httpErrors.badRequest(
        "No user found with that email :("
      );
    }
    if (!user.password) {
      throw this.fastify.httpErrors.badRequest(
        "Your account doesn't require password. Please try a different method."
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw this.fastify.httpErrors.unauthorized(
        "Please check the password and try again"
      );
    }

    const { hashId, name, balance } = user;
    const accessToken = this.getAccessToken(
      this.fastify.httpErrors.internalServerError,
      { user: { hashId, name } }
    );
    return this.cookieReply(reply, accessToken, {
      hashId,
      name,
      email,
      balance,
    });
  }

  /**
   * Registers a new user and sends the user data in the response.
   * @param request - The FastifyRequest object containing the registration details.
   * @param reply - The FastifyReply object to modify.
   * @returns The newly registered user's information suitable for the response.
   * @throws {BadRequestError} If email is invalid, password is insecure, or email is already registered.
   */
  async signUp(
    request: FastifyRequest<{ Body: Static<typeof UserCreateSchema> }>,
    reply: FastifyReply
  ): Promise<UserGetMeResponse> {
    const { email, password, name } = request.body;

    if (!validateEmail(email)) {
      throw this.fastify.httpErrors.badRequest(
        "Please check the email and try again"
      );
    }
    if (!validatePassword(password)) {
      throw this.fastify.httpErrors.badRequest("Please use a secure password");
    }

    const existingUser = await this.userRepository.findUserByEmail(email);
    if (existingUser) {
      throw this.fastify.httpErrors.badRequest(
        "This email address is already signed up"
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await this.userRepository.createUser({
      email,
      password: hashedPassword,
      name,
      balance: 2.99,
    });

    const accessToken = this.getAccessToken(
      this.fastify.httpErrors.internalServerError,
      { user: { hashId: user.hashId, name } }
    );
    const me = { ...user, email, name };
    return this.cookieReply(reply, accessToken, me);
  }

  /**
   * Authenticates a user via Google OAuth and sends the user data in the response.
   * @param request - The FastifyRequest object containing the Google access token.
   * @param reply - The FastifyReply object to modify.
   * @returns The authenticated or newly registered user's information suitable for the response.
   * @throws {UnauthorizedError} If Google authentication fails.
   */
  async googleSignIn(
    request: FastifyRequest<{ Body: Static<typeof UserGoogleSchema> }>,
    reply: FastifyReply
  ): Promise<UserGetMeResponse> {
    const { access_token } = request.body;
    const endpoint = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`;

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw this.fastify.httpErrors.unauthorized(
        "Google login failed. Please try again."
      );
    }

    const userinfo = await response.json();
    const { name, email } = userinfo;

    if (!name || !email) {
      throw this.fastify.httpErrors.unauthorized(
        "Google login failed. Please try again."
      );
    }

    const sanitizedName = name.replace(/\s+/g, "");
    let user = await this.userRepository.findUserByEmail(email);

    if (user) {
      const accessToken = this.getAccessToken(
        this.fastify.httpErrors.internalServerError,
        { user: { hashId: user.hashId, name: user.name } }
      );
      return this.cookieReply(reply, accessToken, user);
    }

    const newUser = await this.userRepository.createUser({
      email,
      name: sanitizedName,
      balance: 2.99,
    });
    const accessToken = this.getAccessToken(
      this.fastify.httpErrors.internalServerError,
      { user: { hashId: newUser.hashId, name: sanitizedName } }
    );
    const me = { ...newUser, email, name: sanitizedName };
    return this.cookieReply(reply, accessToken, me);
  }

  /**
   * Updates the current user's name and sends the updated user data in the response.
   * @param request - The FastifyRequest object containing the user and update details.
   * @param reply - The FastifyReply object to modify.
   * @returns The updated user's information suitable for the response.
   * @throws {BadRequestError} If the user is not found.
   */
  async updateUser(
    request: FastifyRequest<{ Body: Static<typeof UserUpdateSchema> }>,
    reply: FastifyReply
  ): Promise<UserGetMeResponse> {
    const { user } = await this.fastify.getUser(request, reply);
    const { name } = request.body;

    const updatedUser = await this.userRepository.updateUserName(
      user.hashId,
      name
    );

    return updatedUser;
  }

  /**
   * Updates the current user's password after validating the old password.
   * @param request - The FastifyRequest object containing the user and password details.
   * @param reply - The FastifyReply object to modify.
   * @returns An object indicating the success of the operation.
   * @throws {BadRequestError} If passwords do not match, are insecure, or user is not found.
   * @throws {UnauthorizedError} If the old password does not match.
   */
  async updatePassword(
    request: FastifyRequest<{ Body: Static<typeof UserUpdatePasswordSchema> }>,
    reply: FastifyReply
  ): Promise<{ success: boolean }> {
    const {
      user: { hashId },
    } = await this.fastify.getUser(request, reply);
    const { oldPassword, newPassword, newPasswordRepeat } = request.body;

    if (newPassword !== newPasswordRepeat) {
      throw this.fastify.httpErrors.badRequest("New passwords don't match");
    }
    if (!validatePassword(newPassword)) {
      throw this.fastify.httpErrors.badRequest("Please use a secure password");
    }

    const user = await this.userRepository.findPasswordByHashId(hashId);
    if (!user) {
      throw this.fastify.httpErrors.badRequest("User isn't available");
    }
    if (!user.password) {
      throw this.fastify.httpErrors.badRequest(
        "Your account doesn't require a password."
      );
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw this.fastify.httpErrors.unauthorized(
        "Please check the original password and try again"
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.userRepository.updateUserPassword(hashId, hashedPassword);

    return { success: true };
  }
}
