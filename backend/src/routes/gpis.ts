import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { getDateString } from "../util/string";
import {
  QueryParamSchema,
  SearchQueryParamSchema,
} from "gpinterface-shared/type";
import {
  ContentHistorySelect,
  getIdByHashId,
  getTypedContents,
} from "../util/prisma";
import { GpisGetResponse } from "gpinterface-shared/type/gpi";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Querystring: Static<typeof QueryParamSchema> }>(
    "/",
    { schema: { querystring: QueryParamSchema } },
    async (request, reply): Promise<GpisGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { lastHashId } = request.query;
        const id = await getIdByHashId(
          fastify.prisma.gpi.findFirst,
          lastHashId
        );

        const gpis = await fastify.prisma.gpi.findMany({
          where: {
            ...(id > 0 && { id: { lt: id } }),
            OR: [{ userHashId: user.hashId }, { isPublic: true }],
          },
          select: {
            hashId: true,
            userHashId: true,
            description: true,
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
                    model: { select: { hashId: true, name: true } },
                    histories: { select: ContentHistorySelect },
                    isModified: true,
                  },
                },
              },
            },
            config: true,
            modelHashId: true,
            isPublic: true,
          },
          orderBy: { id: "desc" },
          take: 5,
        });

        return {
          gpis: gpis.map((gpi) => {
            const { chat, config, ...rest } = gpi;
            return {
              ...rest,
              config: config as any,
              chat: { ...chat, contents: getTypedContents(chat.contents) },
            };
          }),
        };
      } catch (ex) {
        console.error("path: /gpis?lastHashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.get<{ Querystring: Static<typeof SearchQueryParamSchema> }>(
    "/search",
    { schema: { querystring: SearchQueryParamSchema } },
    async (request, reply): Promise<GpisGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { keyword, lastHashId } = request.query;
        const id = await getIdByHashId(
          fastify.prisma.gpi.findFirst,
          lastHashId
        );
        const search = keyword.split(" ").join(" | ");

        const gpis = await fastify.prisma.gpi.findMany({
          where: {
            ...(id > 0 && { id: { lt: id } }),
            AND: [
              { OR: [{ userHashId: user.hashId }, { isPublic: true }] },
              {
                OR: [
                  { description: { search } },
                  { chat: { systemMessage: { search } } },
                  { chat: { contents: { some: { content: { search } } } } },
                ],
              },
            ],
          },
          select: {
            hashId: true,
            userHashId: true,
            description: true,
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
                    model: { select: { hashId: true, name: true } },
                    histories: { select: ContentHistorySelect },
                    isModified: true,
                  },
                },
              },
            },
            config: true,
            modelHashId: true,
            isPublic: true,
          },
          orderBy: { id: "desc" },
          take: 5,
        });

        return {
          gpis: gpis.map((gpi) => {
            const { chat, config, ...rest } = gpi;
            return {
              ...rest,
              config: config as any,
              chat: { ...chat, contents: getTypedContents(chat.contents) },
            };
          }),
        };
      } catch (ex) {
        console.error(
          "path: /gpis/search?keyword&lastHashId, method: get, error:",
          ex
        );
        throw ex;
      }
    }
  );
  fastify.get<{
    Querystring: Static<typeof QueryParamSchema>;
  }>(
    "/user",
    { schema: { querystring: QueryParamSchema } },
    async (request, reply): Promise<GpisGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.gpi.findFirst,
          lastHashId
        );

        const gpis = await fastify.prisma.gpi.findMany({
          where: { ...(id > 0 && { id: { lt: id } }), userHashId: user.hashId },
          select: {
            hashId: true,
            userHashId: true,
            description: true,
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
                    model: { select: { hashId: true, name: true } },
                    histories: { select: ContentHistorySelect },
                    isModified: true,
                  },
                },
              },
            },
            config: true,
            modelHashId: true,
            isPublic: true,
          },
          orderBy: { id: "desc" },
          take: 5,
        });

        return {
          gpis: gpis.map((gpi) => {
            const { chat, config, ...rest } = gpi;
            return {
              ...rest,
              config: config as any,
              chat: { ...chat, contents: getTypedContents(chat.contents) },
            };
          }),
        };
      } catch (ex) {
        console.error("path: /gpis/user?lastHashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
}
