import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { HashIdParam, SearchQueryHashIdParam } from "gpinterface-shared/type";
import { GpiGetResponse, GpisGetResponse } from "gpinterface-shared/type/gpi";
import { GpiService } from "../../services/gpi";

export default async function (fastify: FastifyInstance) {
  const gpiService = new GpiService(fastify);

  fastify.get<{ Params: Static<typeof HashIdParam> }>(
    "/:hashId",
    { schema: { params: HashIdParam } },
    async (request, reply): Promise<GpiGetResponse> => {
      // The third parameter 'true' might indicate optional authentication
      const { user } = await fastify.getUser(request, reply, true);
      const { hashId } = request.params;

      return gpiService.getPublicGpi(hashId, user.hashId);
    }
  );
  fastify.get<{ Querystring: Static<typeof SearchQueryHashIdParam> }>(
    "/",
    { schema: { querystring: SearchQueryHashIdParam } },
    async (request, reply): Promise<GpisGetResponse> => {
      const { user } = await fastify.getUser(request, reply, true);
      const { keyword, lastHashId } = request.query;

      return gpiService.getGpis(user.hashId, keyword, lastHashId);
    }
  );
}
