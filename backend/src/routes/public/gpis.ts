import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { HashIdParam, SearchQueryHashIdParam } from "gpinterface-shared/type";
import { GpiGetResponse, GpisGetResponse } from "gpinterface-shared/type/gpi";
import { GpiService } from "../../services/gpi";

export default async function (fastify: FastifyInstance) {
  // Initialize the GPI (General Product Information) service with the Fastify instance.
  const gpiService = new GpiService(fastify);

  /**
   * Route: GET /:hashId
   * Purpose: Retrieves public GPI data for a specific GPI based on its `hashId`.
   * Params: `hashId` - The unique identifier for the GPI.
   * Response: GpiGetResponse - Contains details about the GPI.
   */
  fastify.get<{ Params: Static<typeof HashIdParam> }>(
    "/:hashId",
    { schema: { params: HashIdParam } },
    async (request, reply): Promise<GpiGetResponse> => {
      const { user } = await fastify.getUser(request, reply, true); // Optionally authenticate the user
      const { hashId } = request.params; // Extract the hashId from request params

      // Retrieve the public GPI information using the hashId and user's hashId
      return gpiService.getPublicGpi(hashId, user.hashId);
    }
  );

  /**
   * Route: GET /
   * Purpose: Searches for GPIs based on the provided query parameters (e.g., keyword).
   * Query Params: `keyword` - The search keyword for filtering GPIs.
   *               `lastHashId` - The hashId for pagination (optional).
   * Response: GpisGetResponse - Contains an array of GPIs matching the search criteria.
   */
  fastify.get<{ Querystring: Static<typeof SearchQueryHashIdParam> }>(
    "/",
    { schema: { querystring: SearchQueryHashIdParam } },
    async (request, reply): Promise<GpisGetResponse> => {
      const { user } = await fastify.getUser(request, reply, true); // Optionally authenticate the user
      const { keyword, lastHashId } = request.query; // Extract query params for searching

      // Search for GPIs based on the user's hashId, keyword, and optional lastHashId for pagination
      return gpiService.getGpis(user.hashId, keyword, lastHashId);
    }
  );
}
