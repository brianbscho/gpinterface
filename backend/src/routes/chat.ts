import { FastifyInstance } from "fastify";
import {
  createEntity,
  ContentHistorySelect,
  getTypedContents,
  ChatCompletionModelSelect,
  ChatCompletionContentsQuery,
} from "../util/prisma";
import {
  ChatCreateResponse,
  ChatUpdateSchema,
  ChatUpdateResponse,
  ChatsGetResponse,
  ChatCompletionSchema,
  ChatCompletionResponse,
} from "gpinterface-shared/type/chat";
import { Static } from "@sinclair/typebox";
import { ParamSchema } from "gpinterface-shared/type";
import { getDateString } from "../util/string";
import { getTextResponse } from "../util/text";
import { Prisma } from "@prisma/client";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: Static<typeof ParamSchema> }>(
    "/:hashId",
    { schema: { params: ParamSchema } },
    async (request, reply): Promise<ChatsGetResponse["chats"][0]> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { hashId } = request.params;

        const chat = await fastify.prisma.chat.findFirst({
          where: {
            hashId,
            OR: [{ userHashId: user.hashId }, { userHashId: null }],
          },
          select: {
            hashId: true,
            userHashId: true,
            systemMessage: true,
            contents: {
              select: {
                hashId: true,
                model: { select: { hashId: true, name: true } },
                role: true,
                content: true,
                config: true,
                histories: { select: ContentHistorySelect },
                isModified: true,
              },
              orderBy: { id: "asc" },
            },
            createdAt: true,
          },
          orderBy: { id: "desc" },
          take: 5,
        });
        if (!chat) {
          throw fastify.httpErrors.badRequest("chat is not available.");
        }

        const { createdAt, contents, ...rest } = chat;
        return {
          ...rest,
          contents: getTypedContents(contents),
          createdAt: getDateString(createdAt),
        };
      } catch (ex) {
        console.error("path: /chat/:hashId, method: get, error:", ex);
        throw ex;
      }
    }
  );
  fastify.post("/", async (request, reply): Promise<ChatCreateResponse> => {
    try {
      const { user } = await fastify.getUser(request, reply, true);
      const userHashId = user.hashId || null;

      const chat = await createEntity(fastify.prisma.chat.create, {
        data: { userHashId },
        select: { hashId: true, createdAt: true },
      });

      return {
        hashId: chat.hashId,
        userHashId,
        systemMessage: "",
        contents: [],
        createdAt: getDateString(chat.createdAt),
      };
    } catch (ex) {
      console.error("path: /chat, method: post, error:", ex);
      throw ex;
    }
  });
  fastify.put<{
    Params: Static<typeof ParamSchema>;
    Body: Static<typeof ChatUpdateSchema>;
  }>(
    "/:hashId",
    { schema: { params: ParamSchema, body: ChatUpdateSchema } },
    async (request, reply): Promise<ChatUpdateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { hashId } = request.params;
        const { systemMessage } = request.body;

        const chat = await fastify.prisma.chat.findFirst({
          where: {
            hashId,
            OR: [{ userHashId: user.hashId }, { userHashId: null }],
          },
          select: { userHashId: true },
        });
        if (!chat) {
          throw fastify.httpErrors.badRequest("chat is not available.");
        }

        await fastify.prisma.chat.update({
          where: { hashId },
          data: { systemMessage },
        });

        return { systemMessage };
      } catch (ex) {
        console.error("path: /chat/:hashId, method: put, error:", ex);
        throw ex;
      }
    }
  );
  fastify.post<{ Body: Static<typeof ChatCompletionSchema> }>(
    "/completion",
    { schema: { body: ChatCompletionSchema } },
    async (request, reply): Promise<ChatCompletionResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { gpiHashId, message } = request.body;

        const gpi = await fastify.prisma.gpi.findFirst({
          where: {
            hashId: gpiHashId,
            OR: [
              { userHashId: user.hashId },
              { userHashId: null },
              { isPublic: true },
            ],
            model: { isAvailable: true, isFree: true },
          },
          select: {
            config: true,
            model: { select: ChatCompletionModelSelect },
            chat: {
              select: {
                systemMessage: true,
                contents: ChatCompletionContentsQuery,
              },
            },
          },
        });

        if (!gpi) {
          throw fastify.httpErrors.badRequest("gpi is not available.");
        }
        if (gpi.chat.contents.some((c) => c.content === "")) {
          throw fastify.httpErrors.badRequest(
            "There is empty content in chat."
          );
        }

        const { chat, config, model } = gpi;
        const { systemMessage, contents } = chat;
        const messages = contents.concat({
          role: "user",
          content: message,
        });
        const { content, ...response } = await getTextResponse({
          model,
          systemMessage,
          config: config as any,
          messages,
        });

        await createEntity(fastify.prisma.history.create, {
          data: {
            userHashId: user.hashId || null,
            gpiHashId,
            provider: model.provider.name,
            model: model.name,
            config: config ?? Prisma.JsonNull,
            messages: (systemMessage
              ? [{ role: "system", content: systemMessage }]
              : []
            ).concat(messages),
            content,
            ...response,
          },
        });

        return { content };
      } catch (ex) {
        console.error("path: /chat/completion, method: post, error:", ex);
        throw ex;
      }
    }
  );
}
