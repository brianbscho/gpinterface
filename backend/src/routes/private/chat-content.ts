import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { ChatContentsDeleteSchema } from "gpinterface-shared/type/chat-content";
import { DeleteResponse } from "gpinterface-shared/type";
import {
  ChatContent,
  ChatContentRefreshSchema,
  ChatContentUpdateResponse,
} from "gpinterface-shared/type/chat-content";
import { HashIdParam } from "gpinterface-shared/type";
import { ChatCompletionSchema } from "gpinterface-shared/type/chat";
import { ChatContentService } from "../../services/chat-content";

export default async function (fastify: FastifyInstance) {
  // Initialize the ChatContent service with the Fastify instance.
  const chatContentService = new ChatContentService(fastify);

  /**
   * Route: DELETE /
   * Purpose: Deletes a set of chat contents based on their hashIds.
   * Body Params: ChatContentsDeleteSchema - Contains the hashIds of chat contents to delete.
   * Response: DeleteResponse - Confirmation of the deleted contents.
   */
  fastify.delete<{ Body: Static<typeof ChatContentsDeleteSchema> }>(
    "/",
    { schema: { body: ChatContentsDeleteSchema } },
    async (request, reply): Promise<DeleteResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { hashIds } = request.body;

      // Call the service to delete chat contents by their hashIds and the user's hashId.
      return chatContentService.delete(hashIds, user.hashId);
    }
  );

  /**
   * Route: PATCH /:hashId
   * Purpose: Updates a specific chat content.
   * Params: hashId - Identifier of the chat content to update.
   * Body Params: ChatCompletionSchema - Contains the content to update.
   * Response: ChatContentUpdateResponse - The updated chat content response.
   */
  fastify.patch<{
    Params: Static<typeof HashIdParam>;
    Body: Static<typeof ChatCompletionSchema>;
  }>(
    "/:hashId",
    { schema: { params: HashIdParam, body: ChatCompletionSchema } },
    async (request, reply): Promise<ChatContentUpdateResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { hashId } = request.params;
      const { content } = request.body;

      // Call the service to patch the chat content with the given hashId.
      return chatContentService.patch(hashId, user.hashId, content);
    }
  );

  /**
   * Route: PATCH /:hashId/refresh
   * Purpose: Refreshes a specific chat content with new model configuration.
   * Params: hashId - Identifier of the chat content to refresh.
   * Body Params: ChatContentRefreshSchema - Contains the new modelHashId and configuration.
   * Response: ChatContent - The refreshed chat content.
   */
  fastify.patch<{
    Params: Static<typeof HashIdParam>;
    Body: Static<typeof ChatContentRefreshSchema>;
  }>(
    "/:hashId/refresh",
    { schema: { params: HashIdParam, body: ChatContentRefreshSchema } },
    async (request, reply): Promise<ChatContent> => {
      const { user } = await fastify.getUser(request, reply);
      const { hashId } = request.params;
      const { modelHashId, config } = request.body;

      // Call the service to refresh the chat content with the new model configuration.
      return chatContentService.refresh(
        hashId,
        user.hashId,
        modelHashId,
        config
      );
    }
  );
}
