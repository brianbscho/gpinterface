import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  ChatCompletionResponse,
  ChatCompletionSchema,
} from "gpinterface-shared/type/chat";
import { ChatService } from "../../services/chat";
import { GpiHashIdParam } from "gpinterface-shared/type";
import { ApiKeyService } from "../../services/api-key";

export default async function (fastify: FastifyInstance) {
  const chatService = new ChatService(fastify);
  const apiKeyService = new ApiKeyService(fastify);

  fastify.post<{
    Params: Static<typeof GpiHashIdParam>;
    Body: Static<typeof ChatCompletionSchema>;
  }>(
    "/:gpiHashId/completion",
    { schema: { params: GpiHashIdParam, body: ChatCompletionSchema } },
    async (request, reply): Promise<ChatCompletionResponse> => {
      const userHashId = await apiKeyService.getUserHashId(request);
      const { gpiHashId } = request.params;
      const { content } = request.body;

      return chatService.createCompletion(gpiHashId, userHashId, content);
    }
  );
}
