import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  ChatCompletionResponse,
  ChatCompletionSchema,
} from "gpinterface-shared/type/chat";
import { ChatService } from "../../services/chat";
import { GpiHashIdParam } from "gpinterface-shared/type";
import { ApiKeyService } from "../../services/api-key";

export default async function chatRoutes(fastify: FastifyInstance) {
  // Initialize the ChatService and ApiKeyService with the Fastify instance
  const chatService = new ChatService(fastify);
  const apiKeyService = new ApiKeyService(fastify);

  /**
   * POST /:gpiHashId/completion
   * Handles a chat completion request.
   *
   * Params: gpiHashId - The identifier for the chat (Global Product Identifier)
   * Body: content - The chat message for which a completion is being generated
   */
  fastify.post<{
    Params: Static<typeof GpiHashIdParam>;
    Body: Static<typeof ChatCompletionSchema>;
  }>(
    "/:gpiHashId/completion",
    {
      schema: {
        params: GpiHashIdParam, // Validates the gpiHashId parameter
        body: ChatCompletionSchema, // Validates the request body containing chat content
      },
    },
    async (request, reply): Promise<ChatCompletionResponse> => {
      // Retrieve the user's hashId using the ApiKeyService
      const userHashId = await apiKeyService.getUserHashId(request);

      // Extract the gpiHashId from request params and the content from the request body
      const { gpiHashId } = request.params;
      const { content } = request.body;

      // Create a chat completion using the chatService
      return chatService.createCompletion(gpiHashId, userHashId, content);
    }
  );
}
