import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  ChatCompletionResponse,
  ChatCompletionSchema,
} from "gpinterface-shared/type/chat";
import { createChatCompletion } from "../../services/chat";
import { GpiHashIdParam } from "gpinterface-shared/type";
import { ApiKeyService } from "../../services/api-key";

export default async function (fastify: FastifyInstance) {
  const apiKeyService = new ApiKeyService(fastify);

  fastify.post<{
    Params: Static<typeof GpiHashIdParam>;
    Body: Static<typeof ChatCompletionSchema>;
  }>(
    "/:gpiHashId/completion",
    { schema: { params: GpiHashIdParam, body: ChatCompletionSchema } },
    async (request, reply): Promise<ChatCompletionResponse> => {
      try {
        const userHashId = await apiKeyService.getUserHashId(request);
        const { gpiHashId } = request.params;
        const { content } = request.body;

        return createChatCompletion({
          fastify,
          gpiHashId,
          content,
          userHashId,
        });
      } catch (ex) {
        console.error(
          "path: /chat/:gpiHashId/completion, method: post, error:",
          ex
        );
        throw ex;
      }
    }
  );
}
