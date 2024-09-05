import { FastifyInstance } from "fastify";
import {
  ContentHistorySelect,
  getIdByHashId,
  getTypedContents,
} from "../util/prisma";
import { ChatsGetResponse } from "gpinterface-shared/type/chat";
import { Static } from "@sinclair/typebox";
import { ListParamSchema } from "gpinterface-shared/type";
import { getDateString } from "../util/string";

export default async function (fastify: FastifyInstance) {
  fastify.get<{
    Querystring: Static<typeof ListParamSchema>;
  }>(
    "/user",
    { schema: { querystring: ListParamSchema } },
    async (request, reply): Promise<ChatsGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.chat.findFirst,
          lastHashId
        );

        const chats = await fastify.prisma.chat.findMany({
          where: { ...(id > 0 && { id: { lt: id } }), userHashId: user.hashId },
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
            updatedAt: true,
          },
          orderBy: { id: "desc" },
          take: 5,
        });

        return chats.map((chat) => {
          const { updatedAt, contents, gpis, ...rest } = chat;
          return {
            ...rest,
            gpis: gpis.map((gpi) => ({ ...gpi, config: gpi.config as any })),
            contents: getTypedContents(contents),
            updatedAt: getDateString(updatedAt),
          };
        });
      } catch (ex) {
        console.error("path: /chats/user, method: get, error:", ex);
        throw ex;
      }
    }
  );
}
