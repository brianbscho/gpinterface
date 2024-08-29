import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
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
} from "../chat/controllers/session";

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Static<typeof SessionCreateSchema> }>(
    "/",
    { schema: { body: SessionCreateSchema } },
    async (request, reply): Promise<SessionCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { gpiHashId } = request.body;

        const session = await createSession({
          fastify,
          userHashId: user.hashId || null,
          gpiHashId,
        });
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
        const { user } = await fastify.getUser(request, reply, true);
        const { body } = request;

        const content = await createSessionCompletion({
          fastify,
          userHashId: user.hashId || null,
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
        const { user } = await fastify.getUser(request, reply, true);
        const { sessionHashId } = request.params;

        const session = await getSessionMessages({
          fastify,
          userHashId: user.hashId || null,
          sessionHashId,
        });
        return session;
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
