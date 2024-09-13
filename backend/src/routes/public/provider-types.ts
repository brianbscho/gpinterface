import { FastifyInstance } from "fastify";
import { ProviderTypesGetResponse } from "gpinterface-shared/type/provider-type";
import { ProviderTypeService } from "../../services/provider-type";

export default async function (fastify: FastifyInstance) {
  // Initialize the provider type service with the Fastify instance.
  const providerTypeService = new ProviderTypeService(fastify);

  /**
   * Route: GET /
   * Purpose: Retrieves a list of provider types (histories).
   * Response: ProviderTypesGetResponse - Contains an array of provider types.
   */
  fastify.get(
    "/",
    async (request, reply): Promise<ProviderTypesGetResponse> => {
      // Call the service to retrieve provider type histories
      return await providerTypeService.getHistories();
    }
  );
}
