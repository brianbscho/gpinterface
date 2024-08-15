import { FastifyInstance } from "fastify";
import { createEntity } from "../util/prisma";
import {
  ChatCreateSchema,
  ChatCreateResponse,
  ChatDuplicateResponse,
  ChatUpdateSchema,
  ChatUpdateResponse,
} from "gpinterface-shared/type/chat";
import { Static } from "@sinclair/typebox";
import { ParamSchema } from "gpinterface-shared/type";
import { createChat } from "../controllers/chat";
import { getDateString } from "../util/string";
import { getTextResponse } from "../util/text";
import { MILLION } from "../util/model";
import { getTypedContent } from "../util/content";

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Static<typeof ChatCreateSchema> }>(
    "/",
    { schema: { body: ChatCreateSchema } },
    async (request, reply): Promise<ChatCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { modelHashId, content: userContent, config } = request.body;

        const model = await fastify.prisma.model.findFirst({
          where: {
            hashId: modelHashId,
            isAvailable: true,
            isFree: true,
            ...(user.hashId === "" && { isLoginRequired: false }),
          },
          select: {
            name: true,
            inputPricePerMillion: true,
            outputPricePerMillion: true,
            provider: { select: { name: true } },
          },
        });
        if (!model) {
          throw fastify.httpErrors.badRequest("model is not available.");
        }

        const chat = await createEntity(fastify.prisma.chat.create, {
          data: { ...(user.hashId.length > 0 && { userHashId: user.hashId }) },
          select: { hashId: true, createdAt: true },
        });

        const messages = [];
        messages.push({ role: "user", content: userContent });
        let { content, response, inputTokens, outputTokens } =
          await getTextResponse({
            provider: model.provider.name,
            model: model.name,
            systemMessage: "",
            config,
            messages,
          });
        const price =
          (model.inputPricePerMillion * inputTokens) / MILLION +
          (model.outputPricePerMillion * outputTokens) / MILLION;

        if (user.hashId.length > 0) {
          await createEntity(fastify.prisma.history.create, {
            data: {
              userHashId: user.hashId,
              chatHashId: chat.hashId,
              provider: model.provider.name,
              model: model.name,
              config,
              messages,
              content,
              response,
              price,
              inputTokens,
              outputTokens,
            },
          });
        }
        const userNewContent = await createEntity(
          fastify.prisma.chatContent.create,
          {
            data: {
              chatHashId: chat.hashId,
              modelHashId,
              config,
              role: "user",
              content: userContent,
            },
            select: {
              hashId: true,
              model: { select: { hashId: true, name: true } },
              role: true,
              content: true,
            },
          }
        );
        const assistantNewContent = await createEntity(
          fastify.prisma.chatContent.create,
          {
            data: {
              chatHashId: chat.hashId,
              modelHashId,
              config,
              role: "assistant",
              content,
            },
            select: {
              hashId: true,
              model: { select: { hashId: true, name: true } },
              role: true,
              content: true,
            },
          }
        );

        return getTypedContent({
          hashId: chat.hashId,
          isApi: false,
          isPost: false,
          systemMessage: "",
          contents: [userNewContent, assistantNewContent],
          config,
          createdAt: getDateString(chat.createdAt),
        });
      } catch (ex) {
        console.error("path: /chat, method: post, error:", ex);
        throw ex;
      }
    }
  );
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
          where: { hashId },
          select: { userHashId: true },
        });
        if (!chat || (chat.userHashId && chat.userHashId !== user.hashId)) {
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
  fastify.post<{ Params: Static<typeof ParamSchema> }>(
    "/duplicate/:hashId",
    { schema: { params: ParamSchema } },
    async (request, reply): Promise<ChatDuplicateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;

        const oldChat = await fastify.prisma.chat.findFirst({
          where: { hashId },
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
          throw fastify.httpErrors.badRequest("chat is not available.");
        }
        const newChat = await createChat(fastify.prisma.chat, {
          userHashId: user.hashId,
          ...oldChat,
        });
        return newChat;
      } catch (ex) {
        console.error(
          "path: /chat/duplicate/:hashId, method: post, error:",
          ex
        );
        throw ex;
      }
    }
  );
}
