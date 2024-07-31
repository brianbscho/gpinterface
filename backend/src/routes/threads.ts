import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getDateString } from "../util/string";
import { QueryParamSchema } from "gpinterface-shared/type";
import { getIdByHashId } from "../util/prisma";
import {
  SearchQueryParamSchema,
  ThreadsGetResponse,
  ThreadsUserGetSchema,
  ThreadsUserQueryParamSchema,
} from "gpinterface-shared/type/thread";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Querystring: Static<typeof QueryParamSchema> }>(
    "/",
    { schema: { querystring: QueryParamSchema } },
    async (request, reply): Promise<ThreadsGetResponse> => {
      try {
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.thread.findFirst,
          lastHashId
        );

        const threads = await fastify.prisma.thread.findMany({
          where: { ...(id > 0 && { id: { lt: id } }), isPublic: true },
          select: {
            hashId: true,
            title: true,
            isPublic: true,
            createdAt: true,
            user: { select: { hashId: true, name: true } },
            _count: { select: { posts: true } },
            posts: {
              select: {
                _count: { select: { likes: { where: { isLiked: true } } } },
              },
            },
          },
          orderBy: { id: "desc" },
          take: 20,
        });

        return {
          threads: threads.map((t) => {
            const { _count, posts, ...thread } = t;
            return {
              ...thread,
              likes: posts.reduce((acc, curr) => acc + curr._count.likes, 0),
              createdAt: getDateString(t.createdAt),
              posts: _count.posts,
            };
          }),
        };
      } catch (ex) {
        console.error("path: /threads, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.get<{ Querystring: Static<typeof SearchQueryParamSchema> }>(
    "/search",
    { schema: { querystring: SearchQueryParamSchema } },
    async (request, reply): Promise<ThreadsGetResponse> => {
      try {
        const { keyword, lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.thread.findFirst,
          lastHashId
        );
        const search = keyword.split(" ").join(" | ");

        const threads = await fastify.prisma.thread.findMany({
          where: {
            ...(id > 0 && { id: { lt: id } }),
            isPublic: true,
            OR: [
              { title: { search } },
              {
                posts: {
                  some: {
                    post: { search },
                  },
                },
              },
              {
                posts: {
                  some: {
                    textPrompts: { some: { systemMessage: { search } } },
                  },
                },
              },
              {
                posts: {
                  some: {
                    textPrompts: {
                      some: { messages: { some: { content: { search } } } },
                    },
                  },
                },
              },
              {
                posts: {
                  some: {
                    imagePrompts: { some: { prompt: { search } } },
                  },
                },
              },
            ],
          },
          select: {
            hashId: true,
            title: true,
            isPublic: true,
            createdAt: true,
            user: { select: { hashId: true, name: true } },
            _count: { select: { posts: true } },
            posts: {
              select: {
                _count: { select: { likes: { where: { isLiked: true } } } },
              },
            },
          },
          orderBy: { id: "desc" },
          take: 20,
        });

        return {
          threads: threads.map((t) => {
            const { _count, posts, ...thread } = t;
            return {
              ...thread,
              likes: posts.reduce((acc, curr) => acc + curr._count.likes, 0),
              createdAt: getDateString(t.createdAt),
              posts: _count.posts,
            };
          }),
        };
      } catch (ex) {
        console.error("path: /threads/search, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.get<{
    Params: Static<typeof ThreadsUserGetSchema>;
    Querystring: Static<typeof ThreadsUserQueryParamSchema>;
  }>(
    "/user/:userHashId",
    {
      schema: {
        params: ThreadsUserGetSchema,
        querystring: ThreadsUserQueryParamSchema,
      },
    },
    async (request, reply): Promise<ThreadsGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { userHashId } = request.params;
        const { lastHashId, type } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.thread.findFirst,
          lastHashId
        );

        const threads = await fastify.prisma.thread.findMany({
          where: {
            ...(id > 0 && { id: { lt: id } }),
            ...(user.hashId !== userHashId && { isPublic: true }),
            ...(type === "post" && { posts: { some: { userHashId } } }),
            ...(type === "bookmark" && {
              posts: { some: { bookmarks: { some: { userHashId } } } },
            }),
            ...(type === "thread" && { userHashId }),
          },
          select: {
            hashId: true,
            title: true,
            isPublic: true,
            createdAt: true,
            user: { select: { hashId: true, name: true } },
            _count: { select: { posts: true } },
            posts: {
              select: {
                _count: { select: { likes: { where: { isLiked: true } } } },
              },
            },
          },
          orderBy: { id: "desc" },
          take: 20,
        });

        return {
          threads: threads.map((t) => {
            const { _count, posts, ...thread } = t;
            return {
              ...thread,
              likes: posts.reduce((acc, curr) => acc + curr._count.likes, 0),
              createdAt: getDateString(t.createdAt),
              posts: _count.posts,
            };
          }),
        };
      } catch (ex) {
        console.error(
          "path: /threads/user/:userHashId?lastHashId, method: get, error:",
          ex
        );
        throw ex;
      }
    }
  );
}
