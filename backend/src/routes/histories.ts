import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { ListParamSchema } from "gpinterface-shared/type";
import {
  ContentHistorySelect,
  getIdByHashId,
  getTypedHistory,
} from "../util/prisma";
import { HistoriesGetResponse } from "gpinterface-shared/type/history";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Querystring: Static<typeof ListParamSchema> }>(
    "/",
    { schema: { querystring: ListParamSchema } },
    async (request, reply): Promise<HistoriesGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.history.findFirst,
          lastHashId
        );

        const histories = await fastify.prisma.history.findMany({
          where: {
            userHashId: user.hashId,
            ...(id > 0 && { id: { lt: id } }),
          },
          select: {
            hashId: true,
            ...ContentHistorySelect,
            paid: true,
          },
          orderBy: { id: "desc" },
          take: 20,
        });

        return histories.map((h) => getTypedHistory(h));
      } catch (ex) {
        console.error("path: /histories?lastHashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
}
