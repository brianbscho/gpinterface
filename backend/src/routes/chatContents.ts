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
} from "gpinterface-shared/type/chatContent";
import { getTextResponse } from "../util/text";
import { HashIdParam } from "gpinterface-shared/type";
import { ChatCompletionSchema } from "gpinterface-shared/type/chat";

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

        return { hashIds };
      } catch (ex) {
        console.error("path: /chat/contents, method: delete, error:", ex);
        throw ex;
      }
    }
  );
  fastify.patch<{
    Params: Static<typeof HashIdParam>;
    Body: Static<typeof ChatCompletionSchema>;
  }>(
    "/:hashId",
    { schema: { params: HashIdParam, body: ChatCompletionSchema } },
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
  fastify.patch<{
    Params: Static<typeof HashIdParam>;
    Body: Static<typeof ChatContentRefreshSchema>;
  }>(
    "/:hashId/refresh",
    { schema: { params: HashIdParam, body: ChatContentRefreshSchema } },
    async (request, reply): Promise<ChatContent> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;
        const { modelHashId, config } = request.body;

        const model = await fastify.prisma.model.findFirst({
          where: { hashId: modelHashId, isAvailable: true, isFree: true },
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
          where: { gpiHashId: gpi.hashId, isDeployed: false, id: { lt: id } },
          ...MessageCompletionContentsQuery,
        });
        if (messages.some((m) => m.content === "")) {
          throw fastify.httpErrors.badRequest(
            "There is empty content in chat."
          );
        }

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
