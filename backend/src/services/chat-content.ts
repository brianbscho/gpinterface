import { FastifyInstance } from "fastify";
import { Prisma } from "@prisma/client";

import { GpiRepository } from "../repositories/gpi";
import { ChatContentRepository } from "../repositories/chat-content";
import { ModelRepository } from "../repositories/model";
import { HistoryRepository } from "../repositories/history";
import { UserRepository } from "../repositories/user";

import { ModelService } from "./model";
import { getTextResponse } from "../util/text";
import {
  getTypedContent,
  getTypedContents,
  getTypedHistory,
} from "../util/prisma";

/**
 * Service class responsible for handling chat content-related business logic.
 */
export class ChatContentService {
  private chatContentRepository: ChatContentRepository;
  private gpiRepository: GpiRepository;
  private modelRepository: ModelRepository;
  private modelService: ModelService;
  private historyRepository: HistoryRepository;
  private userRepository: UserRepository;

  /**
   * Initializes the ChatContentService with necessary repositories and services.
   * @param fastify - The FastifyInstance for accessing Prisma and HTTP errors.
   */
  constructor(private fastify: FastifyInstance) {
    this.chatContentRepository = new ChatContentRepository(
      fastify.prisma.chatContent
    );
    this.gpiRepository = new GpiRepository(fastify.prisma.gpi);
    this.modelRepository = new ModelRepository(fastify.prisma.model);
    this.modelService = new ModelService(fastify);
    this.historyRepository = new HistoryRepository(fastify.prisma.history);
    this.userRepository = new UserRepository(fastify.prisma.user);
  }

  /**
   * Updates the content of a specific chat content entry.
   * @param hashId - The hash ID of the chat content to update.
   * @param userHashId - The hash ID of the user.
   * @param content - The new content to set.
   * @returns An object containing the updated hash ID, content, and modification status.
   * @throws {Error} For any other unexpected errors.
   */
  patch = async (
    hashId: string,
    userHashId: string,
    content: string
  ): Promise<{ hashId: string; content: string; isModified: boolean }> => {
    try {
      // Retrieve the existing chat content
      const oldContent =
        await this.chatContentRepository.findChatContentByHashId(
          hashId,
          userHashId
        );

      // Determine if the content has been modified
      const isModified =
        oldContent.role !== "user" && Boolean(oldContent.modelHashId);

      // Update the chat content
      await this.chatContentRepository.updateChatContent(
        hashId,
        content,
        isModified
      );

      // Update the GPI's updatedAt timestamp
      await this.gpiRepository.updateGpiTimestamp(oldContent.gpiHashId);

      return { hashId, content, isModified };
    } catch (error) {
      // Log unexpected errors for debugging
      this.fastify.log.error(`Error in patch: ${(error as Error).message}`);

      // Re-throw known HTTP errors
      if (error instanceof this.fastify.httpErrors.badRequest) {
        throw error;
      }

      // Throw a generic internal server error for unexpected issues
      throw this.fastify.httpErrors.internalServerError(
        "An unexpected error occurred."
      );
    }
  };

  /**
   * Creates empty chat content entries for a specific GPI and user.
   * @param gpiHashId - The hash ID of the GPI.
   * @param userHashId - The hash ID of the user.
   * @returns An array of typed chat content objects.
   * @throws {ForbiddenError} If the GPI is not accessible by the user.
   * @throws {Error} For any other unexpected errors.
   */
  createEmpty = async (
    gpiHashId: string,
    userHashId: string
  ): Promise<any[]> => {
    try {
      // Check if the GPI is accessible by the user
      await this.gpiRepository.checkGpiAccessibility(gpiHashId, userHashId);

      // Create empty user and assistant chat contents
      const chatContents =
        await this.chatContentRepository.createChatContentsAndReturn([
          {
            gpiHashId,
            role: "user",
            content: "",
            isDeployed: false,
          },
          {
            gpiHashId,
            role: "assistant",
            content: "",
            isDeployed: false,
          },
        ]);

      // Update the GPI's updatedAt timestamp
      await this.gpiRepository.updateGpiTimestamp(gpiHashId);

      // Return the typed chat contents
      return getTypedContents(chatContents);
    } catch (error) {
      // Log unexpected errors for debugging
      this.fastify.log.error(
        `Error in createEmpty: ${(error as Error).message}`
      );

      // Re-throw known HTTP errors
      if (error instanceof this.fastify.httpErrors.forbidden) {
        throw error;
      }

      // Throw a generic internal server error for unexpected issues
      throw this.fastify.httpErrors.internalServerError(
        "An unexpected error occurred."
      );
    }
  };

