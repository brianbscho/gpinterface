import { FastifyInstance } from "fastify";
import { Prisma } from "@prisma/client";

import { GpiRepository } from "../repositories/gpi";
import { HistoryRepository } from "../repositories/history";
import { UserRepository } from "../repositories/user";
import { ModelService } from "./model";
import { getTextResponse } from "../util/text";

/**
 * Service class responsible for handling chat-related business logic.
 */
export class ChatService {
  private gpiRepository: GpiRepository;
  private historyRepository: HistoryRepository;
  private userRepository: UserRepository;
  private modelService: ModelService;

  /**
   * Initializes the ChatService with necessary repositories and services.
   * @param fastify - The FastifyInstance for accessing Prisma and HTTP errors.
   */
  constructor(private fastify: FastifyInstance) {
    this.gpiRepository = new GpiRepository(fastify.prisma.gpi);
    this.historyRepository = new HistoryRepository(fastify.prisma.history);
    this.userRepository = new UserRepository(fastify.prisma.user);
    this.modelService = new ModelService(fastify);
  }

  /**
   * Creates a completion within a GPI session by processing user input and generating a response.
   * @param gpiHashId - The hash ID of the GPI.
   * @param userHashId - The hash ID of the user (nullable).
   * @param content - The content provided by the user.
   * @returns An object containing the generated response content.
   * @throws {BadRequestError} If the input content is empty.
   * @throws {NotFoundError} If the GPI is not found.
   * @throws {InsufficientBalanceError} If the user does not have enough balance.
   * @throws {Error} For any other unexpected errors.
   */
  createCompletion = async (
    gpiHashId: string,
    userHashId: string | null,
    content: string
  ): Promise<{ content: string }> => {
    try {
      // Validate content
      if (content.trim() === "") {
        throw this.fastify.httpErrors.badRequest("Empty content");
      }

      // Retrieve the GPI by hash ID and user hash ID
      const gpi = await this.gpiRepository.findGpiByHashId(
        gpiHashId,
        userHashId
      );
      if (!gpi) {
        throw this.fastify.httpErrors.notFound("GPI not found.");
      }

      // Check if the model is available for the user
      await this.modelService.checkAvailable(gpi.model, userHashId);

      const { systemMessage, chatContents, config, model } = gpi;

      // Compile messages for the model by appending the user's content
      const messages = [...chatContents, { role: "user", content }];

      // Generate a response from the model
      const response = await getTextResponse({
        model,
        systemMessage,
        config: config as any, // Consider defining a proper type instead of 'any'
        messages,
      });

      // Determine the payment required based on the model's pricing
      const paid = gpi.model.isFree ? 0 : response.price;

      // Create a history record of this interaction
      await this.historyRepository.createHistory({
        userHashId,
        gpiHashId,
        provider: model.provider.name,
        model: model.name,
        config: config || Prisma.JsonNull,
        messages: systemMessage
          ? [{ role: "system", content: systemMessage }, ...messages]
          : messages,
        ...response,
      });

      // Update the user's balance if applicable
      if (userHashId) {
        await this.userRepository.updateUserBalanceByHashId(userHashId, {
          decrement: paid,
        });
      }

      // Return the generated content
      return { content: response.content };
    } catch (error) {
      // Re-throw known HTTP errors
      if (
        error instanceof this.fastify.httpErrors.badRequest ||
        error instanceof this.fastify.httpErrors.notFound
      ) {
        throw error;
      }

      // Throw a generic internal server error
      throw this.fastify.httpErrors.internalServerError(
        "An unexpected error occurred."
      );
    }
  };
}
