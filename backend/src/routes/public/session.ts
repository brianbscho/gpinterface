import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { SessionService } from "../../services/session";
import {
  SessionCreateResponse,
  SessionMessagesGetResponse,
} from "gpinterface-shared/type/session";
import {
  ChatCompletionResponse,
  ChatCompletionSchema,
} from "gpinterface-shared/type/chat";
import { GpiHashIdParam, SessionHashIdParam } from "gpinterface-shared/type";

export default async function (fastify: FastifyInstance) {
  const sessionService = new SessionService(fastify);

  fastify.post<{ Body: Static<typeof GpiHashIdParam> }>(
    "/",
    { schema: { body: GpiHashIdParam } },
    async (request, reply): Promise<SessionCreateResponse> => {
      const { user } = await fastify.getUser(request, reply, true);
      const { gpiHashId } = request.body;
      return sessionService.create(gpiHashId, user.hashId || null);
    }
  );

  fastify.post<{
    Params: Static<typeof SessionHashIdParam>;
    Body: Static<typeof ChatCompletionSchema>;
  }>(
    "/:sessionHashId/completion",
    { schema: { params: SessionHashIdParam, body: ChatCompletionSchema } },
    async (request, reply): Promise<ChatCompletionResponse> => {
      const { user } = await fastify.getUser(request, reply, true);
      const { sessionHashId } = request.params;
      const { content } = request.body;
      return sessionService.createCompletion(
        user.hashId || null,
        sessionHashId,
        content
      );
    }
  );

  fastify.get<{ Params: Static<typeof SessionHashIdParam> }>(
    "/:sessionHashId/messages",
    { schema: { params: SessionHashIdParam } },
    async (request, reply): Promise<SessionMessagesGetResponse> => {
      const { user } = await fastify.getUser(request, reply, true);
      const { sessionHashId } = request.params;

      return sessionService.getMessages(sessionHashId, user.hashId || null);
    }
  );
}
