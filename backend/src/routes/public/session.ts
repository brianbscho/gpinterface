import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
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

// Helper function to extract user hashId from the request.
// This ensures that we get the user information consistently across all routes.
async function getUserHashId(
  fastify: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { user } = await fastify.getUser(request, reply, true);
  return user.hashId || null;
}

export default async function (fastify: FastifyInstance) {
  // Initialize the session service with the Fastify instance.
  const sessionService = new SessionService(fastify);

  /**
   * Route: POST /
   * Purpose: Creates a new session based on the provided `gpiHashId`.
   * Body Params: `gpiHashId` - Identifier used to create a session.
   * Response: SessionCreateResponse - Contains the newly created session information.
   */
  fastify.post<{ Body: Static<typeof GpiHashIdParam> }>(
    "/",
    { schema: { body: GpiHashIdParam } },
    async (request, reply): Promise<SessionCreateResponse> => {
      const userHashId = await getUserHashId(fastify, request, reply); // Get user information
      const { gpiHashId } = request.body; // Extract gpiHashId from the request body
      return sessionService.create(gpiHashId, userHashId); // Create a new session
    }
  );

  /**
   * Route: POST /:sessionHashId/completion
   * Purpose: Creates a chat completion for a specific session.
   * Params: `sessionHashId` - Identifier for the session.
   * Body Params: `content` - The chat completion content to be added.
   * Response: ChatCompletionResponse - Contains the result of the chat completion.
   */
  fastify.post<{
    Params: Static<typeof SessionHashIdParam>;
    Body: Static<typeof ChatCompletionSchema>;
  }>(
    "/:sessionHashId/completion",
    { schema: { params: SessionHashIdParam, body: ChatCompletionSchema } },
    async (request, reply): Promise<ChatCompletionResponse> => {
      const userHashId = await getUserHashId(fastify, request, reply); // Get user information
      const { sessionHashId } = request.params; // Extract sessionHashId from request params
      const { content } = request.body; // Extract content from the request body
      return sessionService.createCompletion(
        userHashId,
        sessionHashId,
        content
      ); // Create the chat completion
    }
  );

  /**
   * Route: GET /:sessionHashId/messages
   * Purpose: Retrieves the messages for a specific session.
   * Params: `sessionHashId` - Identifier for the session.
   * Response: SessionMessagesGetResponse - Contains the messages for the given session.
   */
  fastify.get<{ Params: Static<typeof SessionHashIdParam> }>(
    "/:sessionHashId/messages",
    { schema: { params: SessionHashIdParam } },
    async (request, reply): Promise<SessionMessagesGetResponse> => {
      const userHashId = await getUserHashId(fastify, request, reply); // Get user information
      const { sessionHashId } = request.params; // Extract sessionHashId from request params
      return sessionService.getMessages(sessionHashId, userHashId); // Retrieve session messages
    }
  );
}
