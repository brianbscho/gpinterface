import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { createThread } from "../controllers/thread";
import { getDateString } from "../util/string";
import {
  ThreadCreateResponse,
  ThreadCreateSchema,
  ThreadGetSchema,
  ThreadGetResponse,
  ThreadUpdateSchema,
} from "gpinterface-shared/type/thread";
import { isAccessible } from "../util/thread";
import { confirmTextPrompt } from "../util/textPrompt";

export default async function (fastify: FastifyInstance) {
  const { httpErrors } = fastify;

  fastify.get<{ Params: Static<typeof ThreadGetSchema> }>(
    "/:hashId",
    { schema: { params: ThreadGetSchema } },
    async (request, reply): Promise<ThreadGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { hashId } = request.params;

        const thread = await fastify.prisma.thread.findFirst({
          where: { hashId },
          select: {
            hashId: true,
            title: true,
            isPublic: true,
            createdAt: true,
            user: { select: { hashId: true, name: true } },
            _count: { select: { posts: true } },
          },
        });

        if (!thread) {
          throw httpErrors.unauthorized("The post is not available.");
        }
        isAccessible(
          { isPublic: thread.isPublic, userHashId: thread.user?.hashId },
          user
        );

        const { _count, ...rest } = thread;

        return {
          thread: {
            ...rest,
            posts: thread._count.posts,
            createdAt: getDateString(thread.createdAt),
          },
        };
      } catch (ex) {
        console.error("path: /thread/:hashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.post<{ Body: Static<typeof ThreadCreateSchema> }>(
    "/",
    { schema: { body: ThreadCreateSchema } },
    async (request, reply): Promise<ThreadCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { title, isPublic, posts } = request.body;

        if (posts.some((p) => !confirmTextPrompt(p.textPrompts))) {
          throw httpErrors.badRequest(
            "Provided prompt is invalid. Please check it again."
          );
        }
        if (!user.hashId && !isPublic) {
          throw httpErrors.badRequest(
            "Logged out user cannot create private thread."
          );
        }

        const newThread = await createThread(fastify.prisma.thread, {
          userHashId: user.hashId,
          title,
          isPublic,
          posts,
        });

        return { hashId: newThread.hashId };
      } catch (ex) {
        console.error("path: /thread, method: post, error:", ex);
        throw ex;
      }
    }
  );
  fastify.put<{ Body: Static<typeof ThreadUpdateSchema> }>(
    "/",
    { schema: { body: ThreadUpdateSchema } },
    async (request, reply): Promise<ThreadCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId, title } = request.body;

        const thread = await fastify.prisma.thread.findFirst({
          where: { hashId },
          select: { isPublic: true, userHashId: true, title: true },
        });
        if (!thread) {
          throw fastify.httpErrors.unauthorized("Thread not found.");
        }
        isAccessible(thread, user);

        if (thread.title !== title) {
          await fastify.prisma.thread.update({
            where: { hashId: hashId },
            data: { title: title },
          });
        }

        return { hashId };
      } catch (ex) {
        console.error("path: /thread, method: put, error:", ex);
        throw ex;
      }
    }
  );
}
