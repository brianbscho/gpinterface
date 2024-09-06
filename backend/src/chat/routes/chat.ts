import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getApiKey } from "../controllers/apiKey";
import {
  ChatCompletionResponse,
  ChatCompletionSchema,
} from "gpinterface-shared/type/chat";
import { createChatCompletion } from "../controllers/chat";
import { GpiHashIdParam } from "gpinterface-shared/type";

export default async function (fastify: FastifyInstance) {
  fastify.post<{
    Params: Static<typeof GpiHashIdParam>;
    Body: Static<typeof ChatCompletionSchema>;
  }>(
    "/:gpiHashId/completion",
    { schema: { params: GpiHashIdParam, body: ChatCompletionSchema } },
    async (request, reply): Promise<ChatCompletionResponse> => {
      try {
        const userHashId = await getApiKey(fastify, request);
        const { gpiHashId } = request.params;
        const { content } = request.body;

        return createChatCompletion({
          fastify,
          gpiHashId,
          userContent: content,
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
