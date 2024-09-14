import { Static } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import { ApiKeyService } from "../../services/api-key";
import {
  ApiKeyCreateResponse,
  ApiKeysGetResponse,
} from "gpinterface-shared/type/api-key";
import { DeleteResponse, HashIdParam } from "gpinterface-shared/type";

export default async function apiKeyRoutes(fastify: FastifyInstance) {
  // Initialize the ApiKeyService with the Fastify instance
  const apiKeyService = new ApiKeyService(fastify);

  /**
   * GET /api/keys
   * Retrieves all API keys associated with the current user.
   */
  fastify.get("/", async (request, reply): Promise<ApiKeysGetResponse> => {
    // Extract the user details from the request using Fastify's built-in getUser method
    const { user } = await fastify.getUser(request, reply);

    // Fetch API keys associated with the user's hashId
    return apiKeyService.getByUserHashId(user.hashId);
  });

  /**
   * DELETE /api/keys/:hashId
   * Deletes an API key by its hashId, but only if it belongs to the current user.
   */
  fastify.delete<{ Params: Static<typeof HashIdParam> }>(
    "/:hashId",
    {
      schema: { params: HashIdParam }, // Validate the hashId parameter using a predefined schema
    },
    async (request, reply): Promise<DeleteResponse> => {
      // Extract the user details from the request
      const { user } = await fastify.getUser(request, reply);
      const { hashId } = request.params; // Get the hashId from the request params

      // Attempt to delete the API key if it belongs to the current user
      return apiKeyService.deleteApiKey(hashId, user.hashId);
    }
  );

  /**
   * POST /api/keys
   * Creates a new API key for the current user.
   */
  fastify.post("/", async (request, reply): Promise<ApiKeyCreateResponse> => {
    // Extract the user details from the request
    const { user } = await fastify.getUser(request, reply);

    // Create a new API key associated with the user's hashId
    return apiKeyService.createApiKey(user.hashId);
  });
}
