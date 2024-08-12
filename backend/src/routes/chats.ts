import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getDateString } from "../util/string";
import { QueryParamSchema } from "gpinterface-shared/type";
import { getIdByHashId } from "../util/prisma";
import { ChatsGetResponse } from "gpinterface-shared/type/chat";
import { getTypedContent } from "../util/content";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Querystring: Static<typeof QueryParamSchema> }>(
    "/",
    { schema: { querystring: QueryParamSchema } },
    async (request, reply): Promise<ChatsGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        if (user.hashId.length === 0) {
          return { chats: [] };
        }
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.chat.findFirst,
          lastHashId
        );

        const chats = await fastify.prisma.chat.findMany({
          where: { ...(id > 0 && { id: { lt: id } }), userHashId: user.hashId },
          select: {
            hashId: true,
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
                model: { select: { providerHashId: true, hashId: true } },
                role: true,
                content: true,
                config: true,
              },
              orderBy: { id: "asc" },
            },
            createdAt: true,
          },
          orderBy: { id: "desc" },
          take: 5,
        });

        return {
          chats: chats.map((c) => {
            const { _count, posts, createdAt, contents, ...chat } = c;
            return {
              ...chat,
              contents: contents.map((c) => ({
                ...getTypedContent(c),
                providerHashId: c.model.providerHashId,
                modelHashId: c.model.hashId,
              })),
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
