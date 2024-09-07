import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  SessionCreateResponse,
  SessionMessagesGetResponse,
} from "gpinterface-shared/type/session";
import {
  createSession,
  createSessionCompletion,
  getSessionMessages,
} from "../../chat/controllers/session";
import {
  ChatCompletionResponse,
  ChatCompletionSchema,
} from "gpinterface-shared/type/chat";
import { GpiHashIdParam, SessionHashIdParam } from "gpinterface-shared/type";

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Static<typeof GpiHashIdParam> }>(
    "/",
    { schema: { body: GpiHashIdParam } },
    async (request, reply): Promise<SessionCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { gpiHashId } = request.body;

        return createSession({
          fastify,
          userHashId: user.hashId || null,
          gpiHashId,
        });
      } catch (ex) {
        console.error("path: /session, method: post, error:", ex);
        throw ex;
      }
    }
  );
  fastify.post<{
    Params: Static<typeof SessionHashIdParam>;
    Body: Static<typeof ChatCompletionSchema>;
  }>(
    "/:sessionHashId/completion",
    { schema: { params: SessionHashIdParam, body: ChatCompletionSchema } },
    async (request, reply): Promise<ChatCompletionResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { sessionHashId } = request.params;
        const { content } = request.body;
        if (content.trim() === "") {
          throw fastify.httpErrors.badRequest("Empty content");
        }

        return createSessionCompletion({
          fastify,
          userHashId: user.hashId || null,
          sessionHashId,
          content,
        });
      } catch (ex) {
        console.error(
          "path: /session/:sessionHashId/completion, method: post, error:",
          ex
        );
        throw ex;
      }
    }
  );
  fastify.get<{ Params: Static<typeof SessionHashIdParam> }>(
    "/:sessionHashId/messages",
    { schema: { params: SessionHashIdParam } },
    async (request, reply): Promise<SessionMessagesGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { sessionHashId } = request.params;

        return getSessionMessages({
          fastify,
          userHashId: user.hashId || null,
          sessionHashId,
        });
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
