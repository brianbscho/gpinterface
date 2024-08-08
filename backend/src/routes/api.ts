import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  ApiCreateResponse,
  ApiCreateSchema,
  ApiGetResponse,
  ApiUpdateSchema,
} from "gpinterface-shared/type/api";
import { createEntity } from "../util/prisma";
import { ParamSchema } from "gpinterface-shared/type";
import { createChat } from "../controllers/chat";
import { getTypedContent } from "../util/content";

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
                    model: { select: { hashId: true, providerHashId: true } },
                  },
                },
              },
            },
          },
        });
        if (!api) {
          throw fastify.httpErrors.badRequest("The api is not available.");
        }

        const { chat, ...rest } = api;
        return {
          api: {
            ...rest,
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
  fastify.post<{ Body: Static<typeof ApiCreateSchema> }>(
    "/",
    { schema: { body: ApiCreateSchema } },
    async (request, reply): Promise<ApiCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { description, chatHashId } = request.body;

        if (description.trim() === "") {
          throw httpErrors.badRequest("description is empty.");
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

        const newApi = await createEntity(fastify.prisma.api.create, {
          data: {
            description,
            userHashId: user.hashId,
            chatHashId: newChat.hashId,
          },
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
        const { description } = request.body;

        const oldApi = await fastify.prisma.api.findFirst({
          where: { hashId, userHashId: user.hashId },
          select: { hashId: true },
        });
        if (!oldApi) {
          throw fastify.httpErrors.unauthorized("Api not found.");
        }

        await fastify.prisma.api.update({
          where: { hashId },
          data: { description },
        });

        return { hashId };
      } catch (ex) {
        console.error("path: /api/:hashId, method: put, error:", ex);
        throw ex;
      }
    }
  );
}