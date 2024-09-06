import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import { ChatContentsDeleteSchema } from "gpinterface-shared/type/chatContent";
import { DeleteResponse } from "gpinterface-shared/type";
import {
  getTypedContent,
  createEntity,
  getIdByHashId,
  getTypedHistory,
  ChatCompletionModelSelect,
  MessageCompletionContentsQuery,
} from "../util/prisma";
import {
  ChatContent,
  ChatContentRefreshSchema,
  ChatContentUpdateResponse,
  ChatContentUpdateSchema,
} from "gpinterface-shared/type/chatContent";
import { getTextResponse } from "../util/text";
import { ParamSchema } from "gpinterface-shared/type";

export default async function (fastify: FastifyInstance) {
  fastify.delete<{ Body: Static<typeof ChatContentsDeleteSchema> }>(
    "/",
    { schema: { body: ChatContentsDeleteSchema } },
    async (request, reply): Promise<DeleteResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashIds } = request.body;

        const oldContents = await fastify.prisma.chatContent.findMany({
          where: { hashId: { in: hashIds }, gpi: { userHashId: user.hashId } },
          select: { hashId: true },
        });
        if (oldContents.length !== hashIds.length) {
          throw fastify.httpErrors.badRequest("Deletion is not possible.");
        }

        await fastify.prisma.chatContent.deleteMany({
          where: { hashId: { in: hashIds } },
        });

        return { success: true };
      } catch (ex) {
        console.error("path: /chat/contents, method: delete, error:", ex);
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
        console.error("path: /chat/contents/:hashId, method: put, error:", ex);
        throw ex;
      }
    }
  );
  fastify.put<{
    Params: Static<typeof ParamSchema>;
    Body: Static<typeof ChatContentRefreshSchema>;
  }>(
    "/:hashId/refresh",
    { schema: { params: ParamSchema, body: ChatContentRefreshSchema } },
    async (request, reply): Promise<ChatContent> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;
        const { modelHashId, config } = request.body;

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
        const chatContent = await fastify.prisma.chatContent.findFirst({
          where: { hashId },
          select: {
            gpi: {
              select: { hashId: true, userHashId: true, systemMessage: true },
            },
          },
        });
        if (!chatContent || chatContent.gpi.userHashId !== user.hashId) {
          throw fastify.httpErrors.badRequest("gpi is not available.");
        }
        const { gpi } = chatContent;

        const id = await getIdByHashId(
          fastify.prisma.chatContent.findFirst,
          hashId
        );
        if (id < 1) {
          throw fastify.httpErrors.badRequest("content is not available.");
        }
        const messages = await fastify.prisma.chatContent.findMany({
          where: { gpiHashId: gpi.hashId, id: { lt: id } },
          ...MessageCompletionContentsQuery,
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
            userHashId: user.hashId,
            gpiHashId: gpi.hashId,
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
          "path: /chat/contents/:hashId/refresh, method: put, error:",
          ex
        );
        throw ex;
      }
    }
  );
}
