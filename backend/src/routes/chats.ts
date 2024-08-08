import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getDateString } from "../util/string";
import { QueryParamSchema } from "gpinterface-shared/type";
import { getIdByHashId } from "../util/prisma";
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
            _count: { select: { apis: true, posts: true } },
            posts: {
              select: {
                _count: {
                  select: {
                    likes: { where: { isLiked: true } },
                    comments: true,
                  },
                },
              },
            },
            systemMessage: true,
            contents: {
              select: { hashId: true, role: true, content: true },
              orderBy: { id: "asc" },
              take: 2,
            },
            createdAt: true,
          },
          orderBy: { id: "desc" },
          take: 20,
        });

        return {
          chats: chats.map((c) => {
            const { _count, posts, createdAt, contents, ...chat } = c;
            return {
              ...chat,
              messages: contents,
              isApi: _count.apis > 0,
              isPost: _count.posts > 0,
              likes: posts.reduce((sum, p) => sum + p._count.likes, 0),
              comments: posts.reduce((sum, p) => sum + p._count.comments, 0),
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
