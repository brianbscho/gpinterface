import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getDateString } from "../util/string";
import { QueryParamSchema } from "gpinterface-shared/type";
import { getIdByHashId } from "../util/prisma";
import { HistoriesGetResponse } from "gpinterface-shared/type/history";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Querystring: Static<typeof QueryParamSchema> }>(
    "/",
    { schema: { querystring: QueryParamSchema } },
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
            provider: true,
            model: true,
            config: true,
            messages: true,
            content: true,
            response: true,
            price: true,
            inputTokens: true,
            outputTokens: true,
            createdAt: true,
            chatHashId: true,
            apiHashId: true,
          },
          orderBy: { id: "desc" },
          take: 20,
        });

        return {
          histories: histories.map((h) => {
            const { createdAt, config, messages, response, ...history } = h;
            return {
              ...history,
              response: response as any,
              config: config as any,
              messages: messages as any,
              createdAt: getDateString(createdAt),
              isApi: typeof history.apiHashId === "string",
              isPost: false,
            };
          }),
        };
      } catch (ex) {
        console.error("path: /histories?lastHashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
}
