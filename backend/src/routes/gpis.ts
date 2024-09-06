import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  ListParamSchema,
  SearchQueryParamSchema,
} from "gpinterface-shared/type";
import {
  ContentHistorySelect,
  getIdByHashId,
  getTypedContents,
} from "../util/prisma";
import { GpisGetResponse } from "gpinterface-shared/type/gpi";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Querystring: Static<typeof ListParamSchema> }>(
    "/",
    { schema: { querystring: ListParamSchema } },
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
            systemMessage: true,
            chatContents: {
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
            config: true,
            modelHashId: true,
            isPublic: true,
          },
          orderBy: { id: "desc" },
          take: 5,
        });

        return gpis.map((gpi) => {
          const { config, chatContents, ...rest } = gpi;
          return {
            ...rest,
            config: config as any,
            chatContents: getTypedContents(chatContents),
          };
        });
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
                  { systemMessage: { search } },
                  { chatContents: { some: { content: { search } } } },
                ],
              },
            ],
          },
          select: {
            hashId: true,
            userHashId: true,
            description: true,
            systemMessage: true,
            chatContents: {
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
            config: true,
            modelHashId: true,
            isPublic: true,
          },
          orderBy: { id: "desc" },
          take: 5,
        });

        return gpis.map((gpi) => {
          const { chatContents, config, ...rest } = gpi;
          return {
            ...rest,
            config: config as any,
            chatContents: getTypedContents(chatContents),
          };
        });
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
    Querystring: Static<typeof ListParamSchema>;
  }>(
    "/user",
    { schema: { querystring: ListParamSchema } },
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
            systemMessage: true,
            chatContents: {
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
            config: true,
            modelHashId: true,
            isPublic: true,
          },
          orderBy: { id: "desc" },
          take: 5,
        });

        return gpis.map((gpi) => {
          const { chatContents, config, ...rest } = gpi;
          return {
            ...rest,
            config: config as any,
            chatContents: getTypedContents(chatContents),
          };
        });
      } catch (ex) {
        console.error("path: /gpis/user?lastHashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
}
