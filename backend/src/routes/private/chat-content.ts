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
  const chatContentService = new ChatContentService(fastify);

  fastify.delete<{ Body: Static<typeof ChatContentsDeleteSchema> }>(
    "/",
    { schema: { body: ChatContentsDeleteSchema } },
    async (request, reply): Promise<DeleteResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { hashIds } = request.body;

      return chatContentService.delete(hashIds, user.hashId);
    }
  );
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

      return chatContentService.patch(hashId, user.hashId, content);
    }
  );
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

      return chatContentService.refresh(
        hashId,
        user.hashId,
        modelHashId,
        config
      );
    }
  );
}
