import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getDateString } from "../util/string";
import { QueryParamSchema } from "gpinterface-shared/type";
import {
  getIdByHashId,
  ContentHistorySelect,
  getTypedContents,
} from "../util/prisma";
import { ChatsGetResponse } from "gpinterface-shared/type/chat";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Querystring: Static<typeof QueryParamSchema> }>(
    "/",
    { schema: { querystring: QueryParamSchema } },
    async (request, reply): Promise<ChatsGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.chat.findFirst,
          lastHashId
        );

        const chats = await fastify.prisma.chat.findMany({
          where: {
            ...(id > 0 && { id: { lt: id } }),
            userHashId: user.hashId,
            gpis: { none: {} },
          },
          select: {
            hashId: true,
            userHashId: true,
            systemMessage: true,
            contents: {
              select: {
                hashId: true,
                model: { select: { hashId: true, name: true } },
                role: true,
                content: true,
                config: true,
                histories: { select: ContentHistorySelect },
                isModified: true,
              },
              orderBy: { id: "asc" },
            },
            gpis: {
              select: {
                hashId: true,
                description: true,
                config: true,
                modelHashId: true,
                isPublic: true,
              },
            },
            createdAt: true,
          },
          orderBy: { id: "desc" },
          take: 5,
        });

        return chats.map((c) => {
          const { createdAt, contents, gpis, ...chat } = c;
          return {
            ...chat,
            gpis: gpis.map((gpi) => ({ ...gpi, config: gpi.config as any })),
            contents: getTypedContents(contents),
            createdAt: getDateString(createdAt),
          };
        });
      } catch (ex) {
        console.error("path: /chats, method: get, error:", ex);
        throw ex;
      }
    }
  );
}
