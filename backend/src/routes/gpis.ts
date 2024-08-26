import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getDateString } from "../util/string";
import { QueryParamSchema } from "gpinterface-shared/type";
import {
  ContentHistorySelect,
  getIdByHashId,
  getTypedContents,
} from "../util/prisma";
import {
  GpisGetResponse,
  GpisUserGetResponse,
} from "gpinterface-shared/type/gpi";

export default async function (fastify: FastifyInstance) {
  fastify.get<{
    Querystring: Static<typeof QueryParamSchema>;
  }>(
    "/",
    { schema: { querystring: QueryParamSchema } },
    async (request, reply): Promise<GpisGetResponse> => {
      try {
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.gpi.findFirst,
          lastHashId
        );

        const gpis = await fastify.prisma.gpi.findMany({
          where: { ...(id > 0 && { id: { lt: id } }) },
          select: {
            hashId: true,
            userHashId: true,
            description: true,
            chat: {
              select: {
                hashId: true,
                systemMessage: true,
                contents: {
                  select: {
                    hashId: true,
                    role: true,
                    content: true,
                    config: true,
                    model: { select: { hashId: true, name: true } },
                    histories: { select: ContentHistorySelect },
                  },
                },
              },
            },
            config: true,
            modelHashId: true,
            isPublic: true,
          },
          orderBy: { id: "desc" },
          take: 20,
        });

        return {
          gpis: gpis.map((gpi) => {
            const { chat, config, ...rest } = gpi;
            return {
              ...rest,
              config: config as any,
              chat: { ...chat, contents: getTypedContents(chat.contents) },
            };
          }),
        };
      } catch (ex) {
        console.error("path: /gpis?lastHashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.get<{
    Querystring: Static<typeof QueryParamSchema>;
  }>(
    "/user",
    { schema: { querystring: QueryParamSchema } },
    async (request, reply): Promise<GpisUserGetResponse> => {
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
        console.error("path: /gpis/user?lastHashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
}
