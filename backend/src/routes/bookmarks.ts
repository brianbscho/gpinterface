import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getUpdatedAtByHashId } from "../util/prisma";
import { PostsGetResponse } from "gpinterface-shared/type/post";
import { getTypedPostResponse } from "./posts";
import { QueryParamSchema } from "gpinterface-shared/type";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Querystring: Static<typeof QueryParamSchema> }>(
    "/",
    { schema: { querystring: QueryParamSchema } },
    async (request, reply): Promise<PostsGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { lastHashId } = request.query;

        const updatedAt = await getUpdatedAtByHashId(
          fastify.prisma.bookmark.findFirst,
          lastHashId
        );

        const bookmarks = await fastify.prisma.bookmark.findMany({
          where: {
            ...(updatedAt !== null && { updatedAt: { lt: updatedAt } }),
            userHashId: user.hashId,
            isBookmarked: true,
          },
          select: {
            hashId: true,
            post: {
              select: {
                hashId: true,
                title: true,
                post: true,
                _count: {
                  select: {
                    likes: { where: { isLiked: true } },
                    comments: true,
                  },
                },
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
                user: { select: { hashId: true, name: true } },
              },
            },
          },
          orderBy: { updatedAt: "desc" },
          take: 20,
        });

        return {
          posts: bookmarks.map((b) => getTypedPostResponse(b.post)),
        };
      } catch (ex) {
        console.error("path: /bookmarks?lastHashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
}
