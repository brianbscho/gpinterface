import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getDateString } from "../util/string";
import { getIdByHashId } from "../util/prisma";
import {
  BookmarksGetResponse,
  BookmarksQueryParamSchema,
} from "gpinterface-shared/type/bookmark";
import { getTypedTextPrompts } from "../util/textPrompt";
import { getTypedImagePrompts } from "../util/imagePrompt";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Querystring: Static<typeof BookmarksQueryParamSchema> }>(
    "/",
    {
      schema: { querystring: BookmarksQueryParamSchema },
    },
    async (request, reply): Promise<BookmarksGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { lastHashId, type } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.bookmark.findFirst,
          lastHashId
        );

        const bookmarks = await fastify.prisma.bookmark.findMany({
          where: {
            ...(id > 0 && { id: { lt: id } }),
            userHashId: user.hashId,
            isBookmarked: true,
            ...(type === "prompt" && {
              post: {
                OR: [
                  { textPrompts: { some: {} } },
                  { imagePrompts: { some: {} } },
                ],
              },
            }),
          },
          select: {
            hashId: true,
            post: {
              select: {
                hashId: true,
                post: true,
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
            },
          },
          orderBy: { id: "desc" },
          take: 20,
        });

        return {
          bookmarks: bookmarks.map((b) => {
            const { hashId, post } = b;
            const { likes, _count, ...rest } = post;
            return {
              hashId,
              post: {
                ...rest,
                createdAt: getDateString(post.createdAt),
                isBookmarked: true,
                isLiked: likes[0]?.isLiked || false,
                likes: _count.likes,
                textPrompts: getTypedTextPrompts(post.textPrompts),
                imagePrompts: getTypedImagePrompts(post.imagePrompts),
              },
            };
          }),
        };
      } catch (ex) {
        console.error("path: /bookmarks?lastHashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
}
