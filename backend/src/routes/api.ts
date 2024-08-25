import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  ApiCreateResponse,
  ApiCreateSchema,
  ApiGetResponse,
  ApiUpdateSchema,
} from "gpinterface-shared/type/api";
import { ParamSchema } from "gpinterface-shared/type";
import { createApi } from "../controllers/api";
import { ContentHistorySelect, getTypedContents } from "../util/prisma";

export default async function (fastify: FastifyInstance) {
  const { httpErrors } = fastify;

  fastify.get<{ Params: Static<typeof ParamSchema> }>(
    "/:hashId",
    { schema: { params: ParamSchema } },
    async (request, reply): Promise<ApiGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { hashId } = request.params;

        const api = await fastify.prisma.api.findFirst({
          where: {
            hashId,
            OR: [{ userHashId: user.hashId || null }, { isPublic: true }],
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
                  },
                },
              },
            },
            config: true,
            modelHashId: true,
            isPublic: true,
          },
        });
        if (!api) {
          throw fastify.httpErrors.badRequest("The api is not available.");
        }

        const { chat, config, ...rest } = api;
        return {
          ...rest,
          config: config as any,
          chat: { ...chat, contents: getTypedContents(chat.contents) },
        };
      } catch (ex) {
        console.error("path: /api/:hashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.post<{ Body: Static<typeof ApiCreateSchema> }>(
    "/",
    { schema: { body: ApiCreateSchema } },
    async (request, reply): Promise<ApiCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { description, chatHashId, ...body } = request.body;

        if (description.trim() === "") {
          throw httpErrors.badRequest("description is empty.");
        }

        const userHashId = user.hashId || null;
        const chat = await fastify.prisma.chat.findFirst({
          where: {
            hashId: chatHashId,
            OR: [{ userHashId }, { apis: { every: { isPublic: true } } }],
          },
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
          userHashId,
          ...chat,
          apis: { description, userHashId, ...body },
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
        const { user } = await fastify.getUser(request, reply, true);
        const { hashId } = request.params;
        const { description, config, modelHashId, isPublic } = request.body;

        const oldApi = await fastify.prisma.api.findFirst({
          where: { hashId, userHashId: user.hashId || null },
          select: { hashId: true },
        });
        if (!oldApi) {
          throw fastify.httpErrors.unauthorized("Api not found.");
        }

        const isIsPublicBoolean = typeof isPublic === "boolean";
        if (description || config || modelHashId || isIsPublicBoolean) {
          await fastify.prisma.api.update({
            where: { hashId },
            data: {
              ...(!!description && { description }),
              ...(!!config && { config }),
              ...(!!modelHashId && { modelHashId }),
              ...(isIsPublicBoolean && { isPublic }),
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
