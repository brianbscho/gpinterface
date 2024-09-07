import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  LastHashIdParam,
  HashIdParam,
  SearchQueryHashIdParam,
} from "gpinterface-shared/type";
import {
  ContentHistorySelect,
  getIdByHashId,
  getTypedContents,
} from "../../util/prisma";
import { GpiGetResponse, GpisGetResponse } from "gpinterface-shared/type/gpi";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: Static<typeof HashIdParam> }>(
    "/:hashId",
    { schema: { params: HashIdParam } },
    async (request, reply): Promise<GpiGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { hashId } = request.params;

        const gpi = await fastify.prisma.gpi.findFirst({
          where: {
            hashId,
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
              where: { isDeployed: true },
              orderBy: { id: "asc" },
            },
            config: true,
            modelHashId: true,
            isPublic: true,
          },
        });
        if (!gpi) {
          throw fastify.httpErrors.badRequest("The gpi is not available.");
        }

        const { config, chatContents, ...rest } = gpi;
        return {
          ...rest,
          config: config as any,
          chatContents: getTypedContents(chatContents),
        };
      } catch (ex) {
        console.error("path: /gpis/:hashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.get<{ Querystring: Static<typeof LastHashIdParam> }>(
    "/",
    { schema: { querystring: LastHashIdParam } },
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
              where: { isDeployed: true },
              orderBy: { id: "asc" },
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
  fastify.get<{ Querystring: Static<typeof SearchQueryHashIdParam> }>(
    "/search",
    { schema: { querystring: SearchQueryHashIdParam } },
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
              where: { isDeployed: true },
              orderBy: { id: "asc" },
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
}
