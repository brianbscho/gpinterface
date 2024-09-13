import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { LastHashIdParam } from "gpinterface-shared/type";
import { HistoriesGetResponse } from "gpinterface-shared/type/history";
import { HistoryService } from "../../services/history";

export default async function (fastify: FastifyInstance) {
  const historyService = new HistoryService(fastify);

  fastify.get<{ Querystring: Static<typeof LastHashIdParam> }>(
    "/",
    { schema: { querystring: LastHashIdParam } },
    async (request, reply): Promise<HistoriesGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { lastHashId } = request.query;

        return historyService.getHistories(user.hashId, lastHashId);
      } catch (ex) {
        console.error("path: /histories?lastHashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
}
