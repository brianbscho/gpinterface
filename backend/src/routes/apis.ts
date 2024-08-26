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
          fastify.prisma.gpi.findFirst,
          lastHashId
        );

        const gpis = await fastify.prisma.gpi.findMany({
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
          gpis: gpis.map((gpi) => {
            const { chat, createdAt, ...rest } = gpi;
            return {
              ...rest,
              systemMessage: chat.systemMessage,
              messages: chat.contents,
              createdAt: getDateString(createdAt),
            };
          }),
        };
      } catch (ex) {
        console.error("path: /gpis/?lastHashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
}
