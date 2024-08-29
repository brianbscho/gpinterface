import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getApiKey } from "../controllers/apiKey";
import {
  ChatCompletionResponse,
  ChatCompletionSchema,
} from "gpinterface-shared/type/chat";
import { createChatCompletion } from "../controllers/chat";

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Static<typeof ChatCompletionSchema> }>(
    "/completion",
    { schema: { body: ChatCompletionSchema } },
    async (request, reply): Promise<ChatCompletionResponse> => {
      try {
        const userHashId = await getApiKey(fastify, request);
        const { body } = request;

        const content = await createChatCompletion({
          fastify,
          body,
          userHashId,
        });

        return { content };
      } catch (ex) {
        console.error("path: /chat/completion, method: post, error:", ex);
        throw ex;
      }
    }
  );
}
