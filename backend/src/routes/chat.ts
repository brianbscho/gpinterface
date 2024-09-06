import { FastifyInstance } from "fastify";
import {
  ChatCompletionSchema,
  ChatCompletionResponse,
  ChatCompletionSampleResponse,
} from "gpinterface-shared/type/chat";
import { Static } from "@sinclair/typebox";
import { createChatCompletion } from "../chat/controllers/chat";
import {
  createSession,
  createSessionCompletion,
} from "../chat/controllers/session";

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
  fastify.post<{ Body: Static<typeof ChatCompletionSchema> }>(
    "/completion/sample",
    { schema: { body: ChatCompletionSchema } },
    async (request, reply): Promise<ChatCompletionSampleResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { body } = request;

        const { hashId: sessionHashId } = await createSession({
          fastify,
          userHashId: user.hashId || null,
          gpiHashId: body.gpiHashId,
        });
        const content = await createSessionCompletion({
          fastify,
          userHashId: user.hashId || null,
          body: { sessionHashId, content: body.content },
        });

        return { content, sessionHashId };
      } catch (ex) {
        console.error(
          "path: /chat/completion/sample, method: post, error:",
          ex
        );
        throw ex;
      }
    }
  );
}