  /**
   * Creates a completion within a GPI session by processing user input and generating a response.
   * @param gpiHashId - The hash ID of the GPI.
   * @param userHashId - The hash ID of the user.
   * @param modelHashId - The hash ID of the model to use.
   * @param config - The configuration for the model.
   * @param content - The content provided by the user.
   * @returns An array containing the user's chat content and the assistant's chat content with history.
   * @throws {badRequestError} If the input content is empty.
   * @throws {InsufficientBalanceError} If the user does not have enough balance.
   * @throws {Error} For any other unexpected errors.
   */
  createCompletion = async (
    gpiHashId: string,
    userHashId: string,
    modelHashId: string,
    config: any,
    content: string
  ) => {
    try {
      // Retrieve the model by hash ID
      const model = await this.modelRepository.findModelByHashId(modelHashId);

      // Check if the model is available for the user
      await this.modelService.checkAvailable(model, userHashId);

      // Retrieve the GPI by hash ID and user hash ID, ensuring it's active
      const gpi = await this.gpiRepository.findGpiByHashId(
        gpiHashId,
        userHashId,
        true
      );
      if (!gpi) {
      }

      const { systemMessage, chatContents } = gpi;

      // Compile messages for the model by appending the user's content
      const messages = [...chatContents, { role: "user", content }];

      // Generate a response from the model
      const response = await getTextResponse({
        model,
        systemMessage,
        config,
        messages,
      });

      // Determine the payment required based on the model's pricing
      const paid = model.isFree ? 0 : response.price;

      // Create user and assistant chat contents
      const [userChatContent, assistantChatContent] =
        await this.chatContentRepository.createChatContentsAndReturn([
          {
            role: "user",
            content,
            gpiHashId,
            isDeployed: false,
          },
          {
            modelHashId,
            config,
            role: "assistant",
            content: response.content,
            gpiHashId,
            isDeployed: false,
          },
        ]);

      // Create a history record of this interaction
      const history = await this.historyRepository.createHistory({
        userHashId,
        gpiHashId,
        chatContentHashId: assistantChatContent.hashId,
        provider: model.provider.name,
        model: model.name,
        config: config,
        messages: systemMessage
          ? [{ role: "system", content: systemMessage }, ...messages]
          : messages,
        paid,
        ...response,
      });

      // Update the GPI's updatedAt timestamp
      await this.gpiRepository.updateGpiTimestamp(gpiHashId);

      // Update the user's balance if applicable
      if (paid > 0) {
        await this.userRepository.updateUserBalanceByHashId(userHashId, {
          decrement: paid,
        });
      }

      // Return the typed chat contents with history
      return [
        getTypedContent(userChatContent),
        {
          ...getTypedContent(assistantChatContent),
          history: getTypedHistory(history),
        },
      ];
    } catch (error) {
      // Log unexpected errors for debugging
      this.fastify.log.error(
        `Error in createCompletion: ${(error as Error).message}`
      );

      // Re-throw known HTTP errors
      if (
        error instanceof this.fastify.httpErrors.badRequest ||
        error instanceof this.fastify.httpErrors.forbidden
      ) {
        throw error;
      }

      // Throw a generic internal server error for unexpected issues
      throw this.fastify.httpErrors.internalServerError(
        "An unexpected error occurred."
      );
    }
  };

