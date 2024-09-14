import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { LastHashIdParam } from "gpinterface-shared/type";
import { HistoriesGetResponse } from "gpinterface-shared/type/history";
import { HistoryService } from "../../services/history";

export default async function (fastify: FastifyInstance) {
  // Initialize the history service with the Fastify instance.
  const historyService = new HistoryService(fastify);

  /**
   * Route: GET /
   * Purpose: Retrieves a list of history items for the authenticated user, with optional pagination.
   * Query Params: `lastHashId` - Optional parameter for pagination, used to fetch histories after a specific ID.
   * Response: HistoriesGetResponse - Contains an array of history items for the user.
   * Error Handling: Logs and throws any errors encountered during the process.
   */
  fastify.get<{ Querystring: Static<typeof LastHashIdParam> }>(
    "/",
    { schema: { querystring: LastHashIdParam } },
    async (request, reply): Promise<HistoriesGetResponse> => {
      const { user } = await fastify.getUser(request, reply); // Retrieve authenticated user
      const { lastHashId } = request.query; // Extract lastHashId from query params for pagination

      // Fetch the user's history, optionally starting after lastHashId
      return historyService.getHistories(user.hashId, lastHashId);
    }
  );
}
