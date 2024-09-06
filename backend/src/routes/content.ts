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
  ChatContent,
  ChatContentCreateSchema,
  ChatContentRefreshSchema,
  ChatContentsCreateResponse,
  ChatContentUpdateResponse,
  ChatContentUpdateSchema,
} from "gpinterface-shared/type/chatContent";
import { Static } from "@sinclair/typebox";
import { getTextResponse } from "../util/text";
import { ParamSchema } from "gpinterface-shared/type";

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Static<typeof ChatContentCreateSchema> }>(
    "/",
    { schema: { body: ChatContentCreateSchema } },
    async (request, reply): Promise<ChatContentsCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { content: userContent, ...body } = request.body;

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

        const gpi = await fastify.prisma.gpi.findFirst({
          where: { hashId: body.gpiHashId, userHashId: user.hashId },
          select: {
            systemMessage: true,
            chatContents: ChatCompletionContentsQuery,
            userHashId: true,
          },
        });
        if (!gpi) {
          throw fastify.httpErrors.badRequest("gpi is not available.");
        }

        const { systemMessage, chatContents } = gpi;
        const messages = [...chatContents];
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
              gpiHashId: body.gpiHashId,
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
            gpiHashId: body.gpiHashId,
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

        return [
          userChatContent,
          {
            ...getTypedContent(assistantChatContent),
            history: getTypedHistory(history),
          },
        ];
      } catch (ex) {
        console.error("path: /content, method: post, error:", ex);
        throw ex;
      }
    }
  );
  fastify.put<{
    Params: Static<typeof ParamSchema>;
    Body: Static<typeof ChatContentUpdateSchema>;
  }>(
    "/:hashId",
    { schema: { params: ParamSchema, body: ChatContentUpdateSchema } },
    async (request, reply): Promise<ChatContentUpdateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;
        const { content } = request.body;

        const oldContent = await fastify.prisma.chatContent.findFirst({
          where: { hashId, gpi: { userHashId: user.hashId } },
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
    Body: Static<typeof ChatContentRefreshSchema>;
  }>(
    "/refresh/:hashId",
    { schema: { params: ParamSchema, body: ChatContentRefreshSchema } },
    async (request, reply): Promise<ChatContent> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;
        const { gpiHashId, modelHashId, config } = request.body;

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
        const gpi = await fastify.prisma.gpi.findFirst({
          where: { hashId: gpiHashId, userHashId: user.hashId },
          select: { systemMessage: true },
        });
        if (!gpi) {
          throw fastify.httpErrors.badRequest("gpi is not available.");
        }

        const id = await getIdByHashId(
          fastify.prisma.chatContent.findFirst,
          hashId
        );
        if (id < 1) {
          throw fastify.httpErrors.badRequest("content is not available.");
        }
        const messages = await fastify.prisma.chatContent.findMany({
          where: { gpiHashId, id: { lt: id } },
          ...ChatCompletionContentsQuery,
        });

        const { systemMessage } = gpi;
        let { content, ...response } = await getTextResponse({
          model,
          systemMessage,
          config,
          messages,
        });

        const history = await createEntity(fastify.prisma.history.create, {
          data: {
            userHashId: user.hashId || null,
            gpiHashId,
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
