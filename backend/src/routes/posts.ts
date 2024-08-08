import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getDateString } from "../util/string";
import { QueryParamSchema } from "gpinterface-shared/type";
import { getIdByHashId } from "../util/prisma";
import {
  PostsCommentGetResponse,
  PostsGetResponse,
  PostsUserParamSchema,
  SearchQueryParamSchema,
} from "gpinterface-shared/type/post";

const PostsSelectQuery = {
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
  orderBy: { id: "desc" },
  take: 20,
} as const;

const getTypedPostResponse = (post: {
  post: string;
  hashId: string;
  createdAt: Date;
  title: string;
  chat: {
    systemMessage: string;
    contents: { hashId: string; content: string; role: string }[];
  };
  user: { hashId: string; name: string } | null;
  _count: { likes: number; comments: number };
}) => {
  const { chat, createdAt, _count, ...p } = post;
  return {
    ...p,
    systemMessage: chat.systemMessage,
    messages: chat.contents,
    createdAt: getDateString(createdAt),
    likes: _count.likes,
    comments: _count.comments,
  };
};

export default async function (fastify: FastifyInstance) {
  fastify.get<{
    Querystring: Static<typeof QueryParamSchema>;
  }>(
    "/",
    { schema: { querystring: QueryParamSchema } },
    async (request, reply): Promise<PostsGetResponse> => {
      try {
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.post.findFirst,
          lastHashId
        );

        const posts = await fastify.prisma.post.findMany({
          where: { ...(id > 0 && { id: { lt: id } }) },
          ...PostsSelectQuery,
        });

        return { posts: posts.map((p) => getTypedPostResponse(p)) };
      } catch (ex) {
        console.error("path: /posts/?lastHashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.get<{
    Querystring: Static<typeof SearchQueryParamSchema>;
  }>(
    "/search",
    { schema: { querystring: SearchQueryParamSchema } },
    async (request, reply): Promise<PostsGetResponse> => {
      try {
        const { keyword, lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.post.findFirst,
          lastHashId
        );
        const search = keyword.split(" ").join(" | ");

        const posts = await fastify.prisma.post.findMany({
          where: {
            ...(id > 0 && { id: { lt: id } }),
            OR: [
              { title: { search } },
              {
                post: { search },
              },
              {
                chat: { systemMessage: { search } },
              },
              {
                chat: { contents: { some: { content: { search } } } },
              },
            ],
          },
          ...PostsSelectQuery,
        });

        return { posts: posts.map((p) => getTypedPostResponse(p)) };
      } catch (ex) {
        console.error(
          "path: /posts/search?keyword&lastHashId, method: get, error:",
          ex
        );
        throw ex;
      }
    }
  );
  fastify.get<{
    Querystring: Static<typeof QueryParamSchema>;
  }>(
    "/bookmark",
    { schema: { querystring: QueryParamSchema } },
    async (request, reply): Promise<PostsGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.post.findFirst,
          lastHashId
        );

        const posts = await fastify.prisma.post.findMany({
          where: {
            ...(id > 0 && { id: { lt: id } }),
            bookmarks: { some: { userHashId: user.hashId } },
          },
          ...PostsSelectQuery,
        });

        return { posts: posts.map((p) => getTypedPostResponse(p)) };
      } catch (ex) {
        console.error(
          "path: /posts/bookmark?lastHashId, method: get, error:",
          ex
        );
        throw ex;
      }
    }
  );
  fastify.get<{
    Querystring: Static<typeof QueryParamSchema>;
  }>(
    "/like",
    { schema: { querystring: QueryParamSchema } },
    async (request, reply): Promise<PostsGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.post.findFirst,
          lastHashId
        );

        const posts = await fastify.prisma.post.findMany({
          where: {
            ...(id > 0 && { id: { lt: id } }),
            likes: { some: { userHashId: user.hashId } },
          },
          ...PostsSelectQuery,
        });

        return { posts: posts.map((p) => getTypedPostResponse(p)) };
      } catch (ex) {
        console.error("path: /posts/like?lastHashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.get<{
    Params: Static<typeof PostsUserParamSchema>;
    Querystring: Static<typeof QueryParamSchema>;
  }>(
    "/user/:userHashId",
    { schema: { params: PostsUserParamSchema, querystring: QueryParamSchema } },
    async (request, reply): Promise<PostsGetResponse> => {
      try {
        const { userHashId } = request.params;
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.post.findFirst,
          lastHashId
        );

        const posts = await fastify.prisma.post.findMany({
          where: {
            ...(id > 0 && { id: { lt: id } }),
            userHashId,
          },
          ...PostsSelectQuery,
        });

        return { posts: posts.map((p) => getTypedPostResponse(p)) };
      } catch (ex) {
        console.error(
          "path: /posts/user/:userHashId?lastHashId, method: get, error:",
          ex
        );
        throw ex;
      }
    }
  );
  fastify.get<{
    Querystring: Static<typeof QueryParamSchema>;
  }>(
    "/comment",
    { schema: { querystring: QueryParamSchema } },
    async (request, reply): Promise<PostsCommentGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.post.findFirst,
          lastHashId
        );

        const { select, orderBy, take } = PostsSelectQuery;
        const posts = await fastify.prisma.post.findMany({
          where: {
            ...(id > 0 && { id: { lt: id } }),
            comments: { some: { userHashId: user.hashId } },
          },
          select: {
            ...select,
            comments: {
              select: { comment: true },
              where: { userHashId: user.hashId },
            },
          },
          orderBy,
          take,
        });

        return {
          posts: posts
            .filter((p) => p.comments.length > 0)
            .map((p) => {
              const { comments, ...post } = p;
              return {
                comment: comments[0].comment,
                ...getTypedPostResponse(post),
              };
            }),
        };
      } catch (ex) {
        console.error(
          "path: /posts/comment?lastHashId, method: get, error:",
          ex
        );
        throw ex;
      }
    }
  );
}
