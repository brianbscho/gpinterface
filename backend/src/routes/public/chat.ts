import { FastifyInstance } from "fastify";
import {
  ChatCompletionSchema,
  ChatCompletionResponse,
} from "gpinterface-shared/type/chat";
import { Static } from "@sinclair/typebox";
import { GpiHashIdParam } from "gpinterface-shared/type";
import { ChatService } from "../../services/chat";

export default async function (fastify: FastifyInstance) {
  const chatService = new ChatService(fastify);

  fastify.post<{
    Params: Static<typeof GpiHashIdParam>;
    Body: Static<typeof ChatCompletionSchema>;
  }>(
    "/:gpiHashId/completion",
    { schema: { params: GpiHashIdParam, body: ChatCompletionSchema } },
    async (request, reply): Promise<ChatCompletionResponse> => {
      const { user } = await fastify.getUser(request, reply, true);
      const { gpiHashId } = request.params;
      const { content } = request.body;

      return chatService.createCompletion(gpiHashId, user.hashId, content);
    }
  );
}
