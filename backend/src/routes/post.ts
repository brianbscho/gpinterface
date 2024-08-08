import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  PostCreateResponse,
  PostCreateSchema,
  PostUpdateSchema,
} from "gpinterface-shared/type/post";
import { getDateString } from "../util/string";
import { createEntity } from "../util/prisma";
import { ParamSchema, Post } from "gpinterface-shared/type";
import { createChat } from "../controllers/chat";
import { getTypedContent } from "../util/content";

export default async function (fastify: FastifyInstance) {
  const { httpErrors } = fastify;

  fastify.get<{ Params: Static<typeof ParamSchema> }>(
    "/:hashId",
    { schema: { params: ParamSchema } },
    async (request, reply): Promise<{ post: Post }> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;

        const post = await fastify.prisma.post.findFirst({
          where: { hashId },
          select: {
            hashId: true,
            title: true,
            post: true,
            bookmarks: {
              select: { isBookmarked: true },
              where: { userHashId: user.hashId },
            },
            likes: {
              select: { isLiked: true },
              where: { userHashId: user.hashId },
            },
            _count: { select: { likes: { where: { isLiked: true } } } },
            createdAt: true,
            user: { select: { hashId: true, name: true } },
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
                    model: { select: { hashId: true, providerHashId: true } },
                  },
                },
              },
            },
          },
        });
        if (!post) {
          throw fastify.httpErrors.badRequest("The post is not available.");
        }

        const { bookmarks, likes, _count, chat, ...rest } = post;
        return {
          post: {
            ...rest,
            createdAt: getDateString(post.createdAt),
            isBookmarked: bookmarks[0]?.isBookmarked || false,
            isLiked: likes[0]?.isLiked || false,
            likes: _count.likes,
            chat: {
              ...chat,
              contents: chat.contents.map((c) => getTypedContent(c)),
            },
          },
        };
      } catch (ex) {
        console.error("path: /post/:hashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.post<{ Body: Static<typeof PostCreateSchema> }>(
    "/",
    { schema: { body: PostCreateSchema } },
    async (request, reply): Promise<PostCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { title, post, chatHashId } = request.body;

        if (title.trim() === "" || post.trim() === "") {
          throw httpErrors.badRequest("title or post is empty.");
        }

        const oldChat = await fastify.prisma.chat.findFirst({
          where: { hashId: chatHashId },
          select: {
            systemMessage: true,
            contents: {
              select: {
                role: true,
                content: true,
                config: true,
                modelHashId: true,
              },
              orderBy: { id: "asc" },
            },
          },
        });
        if (!oldChat) {
          throw httpErrors.badRequest("chat is not available.");
        }
        const newChat = await createChat(fastify.prisma.chat, {
          userHashId: user.hashId,
          ...oldChat,
        });

        const newPost = await createEntity(fastify.prisma.post.create, {
          data: {
            title,
            post,
            userHashId: user.hashId,
            chatHashId: newChat.hashId,
          },
        });

        return { hashId: newPost.hashId };
      } catch (ex) {
        console.error("path: /post, method: post, error:", ex);
        throw ex;
      }
    }
  );
  fastify.put<{
    Params: Static<typeof ParamSchema>;
    Body: Static<typeof PostUpdateSchema>;
  }>(
    "/:hashId",
    { schema: { params: ParamSchema, body: PostUpdateSchema } },
    async (request, reply): Promise<PostCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;
        const { title, post } = request.body;

        const oldPost = await fastify.prisma.post.findFirst({
          where: { hashId, userHashId: user.hashId },
          select: {
            userHashId: true,
            post: true,
          },
        });
        if (!oldPost) {
          throw fastify.httpErrors.unauthorized("Post not found.");
        }

        await fastify.prisma.post.update({
          where: { hashId },
          data: { title, post },
        });

        return { hashId };
      } catch (ex) {
        console.error("path: /post/:hashId, method: put, error:", ex);
        throw ex;
      }
    }
  );
}
