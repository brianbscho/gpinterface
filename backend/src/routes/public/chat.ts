import { FastifyInstance } from "fastify";
import {
  ChatCompletionSchema,
  ChatCompletionResponse,
} from "gpinterface-shared/type/chat";
import { Static } from "@sinclair/typebox";
import { GpiHashIdParam } from "gpinterface-shared/type";
import { ChatService } from "../../services/chat";

export default async function (fastify: FastifyInstance) {
  // Initialize the chat service with the Fastify instance.
  const chatService = new ChatService(fastify);

  /**
   * Route: POST /:gpiHashId/completion
   * Purpose: Creates a chat completion for a specific GPI (General Product Information) item.
   * Params: `gpiHashId` - The unique identifier for the GPI.
   * Body Params: `content` - The content for the chat completion.
   * Response: ChatCompletionResponse - Contains the result of the chat completion.
   */
  fastify.post<{
    Params: Static<typeof GpiHashIdParam>;
    Body: Static<typeof ChatCompletionSchema>;
  }>(
    "/:gpiHashId/completion",
    { schema: { params: GpiHashIdParam, body: ChatCompletionSchema } },
    async (request, reply): Promise<ChatCompletionResponse> => {
      const { user } = await fastify.getUser(request, reply, true); // Optionally authenticate the user
      const { gpiHashId } = request.params; // Extract GPI hashId from the request parameters
      const { content } = request.body; // Extract chat content from the request body

      // Create the chat completion by passing the gpiHashId, user's hashId, and the chat content
      return chatService.createCompletion(gpiHashId, user.hashId, content);
    }
  );
}
