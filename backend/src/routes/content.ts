import { FastifyInstance } from "fastify";
import {
  getTypedContent,
  createEntity,
  getIdByHashId,
  getTypedHistory,
  ChatCompletionModelSelect,
  ChatCompletionContentsQuery,
  ContentHistorySelect,
} from "../util/prisma";
import {
  Content,
  ContentCreateSchema,
  ContentRefreshSchema,
  ContentsCreateResponse,
  ContentUpdateResponse,
  ContentUpdateSchema,
} from "gpinterface-shared/type/content";
import { Static } from "@sinclair/typebox";
import { getTextResponse } from "../util/text";
import { ParamSchema } from "gpinterface-shared/type";
import { nanoid } from "nanoid";

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Static<typeof ContentCreateSchema> }>(
    "/",
    { schema: { body: ContentCreateSchema } },
    async (request, reply): Promise<ContentsCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { content: userContent, gpiHashId, ...body } = request.body;

        const model = await fastify.prisma.model.findFirst({
          where: {
            hashId: body.modelHashId,
            isAvailable: true,
            isFree: true,
            ...(!user.hashId && { isLoginRequired: false }),
          },
          select: ChatCompletionModelSelect,
        });
        if (!model) {
          throw fastify.httpErrors.badRequest("model is not available.");
        }

        const chat = await fastify.prisma.chat.findFirst({
          where: {
            hashId: body.chatHashId,
            OR: [
              { userHashId: user.hashId },
              { userHashId: null, gpis: { none: {} } },
            ],
          },
          select: {
            systemMessage: true,
            contents: ChatCompletionContentsQuery,
            userHashId: true,
          },
        });
        if (!chat) {
          throw fastify.httpErrors.badRequest("chat is not available.");
        }
        if (chat.contents.some((c) => c.content === "")) {
          throw fastify.httpErrors.badRequest(
            "There is empty content in chat."
          );
        }

        const { systemMessage, contents } = chat;
        const messages = [...contents];
        messages.push({ role: "user", content: userContent });
        let { content, ...response } = await getTextResponse({
          model,
          systemMessage,
          config: body.config,
          messages,
        });

        const history = await createEntity(fastify.prisma.history.create, {
          data: {
            userHashId: user.hashId || null,
            chatHashId: body.chatHashId,
            gpiHashId,
            provider: model.provider.name,
            model: model.name,
            config: body.config,
            messages: (systemMessage
              ? [{ role: "system", content: systemMessage }]
              : []
            ).concat(messages),
            content,
            ...response,
          },
          select: { ...ContentHistorySelect, hashId: true },
        });

        const newContents = [
          {
            hashId: nanoid(),
            role: "user",
            content: userContent,
            isModified: false,
          },
          {
            hashId: nanoid(),
            model: { hashId: body.modelHashId, name: model.name },
            role: "assistant",
            content,
            config: body.config,
            history: getTypedHistory(history),
            isModified: false,
          },
        ];

        if (!chat.userHashId || chat.userHashId === user.hashId) {
          const _userContent = await createEntity(
            fastify.prisma.chatContent.create,
            {
              data: {
                chatHashId: body.chatHashId,
                role: "user",
                content: userContent,
              },
              select: { hashId: true },
            }
          );
          newContents[0].hashId = _userContent.hashId;
          const _assistantContent = await createEntity(
            fastify.prisma.chatContent.create,
            {
              data: { ...body, role: "assistant", content },
              select: { hashId: true },
            }
          );
          newContents[1].hashId = _assistantContent.hashId;
          await fastify.prisma.history.update({
            where: { hashId: history.hashId },
            data: { chatContentHashId: _assistantContent.hashId },
          });
        }

        return { contents: newContents };
      } catch (ex) {
        console.error("path: /content, method: post, error:", ex);
        throw ex;
      }
    }
  );
  fastify.put<{
    Params: Static<typeof ParamSchema>;
    Body: Static<typeof ContentUpdateSchema>;
  }>(
    "/:hashId",
    { schema: { params: ParamSchema, body: ContentUpdateSchema } },
    async (request, reply): Promise<ContentUpdateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { hashId } = request.params;
        const { content } = request.body;

        const oldContent = await fastify.prisma.chatContent.findFirst({
          where: {
            hashId,
            chat: {
              OR: [
                { userHashId: user.hashId },
                { userHashId: null, gpis: { none: {} } },
              ],
            },
          },
          select: { hashId: true, role: true, modelHashId: true },
        });
        if (!oldContent) {
          throw fastify.httpErrors.badRequest("content is not available.");
        }

        const isModified =
          oldContent.role !== "user" && !!oldContent.modelHashId;
        await fastify.prisma.chatContent.update({
          where: { hashId },
          data: { content, isModified },
        });

        return { hashId, content, isModified };
      } catch (ex) {
        console.error("path: /content/:hashId, method: put, error:", ex);
        throw ex;
      }
    }
  );
  fastify.put<{
    Params: Static<typeof ParamSchema>;
    Body: Static<typeof ContentRefreshSchema>;
  }>(
    "/refresh/:hashId",
    { schema: { params: ParamSchema, body: ContentRefreshSchema } },
    async (request, reply): Promise<Content> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const { hashId } = request.params;
        const { chatHashId, modelHashId, config } = request.body;

        const model = await fastify.prisma.model.findFirst({
          where: {
            hashId: modelHashId,
            isAvailable: true,
            isFree: true,
            ...(!user.hashId && { isLoginRequired: false }),
          },
          select: ChatCompletionModelSelect,
        });
        if (!model) {
          throw fastify.httpErrors.badRequest("model is not available.");
        }
        const chat = await fastify.prisma.chat.findFirst({
          where: {
            hashId: chatHashId,
            OR: [
              { userHashId: user.hashId },
              { userHashId: null, gpis: { none: {} } },
            ],
          },
          select: { systemMessage: true },
        });
        if (!chat) {
          throw fastify.httpErrors.badRequest("chat is not available.");
        }

        const id = await getIdByHashId(
          fastify.prisma.chatContent.findFirst,
          hashId
        );
        if (id < 1) {
          throw fastify.httpErrors.badRequest("content is not available.");
        }
        const messages = await fastify.prisma.chatContent.findMany({
          where: { chatHashId, id: { lt: id } },
          ...ChatCompletionContentsQuery,
        });
        if (messages.some((m) => m.content === "")) {
          throw fastify.httpErrors.badRequest(
            "There is empty content in chat."
          );
        }

        const { systemMessage } = chat;
        let { content, ...response } = await getTextResponse({
          model,
          systemMessage,
          config,
          messages,
        });

        await createEntity(fastify.prisma.history.create, {
          data: {
            userHashId: user.hashId || null,
            chatHashId,
            contentHashId: hashId,
            provider: model.provider.name,
            model: model.name,
            config,
            messages: (systemMessage
              ? [{ role: "system", content: systemMessage }]
              : []
            ).concat(messages),
            content,
            ...response,
          },
        });
        const newContent = await fastify.prisma.chatContent.update({
          where: { hashId },
          data: { content, config, modelHashId, isModified: false },
          select: {
            hashId: true,
            model: { select: { hashId: true, name: true } },
            role: true,
            content: true,
            config: true,
            isModified: true,
          },
        });

        return getTypedContent(newContent);
      } catch (ex) {
        console.error(
          "path: /content/refresh/:hashId, method: put, error:",
          ex
        );
        throw ex;
      }
    }
  );
}
