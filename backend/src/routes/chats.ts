import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getDateString } from "../util/string";
import { QueryParamSchema } from "gpinterface-shared/type";
import {
  getTypedContent,
  getIdByHashId,
  getTypedHistory,
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
          where: { ...(id > 0 && { id: { lt: id } }), userHashId: user.hashId },
          select: {
            hashId: true,
            userHashId: true,
            _count: { select: { apis: true, posts: true } },
            posts: {
              select: {
                _count: {
                  select: {
                    likes: { where: { isLiked: true } },
                  },
                },
              },
            },
            systemMessage: true,
            contents: {
              select: {
                hashId: true,
                model: { select: { hashId: true, name: true } },
                role: true,
                content: true,
                config: true,
                histories: {
                  select: {
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
                  },
                },
              },
              orderBy: { id: "asc" },
            },
            createdAt: true,
          },
          orderBy: { id: "desc" },
          take: 5,
        });

        return {
          chats: chats
            .filter((c) => c._count.apis === 0 && c._count.posts === 0)
            .map((c) => {
              const { _count, posts, createdAt, contents, ...chat } = c;
              return {
                ...chat,
                contents: contents.map((c) => {
                  const { histories, ...rest } = c;
                  const content = getTypedContent(rest);
                  if (histories.length === 0) return content;

                  return { history: getTypedHistory(histories[0]), ...content };
                }),
                isApi: _count.apis > 0,
                isPost: _count.posts > 0,
                createdAt: getDateString(createdAt),
              };
            }),
        };
      } catch (ex) {
        console.error("path: /chats, method: get, error:", ex);
        throw ex;
      }
    }
  );
}
