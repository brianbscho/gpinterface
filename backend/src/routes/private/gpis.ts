import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  DeleteResponse,
  HashIdParam,
  LastHashIdParam,
} from "gpinterface-shared/type";
import {
  GpiCreateResponse,
  GpiCreateSchema,
  GpiDeploySchema,
  GpiGetResponse,
  GpisGetResponse,
  GpiUpdateResponse,
  GpiUpdateSchema,
} from "gpinterface-shared/type/gpi";
import {
  ChatContentCreateSchema,
  ChatContentsCreateResponse,
} from "gpinterface-shared/type/chat-content";
import { GpiService } from "../../services/gpi";
import { ChatContentService } from "../../services/chat-content";

export default async function (fastify: FastifyInstance) {
  // Initialize services for GPI and Chat Content.
  const gpiService = new GpiService(fastify);
  const chatContentService = new ChatContentService(fastify);

  /**
   * Route: POST /
   * Purpose: Creates a new GPI.
   * Body Params: GpiCreateSchema - Contains the GPI modelHashId and configuration.
   * Response: GpiCreateResponse - The newly created GPI.
   */
  fastify.post<{ Body: Static<typeof GpiCreateSchema> }>(
    "/",
    { schema: { body: GpiCreateSchema } },
    async (request, reply): Promise<GpiCreateResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { modelHashId, config } = request.body;

      return gpiService.create(user.hashId, modelHashId, config);
    }
  );

  /**
   * Route: PATCH /:hashId
   * Purpose: Updates an existing GPI.
   * Params: hashId - Identifier for the GPI to update.
   * Body Params: GpiUpdateSchema - The fields to update for the GPI.
   * Response: GpiUpdateResponse - The updated GPI.
   */
  fastify.patch<{
    Params: Static<typeof HashIdParam>;
    Body: Static<typeof GpiUpdateSchema>;
  }>(
    "/:hashId",
    { schema: { params: HashIdParam, body: GpiUpdateSchema } },
    async (request, reply): Promise<GpiUpdateResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { hashId } = request.params;

      return gpiService.patch(hashId, user.hashId, request.body);
    }
  );

  /**
   * Route: PUT /:hashId
   * Purpose: Replaces the existing GPI with a new deployment.
   * Params: hashId - Identifier for the GPI to replace.
   * Body Params: GpiDeploySchema - Deployment configuration.
   * Response: GpiCreateResponse - The new deployed GPI.
   */
  fastify.put<{
    Params: Static<typeof HashIdParam>;
    Body: Static<typeof GpiDeploySchema>;
  }>(
    "/:hashId",
    { schema: { params: HashIdParam, body: GpiDeploySchema } },
    async (request, reply): Promise<GpiCreateResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { hashId } = request.params;

      return gpiService.put(hashId, user.hashId, request.body);
    }
  );

  /**
   * Route: POST /:hashId/deploy
   * Purpose: Deploys the specified GPI.
   * Params: hashId - Identifier for the GPI to deploy.
   * Body Params: GpiDeploySchema - Deployment configuration.
   * Response: GpiCreateResponse - The deployed GPI.
   */
  fastify.post<{
    Params: Static<typeof HashIdParam>;
    Body: Static<typeof GpiDeploySchema>;
  }>(
    "/:hashId/deploy",
    { schema: { params: HashIdParam, body: GpiDeploySchema } },
    async (request, reply): Promise<GpiCreateResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { hashId } = request.params;

      return gpiService.deploy(hashId, user.hashId, request.body);
    }
  );

  /**
   * Route: POST /:hashId/copy
   * Purpose: Creates a copy of the specified GPI.
   * Params: hashId - Identifier for the GPI to copy.
   * Response: GpiCreateResponse - The newly created copy of the GPI.
   */
  fastify.post<{ Params: Static<typeof HashIdParam> }>(
    "/:hashId/copy",
    { schema: { params: HashIdParam } },
    async (request, reply): Promise<GpiCreateResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { hashId } = request.params;

      return gpiService.copy(hashId, user.hashId);
    }
  );

  /**
   * Route: DELETE /:hashId
   * Purpose: Deletes the specified GPI.
   * Params: hashId - Identifier for the GPI to delete.
   * Response: DeleteResponse - Confirmation of deletion.
   */
  fastify.delete<{ Params: Static<typeof HashIdParam> }>(
    "/:hashId",
    { schema: { params: HashIdParam } },
    async (request, reply): Promise<DeleteResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { hashId } = request.params;

      return gpiService.delete(hashId, user.hashId);
    }
  );

  /**
   * Route: POST /:hashId/chat/contents/completion
   * Purpose: Creates a chat content completion for the specified GPI.
   * Params: hashId - Identifier for the GPI.
   * Body Params: ChatContentCreateSchema - Configuration and content for the chat completion.
   * Response: ChatContentsCreateResponse - The newly created chat content completion.
   */
  fastify.post<{
    Params: Static<typeof HashIdParam>;
    Body: Static<typeof ChatContentCreateSchema>;
  }>(
    "/:hashId/chat/contents/completion",
    { schema: { params: HashIdParam, body: ChatContentCreateSchema } },
    async (request, reply): Promise<ChatContentsCreateResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { hashId } = request.params;
      const { modelHashId, config, content } = request.body;

      return chatContentService.createCompletion(
        hashId,
        user.hashId,
        modelHashId,
        config,
        content
      );
    }
  );

  /**
   * Route: POST /:hashId/chat/contents
   * Purpose: Creates an empty chat content for the specified GPI.
   * Params: hashId - Identifier for the GPI.
   * Response: ChatContentsCreateResponse - The newly created empty chat content.
   */
  fastify.post<{ Params: Static<typeof HashIdParam> }>(
    "/:hashId/chat/contents",
    { schema: { params: HashIdParam } },
    async (request, reply): Promise<ChatContentsCreateResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { hashId } = request.params;

      return chatContentService.createEmpty(hashId, user.hashId);
    }
  );

  /**
   * Route: GET /
   * Purpose: Retrieves a list of GPIs for the authenticated user with optional pagination.
   * Query Params: lastHashId - Optional parameter for pagination.
   * Response: GpisGetResponse - A list of GPIs.
   */
  fastify.get<{ Querystring: Static<typeof LastHashIdParam> }>(
    "/",
    { schema: { querystring: LastHashIdParam } },
    async (request, reply): Promise<GpisGetResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { lastHashId } = request.query;

      return gpiService.getManyByUserHashId(lastHashId, user.hashId);
    }
  );

  /**
   * Route: GET /:hashId
   * Purpose: Retrieves the private details of a specific GPI.
   * Params: hashId - Identifier for the GPI.
   * Response: GpiGetResponse - Details about the requested GPI.
   * Error Handling: Catches and handles errors, logging them and returning appropriate HTTP responses.
   */
  fastify.get<{ Params: Static<typeof HashIdParam> }>(
    "/:hashId",
    { schema: { params: HashIdParam } },
    async (request, reply): Promise<GpiGetResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { hashId } = request.params;

      return await gpiService.getPrivateGpi(hashId, user.hashId);
    }
  );
}
