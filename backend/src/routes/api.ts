import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  ApiChatsGetResponse,
  ApiCreateResponse,
  ApiCreateSchema,
  ApiGetResponse,
  ApiSessionsGetResponse,
  ApiUpdateSchema,
} from "gpinterface-shared/type/api";
import { ParamSchema, QueryParamSchema } from "gpinterface-shared/type";
import { getTypedContent } from "../util/content";
import { createApi } from "../controllers/api";
import { getIdByHashId } from "../util/prisma";
import { getDateString } from "../util/string";

export default async function (fastify: FastifyInstance) {
  const { httpErrors } = fastify;

  fastify.get<{ Params: Static<typeof ParamSchema> }>(
    "/:hashId",
    { schema: { params: ParamSchema } },
    async (request, reply): Promise<ApiGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;

        const api = await fastify.prisma.api.findFirst({
          where: { hashId, userHashId: user.hashId },
          select: {
            hashId: true,
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
                  },
                },
              },
            },
            config: true,
            modelHashId: true,
          },
        });
        if (!api) {
          throw fastify.httpErrors.badRequest("The api is not available.");
        }

        const { chat, config, ...rest } = api;
        return {
          api: {
            ...rest,
            config: config as any,
            chat: {
              ...chat,
              contents: chat.contents.map((c) => getTypedContent(c)),
            },
          },
        };
      } catch (ex) {
        console.error("path: /api/:hashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.get<{
    Params: Static<typeof ParamSchema>;
    Querystring: Static<typeof QueryParamSchema>;
  }>(
    "/:hashId/chats",
    { schema: { params: ParamSchema, querystring: QueryParamSchema } },
    async (request, reply): Promise<ApiChatsGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.history.findFirst,
          lastHashId
        );

        const histories = await fastify.prisma.history.findMany({
          where: {
            ...(id > 0 && { id: { lt: id } }),
            apiHashId: hashId,
            userHashId: user.hashId,
          },
          select: {
            hashId: true,
            messages: true,
            content: true,
            createdAt: true,
          },
          orderBy: { id: "desc" },
          take: 20,
        });

        return {
          chats: histories.map((h) => {
            const messages = [];
            if (
              Array.isArray(h.messages) &&
              h.messages.every(
                (m: any) =>
                  typeof m === "object" &&
                  m !== null &&
                  typeof m.role === "string" &&
                  typeof m.content === "string"
              )
            ) {
              const message = h.messages[h.messages.length - 1] as {
                role: string;
                content: string;
              };
              messages.push(message);
            }
            messages.push({ role: "assistant", content: h.content });
            return {
              hashId: h.hashId,
              createdAt: getDateString(h.createdAt),
              messages,
            };
          }),
        };
      } catch (ex) {
        console.error("path: /api/:hashId/chats, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.get<{
    Params: Static<typeof ParamSchema>;
    Querystring: Static<typeof QueryParamSchema>;
  }>(
    "/:hashId/sessions",
    { schema: { params: ParamSchema, querystring: QueryParamSchema } },
    async (request, reply): Promise<ApiSessionsGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;
        const { lastHashId } = request.query;

        const id = await getIdByHashId(
          fastify.prisma.session.findFirst,
          lastHashId
        );

        const sessions = await fastify.prisma.session.findMany({
          where: {
            ...(id > 0 && { id: { lt: id } }),
            api: { hashId, userHashId: user.hashId },
          },
          select: {
            hashId: true,
            messages: { select: { hashId: true, role: true, content: true } },
            createdAt: true,
          },
          orderBy: { id: "desc" },
          take: 20,
        });

        return {
          sessions: sessions.map((s) => ({
            ...s,
            createdAt: getDateString(s.createdAt),
          })),
        };
      } catch (ex) {
        console.error("path: /api/:hashId/sessions, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.post<{ Body: Static<typeof ApiCreateSchema> }>(
    "/",
    { schema: { body: ApiCreateSchema } },
    async (request, reply): Promise<ApiCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { description, chatHashId, modelHashId, config } = request.body;

        if (description.trim() === "") {
          throw httpErrors.badRequest("description is empty.");
        }

        const chat = await fastify.prisma.chat.findFirst({
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
        if (!chat) {
          throw httpErrors.badRequest("chat is not available.");
        }

        const newApi = await createApi(fastify.prisma.chat, {
          userHashId: user.hashId,
          ...chat,
          apis: { description, userHashId: user.hashId, modelHashId, config },
        });

        return { hashId: newApi.hashId };
      } catch (ex) {
        console.error("path: /api, method: post, error:", ex);
        throw ex;
      }
    }
  );
  fastify.put<{
    Params: Static<typeof ParamSchema>;
    Body: Static<typeof ApiUpdateSchema>;
  }>(
    "/:hashId",
    { schema: { params: ParamSchema, body: ApiUpdateSchema } },
    async (request, reply): Promise<ApiCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;
        const { description, config, modelHashId } = request.body;

        const oldApi = await fastify.prisma.api.findFirst({
          where: { hashId, userHashId: user.hashId },
          select: { hashId: true },
        });
        if (!oldApi) {
          throw fastify.httpErrors.unauthorized("Api not found.");
        }

        if (description || config || modelHashId) {
          await fastify.prisma.api.update({
            where: { hashId },
            data: {
              ...(!!description && { description }),
              ...(!!config && { config }),
              ...(!!modelHashId && { modelHashId }),
            },
          });
        }

        return { hashId };
      } catch (ex) {
        console.error("path: /api/:hashId, method: put, error:", ex);
        throw ex;
      }
    }
  );
}
