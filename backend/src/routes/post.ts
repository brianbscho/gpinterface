import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { createPost } from "../controllers/post";
import {
  PostCreateResponse,
  PostCreateSchema,
  PostGetSchema,
  PostGetResponse,
  PostUpdateSchema,
} from "gpinterface-shared/type/post";
import { getDateString } from "../util/string";
import { confirmTextPrompt, getTypedTextPrompts } from "../util/textPrompt";
import { isAccessible } from "../util/thread";
import { confirmImagePrompt, getTypedImagePrompts } from "../util/imagePrompt";
import { createEntity } from "../util/prisma";

export default async function (fastify: FastifyInstance) {
  const { httpErrors } = fastify;

  fastify.get<{ Params: Static<typeof PostGetSchema> }>(
    "/:hashId",
    { schema: { params: PostGetSchema } },
    async (request, reply): Promise<PostGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;

        const post = await fastify.prisma.post.findFirst({
          where: { hashId },
          select: {
            thread: { select: { hashId: true, isPublic: true, title: true } },
            hashId: true,
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
        });
        if (!post) {
          throw fastify.httpErrors.badRequest("The post is not available.");
        }
        isAccessible(
          { isPublic: post.thread.isPublic, userHashId: post.user?.hashId },
          user
        );

        const { thread, bookmarks, likes, _count, ...rest } = post;
        return {
          thread,
          post: {
            ...rest,
            createdAt: getDateString(post.createdAt),
            isBookmarked: bookmarks[0]?.isBookmarked || false,
            isLiked: likes[0]?.isLiked || false,
            likes: _count.likes,
            textPrompts: getTypedTextPrompts(post.textPrompts),
            imagePrompts: getTypedImagePrompts(post.imagePrompts),
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
        const { threadHashId, post, textPrompts, imagePrompts } = request.body;

        if (!confirmTextPrompt(textPrompts)) {
          throw httpErrors.badRequest("Provided text prompt is invalid.");
        }
        if (!confirmImagePrompt(imagePrompts)) {
          throw httpErrors.badRequest("Provided image prompt is invalid.");
        }

        const thread = await fastify.prisma.thread.findFirst({
          where: { hashId: threadHashId },
          select: { isPublic: true, userHashId: true },
        });
        if (!thread) {
          throw httpErrors.badRequest("The thread is not available.");
        }
        isAccessible(thread, user);

        const newPost = await createPost(fastify.prisma.post, {
          post,
          textPrompts,
          imagePrompts,
          threadHashId,
          userHashId: user.hashId,
        });

        const { userHashId } = thread;
        if (userHashId !== null && userHashId !== user.hashId) {
          await createEntity(fastify.prisma.notification.create, {
            data: {
              userHashId: userHashId,
              message: `${user.name} wrote a post on your thread!`,
              url: `/thread/${threadHashId}`,
            },
          });
        }

        return { hashId: newPost.hashId };
      } catch (ex) {
        console.error("path: /post, method: post, error:", ex);
        throw ex;
      }
    }
  );
  fastify.put<{ Body: Static<typeof PostUpdateSchema> }>(
    "/",
    { schema: { body: PostUpdateSchema } },
    async (request, reply): Promise<PostCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId, post: _post } = request.body;

        const post = await fastify.prisma.post.findFirst({
          where: { hashId },
          select: {
            userHashId: true,
            post: true,
            thread: { select: { isPublic: true, userHashId: true } },
          },
        });
        if (!post) {
          throw fastify.httpErrors.unauthorized("Post not found.");
        }
        isAccessible(post.thread, user);

        if (post.post !== _post) {
          await fastify.prisma.post.update({
            where: { hashId: hashId },
            data: { post: _post },
          });
        }

        return { hashId };
      } catch (ex) {
        console.error("path: /post, method: put, error:", ex);
        throw ex;
      }
    }
  );
}
