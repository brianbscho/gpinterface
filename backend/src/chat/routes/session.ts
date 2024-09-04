import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getApiKey } from "../controllers/apiKey";
import {
  SessionCompletionResponse,
  SessionCompletionSchema,
  SessionCreateResponse,
  SessionCreateSchema,
  SessionMessagesGetResponse,
  SessionMessagesGetSchema,
} from "gpinterface-shared/type/session";
import {
  createSession,
  createSessionCompletion,
  getSessionMessages,
} from "../controllers/session";

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Static<typeof SessionCreateSchema> }>(
    "/",
    { schema: { body: SessionCreateSchema } },
    async (request, reply): Promise<SessionCreateResponse> => {
      try {
        const userHashId = await getApiKey(fastify, request);
        const { gpiHashId } = request.body;

        const session = await createSession({ fastify, userHashId, gpiHashId });
        return session;
      } catch (ex) {
        console.error("path: /session, method: post, error:", ex);
        throw ex;
      }
    }
  );
  fastify.post<{ Body: Static<typeof SessionCompletionSchema> }>(
    "/completion",
    { schema: { body: SessionCompletionSchema } },
    async (request, reply): Promise<SessionCompletionResponse> => {
      try {
        const userHashId = await getApiKey(fastify, request);
        const { body } = request;

        const content = await createSessionCompletion({
          fastify,
          userHashId,
          body,
        });
        return { content };
      } catch (ex) {
        console.error("path: /session/completion, method: post, error:", ex);
        throw ex;
      }
    }
  );
  fastify.get<{ Params: Static<typeof SessionMessagesGetSchema> }>(
    "/:sessionHashId/messages",
    { schema: { params: SessionMessagesGetSchema } },
    async (request, reply): Promise<SessionMessagesGetResponse> => {
      try {
        const userHashId = await getApiKey(fastify, request);
        const { sessionHashId } = request.params;

        const messages = await getSessionMessages({
          fastify,
          userHashId,
          sessionHashId,
        });
        return messages;
      } catch (ex) {
        console.error(
          "path: /session/:sessionHashId/messages, method: get, error:",
          ex
        );
        throw ex;
      }
    }
  );
}
