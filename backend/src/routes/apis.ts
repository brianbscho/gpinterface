import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getDateString } from "../util/string";
import { QueryParamSchema } from "gpinterface-shared/type";
import { getIdByHashId } from "../util/prisma";
import { ApisGetResponse } from "gpinterface-shared/type/api";

export default async function (fastify: FastifyInstance) {
  fastify.get<{
    Querystring: Static<typeof QueryParamSchema>;
  }>(
    "/",
    { schema: { querystring: QueryParamSchema } },
    async (request, reply): Promise<ApisGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.api.findFirst,
          lastHashId
        );

        const apis = await fastify.prisma.api.findMany({
          where: { ...(id > 0 && { id: { lt: id } }), userHashId: user.hashId },
          select: {
            hashId: true,
            description: true,
            chat: {
              select: {
                systemMessage: true,
                contents: {
                  select: { hashId: true, role: true, content: true },
                  orderBy: { id: "asc" },
                  take: 2,
                },
              },
            },
            createdAt: true,
          },
          orderBy: { id: "desc" },
          take: 20,
        });

        return {
          apis: apis.map((api) => {
            const { chat, createdAt, ...rest } = api;
            return {
              ...rest,
              systemMessage: chat.systemMessage,
              messages: chat.contents,
              createdAt: getDateString(createdAt),
            };
          }),
        };
      } catch (ex) {
        console.error("path: /apis/?lastHashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
}
