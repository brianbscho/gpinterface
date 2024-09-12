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
import { ApiKeyService } from "../../services/api-key";

export default async function (fastify: FastifyInstance) {
  const apiKeyService = new ApiKeyService(fastify);
  const sessionService = new SessionService(fastify);

  fastify.post<{ Body: Static<typeof GpiHashIdParam> }>(
    "/",
    { schema: { body: GpiHashIdParam } },
    async (request, reply): Promise<SessionCreateResponse> => {
      const userHashId = await apiKeyService.getUserHashId(request);
      const { gpiHashId } = request.body;
      return sessionService.create(gpiHashId, userHashId);
    }
  );

  fastify.post<{
    Params: Static<typeof SessionHashIdParam>;
    Body: Static<typeof ChatCompletionSchema>;
  }>(
    "/:sessionHashId/completion",
    { schema: { params: SessionHashIdParam, body: ChatCompletionSchema } },
    async (request, reply): Promise<ChatCompletionResponse> => {
      const userHashId = await apiKeyService.getUserHashId(request);
      const { sessionHashId } = request.params;
      const { content } = request.body;
      return sessionService.createCompletion(
        userHashId,
        sessionHashId,
        content
      );
    }
  );

  fastify.get<{ Params: Static<typeof SessionHashIdParam> }>(
    "/:sessionHashId/messages",
    { schema: { params: SessionHashIdParam } },
    async (request, reply): Promise<SessionMessagesGetResponse> => {
      const userHashId = await apiKeyService.getUserHashId(request);
      const { sessionHashId } = request.params;

      return sessionService.getMessages(sessionHashId, userHashId);
    }
  );
}
