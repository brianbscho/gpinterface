import { FastifyInstance } from "fastify";
import {
  ChatCompletionSchema,
  ChatCompletionResponse,
} from "gpinterface-shared/type/chat";
import { Static } from "@sinclair/typebox";
import { createChatCompletion } from "../chat/controllers/chat";

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Static<typeof ChatCompletionSchema> }>(
    "/completion",
    { schema: { body: ChatCompletionSchema } },
    async (request, reply): Promise<ChatCompletionResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { body } = request;

        const content = await createChatCompletion({
          fastify,
          body,
          userHashId: user.hashId || null,
        });

        return { content };
      } catch (ex) {
        console.error("path: /chat/completion, method: post, error:", ex);
        throw ex;
      }
    }
  );
}