  /**
   * Refreshes the content of a specific chat content entry by generating a new response.
   * @param hashId - The hash ID of the chat content to refresh.
   * @param userHashId - The hash ID of the user.
   * @param modelHashId - The hash ID of the model to use.
   * @param config - The configuration for the model.
   * @returns The refreshed chat content with history.
   * @throws {InsufficientBalanceError} If the user does not have enough balance.
   * @throws {Error} For any other unexpected errors.
   */
  refresh = async (
    hashId: string,
    userHashId: string,
    modelHashId: string,
    config: any
  ): Promise<any> => {
    try {
      // Retrieve the model by hash ID
      const model = await this.modelRepository.findModelByHashId(modelHashId);

      // Check if the model is available for the user
      await this.modelService.checkAvailable(model, userHashId);

      // Retrieve the GPI associated with the chat content
      const gpi = await this.chatContentRepository.getGpiByHashId(
        hashId,
        userHashId
      );
      if (!gpi) {
      }

      // Retrieve the messages for the GPI
      const messages = await this.chatContentRepository.getMessages(
        gpi.hashId,
        hashId
      );

      const { systemMessage } = gpi;

      // Generate a new response from the model
      const response = await getTextResponse({
        model,
        systemMessage,
        config,
        messages,
      });

      // Determine the payment required based on the model's pricing
      const paid = model.isFree ? 0 : response.price;

      // Create a history record of this interaction
      const history = await this.historyRepository.createHistory({
        userHashId,
        gpiHashId: gpi.hashId,
        chatContentHashId: hashId,
        provider: model.provider.name,
        model: model.name,
        config,
        messages: systemMessage
          ? [{ role: "system", content: systemMessage }, ...messages]
          : messages,
        paid,
        ...response,
      });

      // Update the chat content with the new response and connect the history
      const newContent =
        await this.chatContentRepository.clearAndUpdateHistories(hashId, {
          content: response.content,
          config,
          modelHashId,
          isModified: false,
          histories: { connect: { hashId: history.hashId } },
        });

      // Update the GPI's updatedAt timestamp
      await this.gpiRepository.updateGpiTimestamp(gpi.hashId);

      // Update the user's balance if applicable
      if (paid > 0) {
        await this.userRepository.updateUserBalanceByHashId(userHashId, {
          decrement: paid,
        });
      }

      // Return the refreshed chat content with history
      return getTypedContent({
        history: getTypedHistory(history),
        ...newContent,
      });
    } catch (error) {
      // Log unexpected errors for debugging
      this.fastify.log.error(`Error in refresh: ${(error as Error).message}`);

      // Re-throw known HTTP errors
      if (
        error instanceof this.fastify.httpErrors.badRequest ||
        error instanceof this.fastify.httpErrors.forbidden
      ) {
        throw error;
      }

      // Throw a generic internal server error for unexpected issues
      throw this.fastify.httpErrors.internalServerError(
        "An unexpected error occurred."
      );
    }
  };

  /**
   * Deletes multiple chat content entries belonging to a user.
   * @param hashIds - An array of hash IDs of the chat contents to delete.
   * @param userHashId - The hash ID of the user.
   * @returns An object containing the deleted hash IDs.
   * @throws {badRequestError} If no hash IDs are provided for deletion.
   * @throws {Error} For any other unexpected errors.
   */
  delete = async (
    hashIds: string[],
    userHashId: string
  ): Promise<{ hashIds: string[] }> => {
    try {
      // Validate that there are hash IDs to delete
      if (hashIds.length === 0) {
        throw this.fastify.httpErrors.badRequest("Nothing to delete.");
      }

      // Delete the chat contents and retrieve the associated GPI hash ID
      const gpiHashId =
        await this.chatContentRepository.deleteChatContentsByHashIds(
          hashIds,
          userHashId
        );

      // Update the GPI's updatedAt timestamp
      await this.gpiRepository.updateGpiTimestamp(gpiHashId);

      return { hashIds };
    } catch (error) {
      // Log unexpected errors for debugging
      this.fastify.log.error(`Error in delete: ${(error as Error).message}`);

      // Re-throw known HTTP errors
      if (error instanceof this.fastify.httpErrors.badRequest) {
        throw error;
      }

      // Throw a generic internal server error for unexpected issues
      throw this.fastify.httpErrors.internalServerError(
        "An unexpected error occurred."
      );
    }
  };
}
