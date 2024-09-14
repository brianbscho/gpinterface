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
  // Initialize the API key and session services with the Fastify instance.
  const apiKeyService = new ApiKeyService(fastify);
  const sessionService = new SessionService(fastify);

  /**
   * Route: POST /
   * Purpose: Creates a new session based on the provided GPI (General Product Information) hash ID.
   * Body Params: GpiHashIdParam - Contains the GPI hash ID required to create a session.
   * Response: SessionCreateResponse - Contains the newly created session information.
   */
  fastify.post<{ Body: Static<typeof GpiHashIdParam> }>(
    "/",
    { schema: { body: GpiHashIdParam } },
    async (request, reply): Promise<SessionCreateResponse> => {
      // Retrieve the user's hash ID via the API key service.
      const userHashId = await apiKeyService.getUserHashId(request);
      const { gpiHashId } = request.body;

      // Create a new session using the GPI hash ID and the user's hash ID.
      return sessionService.create(gpiHashId, userHashId);
    }
  );

  /**
   * Route: POST /:sessionHashId/completion
   * Purpose: Creates a chat completion for a specific session.
   * Params: sessionHashId - The unique identifier of the session.
   * Body Params: ChatCompletionSchema - Contains the chat content to be added to the session.
   * Response: ChatCompletionResponse - Contains the result of the chat completion.
   */
  fastify.post<{
    Params: Static<typeof SessionHashIdParam>;
    Body: Static<typeof ChatCompletionSchema>;
  }>(
    "/:sessionHashId/completion",
    { schema: { params: SessionHashIdParam, body: ChatCompletionSchema } },
    async (request, reply): Promise<ChatCompletionResponse> => {
      // Retrieve the user's hash ID via the API key service.
      const userHashId = await apiKeyService.getUserHashId(request);
      const { sessionHashId } = request.params;
      const { content } = request.body;

      // Create the chat completion for the specified session.
      return sessionService.createCompletion(
        userHashId,
        sessionHashId,
        content
      );
    }
  );

  /**
   * Route: GET /:sessionHashId/messages
   * Purpose: Retrieves the messages of a specific session.
   * Params: sessionHashId - The unique identifier of the session.
   * Response: SessionMessagesGetResponse - Contains the messages of the session.
   */
  fastify.get<{ Params: Static<typeof SessionHashIdParam> }>(
    "/:sessionHashId/messages",
    { schema: { params: SessionHashIdParam } },
    async (request, reply): Promise<SessionMessagesGetResponse> => {
      // Retrieve the user's hash ID via the API key service.
      const userHashId = await apiKeyService.getUserHashId(request);
      const { sessionHashId } = request.params;

      // Get the messages associated with the specified session.
      return sessionService.getMessages(sessionHashId, userHashId);
    }
  );
}
