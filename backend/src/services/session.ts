import { FastifyInstance } from "fastify";
import { SessionRepository } from "../repositories/session";
import { getTextResponse } from "../util/text";
import { GpiRepository } from "../repositories/gpi";
import { SessionMessageRepository } from "../repositories/session-message";
import { Prisma } from "@prisma/client";
import { HistoryRepository } from "../repositories/history";
import { UserRepository } from "../repositories/user";
import { ModelService } from "./model";

/**
 * Service class responsible for handling session-related business logic.
 */
export class SessionService {
  private historyRepository: HistoryRepository;
  private sessionRepository: SessionRepository;
  private sessionMessageRepository: SessionMessageRepository;
  private gpiRepository: GpiRepository;
  private userRepository: UserRepository;
  private modelService: ModelService;

  /**
   * Initializes the SessionService with necessary repositories and services.
   * @param fastify - The FastifyInstance for accessing Prisma and HTTP errors.
   */
  constructor(private fastify: FastifyInstance) {
    this.historyRepository = new HistoryRepository(fastify.prisma.history);
    this.sessionRepository = new SessionRepository(fastify.prisma.session);
    this.sessionMessageRepository = new SessionMessageRepository(
      fastify.prisma.sessionMessage
    );
    this.gpiRepository = new GpiRepository(fastify.prisma.gpi);
    this.userRepository = new UserRepository(fastify.prisma.user);
    this.modelService = new ModelService(fastify);
  }

  /**
   * Creates a new session for a given GPI hash ID and user hash ID.
   * @param gpiHashId - The hash ID of the GPI.
   * @param userHashId - The hash ID of the user (nullable).
   * @returns The created session object.
   * @throws {BadRequestError} If the GPI hash ID is invalid or not accessible by the user.
   */
  create = async (gpiHashId: string, userHashId: string | null) => {
    // Validate and find the GPI
    await this.gpiRepository.findGpiByHashId(gpiHashId, userHashId, true);

    // Create a new session
    const session = await this.sessionRepository.createSession(gpiHashId);
    return session;
  };

  /**
   * Creates a completion within a session by processing user input and generating a response.
   * @param userHashId - The hash ID of the user (nullable).
   * @param sessionHashId - The hash ID of the session.
   * @param content - The content provided by the user.
   * @returns An object containing the generated response content.
   * @throws {BadRequestError} If the input content is empty or invalid.
   * @throws {BadRequestError} If the session is not found.
   * @throws {BadRequestError} If the user balance is insufficient.
   */
  createCompletion = async (
    userHashId: string | null,
    sessionHashId: string,
    content: string
  ): Promise<{ content: string }> => {
    // Validate content
    if (content.trim() === "") {
      throw this.fastify.httpErrors.badRequest("Empty content");
    }

    // Find the session
    const session = await this.sessionRepository.findSessionByHashId(
      sessionHashId,
      userHashId
    );
    if (!session) {
      throw this.fastify.httpErrors.badRequest("Session not found");
    }

    // Check if model is available
    await this.modelService.checkAvailable(session.gpi.model, userHashId);

    const { gpi } = session;
    const { systemMessage, config, model } = gpi;

    // Compile messages for the model
    const messages = [
      ...gpi.chatContents,
      ...session.messages,
      { role: "user", content },
    ];

    // Get response from the model
    const response = await getTextResponse({
      model,
      systemMessage,
      config: config as any,
      messages,
    });

    // Create session messages
    await this.sessionMessageRepository.createUserAndAssistantMessages(
      sessionHashId,
      content,
      response.content
    );

    // Calculate payment
    const paid = session.gpi.model.isFree ? 0 : response.price;

    // Create history record
    await this.historyRepository.createHistory({
      userHashId,
      gpiHashId: session.gpi.hashId,
      sessionHashId,
      provider: model.provider.name,
      model: model.name,
      config: config ?? Prisma.JsonNull,
      messages,
      paid,
      ...response,
    });

    // Update user balance if applicable
    if (userHashId) {
      await this.userRepository.updateUserBalanceByHashId(userHashId, {
        decrement: paid,
      });
    }

    return { content: response.content };
  };

  /**
   * Retrieves messages for a given session.
   * @param sessionHashId - The hash ID of the session.
   * @param userHashId - The hash ID of the user (nullable).
   * @returns An array of messages associated with the session.
   */
  getMessages = async (
    sessionHashId: string,
    userHashId: string | null
  ): Promise<{ role: string; content: string }[]> => {
    // Retrieve messages from the repository
    const messages = await this.sessionRepository.getSessionMessages(
      sessionHashId,
      userHashId
    );
    return messages;
  };
}
