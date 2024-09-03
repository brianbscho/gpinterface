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

        const { systemMessage, contents } = chat;
        const messages = [...contents];
        messages.push({ role: "user", content: userContent });
        let { content, ...response } = await getTextResponse({
          model,
          systemMessage,
          config: body.config,
          messages,
        });

        const userChatContent = await createEntity(
          fastify.prisma.chatContent.create,
          {
            data: {
              chatHashId: body.chatHashId,
              role: "user",
              content: userContent,
            },
            select: {
              hashId: true,
              role: true,
              content: true,
              isModified: true,
            },
          }
        );
        const assistantChatContent = await createEntity(
          fastify.prisma.chatContent.create,
          {
            data: { ...body, role: "assistant", content },
            select: {
              hashId: true,
              model: true,
              role: true,
              content: true,
              config: true,
              isModified: true,
            },
          }
        );

        const history = await createEntity(fastify.prisma.history.create, {
          data: {
            userHashId: user.hashId || null,
            chatHashId: body.chatHashId,
            gpiHashId,
            chatContentHashId: assistantChatContent.hashId,
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

        return {
          contents: [
            userChatContent,
            {
              ...getTypedContent(assistantChatContent),
              history: getTypedHistory(history),
            },
          ],
        };
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

        const { systemMessage } = chat;
        let { content, ...response } = await getTextResponse({
          model,
          systemMessage,
          config,
          messages,
        });

        const history = await createEntity(fastify.prisma.history.create, {
          data: {
            userHashId: user.hashId || null,
            chatHashId,
            chatContentHashId: hashId,
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
        await fastify.prisma.chatContent.update({
          where: { hashId },
          data: { histories: { set: [] } },
        });
        const newContent = await fastify.prisma.chatContent.update({
          where: { hashId },
          data: {
            content,
            config,
            modelHashId,
            isModified: false,
            histories: { connect: { hashId: history.hashId } },
          },
          select: {
            hashId: true,
            model: { select: { hashId: true, name: true } },
            role: true,
            content: true,
            config: true,
            isModified: true,
          },
        });

        return getTypedContent({
          history: getTypedHistory(history),
          ...newContent,
        });
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
