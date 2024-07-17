import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getDateString } from "../util/string";
import { QueryParamSchema } from "gpinterface-shared/type";
import { getIdByHashId } from "../util/prisma";
import { PostsGetResponse, PostsGetSchema } from "gpinterface-shared/type/post";
import { getTypedTextPrompts } from "../util/textPrompt";
import { isAccessible } from "../util/thread";
import { getTypedImagePrompts } from "../util/imagePrompt";

export default async function (fastify: FastifyInstance) {
  const { httpErrors } = fastify;

  fastify.get<{
    Params: Static<typeof PostsGetSchema>;
    Querystring: Static<typeof QueryParamSchema>;
  }>(
    "/:threadHashId",
    { schema: { params: PostsGetSchema, querystring: QueryParamSchema } },
    async (request, reply): Promise<PostsGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { threadHashId } = request.params;
        const { lastHashId } = request.query;

        const thread = await fastify.prisma.thread.findFirst({
          where: { hashId: threadHashId },
          select: { isPublic: true, userHashId: true },
        });
        if (!thread) {
          throw httpErrors.badRequest("The thread is not available.");
        }
        isAccessible(thread, user);

        const id = await getIdByHashId(
          fastify.prisma.post.findFirst,
          lastHashId
        );

        const posts = await fastify.prisma.post.findMany({
          where: { threadHashId, ...(id > 0 && { id: { gt: id } }) },
          select: {
            hashId: true,
            post: true,
            bookmarks: { select: { isBookmarked: true } },
            likes: {
              select: { isLiked: true },
              where: { userHashId: user.hashId },
            },
            _count: { select: { likes: { where: { isLiked: true } } } },
            createdAt: true,
            user: { select: { hashId: true, name: true } },
            textPrompts: {
              select: {
                hashId: true,
                provider: true,
                model: true,
                systemMessage: true,
                config: true,
                examples: {
                  select: {
                    hashId: true,
                    input: true,
                    content: true,
                    response: true,
                    price: true,
                  },
                },
                messages: {
                  select: {
                    hashId: true,
                    role: true,
                    content: true,
                  },
                },
              },
            },
            imagePrompts: {
              select: {
                hashId: true,
                provider: true,
                model: true,
                prompt: true,
                config: true,
                examples: {
                  select: {
                    hashId: true,
                    input: true,
                    url: true,
                    response: true,
                    price: true,
                  },
                },
              },
            },
          },
          orderBy: { id: "asc" },
          take: 20,
        });

        return {
          posts: posts.map((p) => {
            const { bookmarks, likes, _count, ...post } = p;
            return {
              ...post,
              createdAt: getDateString(p.createdAt),
              isBookmarked: bookmarks[0]?.isBookmarked || false,
              isLiked: likes[0]?.isLiked || false,
              likes: _count.likes,
              textPrompts: getTypedTextPrompts(p.textPrompts),
              imagePrompts: getTypedImagePrompts(p.imagePrompts),
            };
          }),
        };
      } catch (ex) {
        console.error(
          "path: /posts/:threadHashId?lastHashId, method: get, error:",
          ex
        );
        throw ex;
      }
    }
  );
}
