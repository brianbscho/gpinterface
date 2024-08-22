import { FastifyInstance } from "fastify";
import { getTypedContent, createEntity, getIdByHashId } from "../util/prisma";
import {
  ContentCreateSchema,
  ContentRefreshSchema,
  ContentsGetResponse,
  ContentUpdateResponse,
  ContentUpdateSchema,
} from "gpinterface-shared/type/content";
import { Static } from "@sinclair/typebox";
import { getTextResponse } from "../util/text";
import { Content, ParamSchema } from "gpinterface-shared/type";
import { MILLION } from "../util/model";
import { nanoid } from "nanoid";

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Static<typeof ContentCreateSchema> }>(
    "/",
    { schema: { body: ContentCreateSchema } },
    async (request, reply): Promise<ContentsGetResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply, true);
        const userHashId = user.hashId || null;
        const { content: userContent, apiHashId, ...body } = request.body;

        const model = await fastify.prisma.model.findFirst({
          where: {
            hashId: body.modelHashId,
            isAvailable: true,
            isFree: true,
            ...(!userHashId && { isLoginRequired: false }),
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

        const chat = await fastify.prisma.chat.findFirst({
          where: { hashId: body.chatHashId },
          select: {
            systemMessage: true,
            contents: {
              select: { role: true, content: true },
              orderBy: { id: "asc" },
            },
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
        let { content, response, inputTokens, outputTokens } =
          await getTextResponse({
            provider: model.provider.name,
            model: model.name,
            systemMessage,
            config: body.config,
            messages,
          });
        const price =
          (model.inputPricePerMillion * inputTokens) / MILLION +
          (model.outputPricePerMillion * outputTokens) / MILLION;

        await createEntity(fastify.prisma.history.create, {
          data: {
            userHashId,
            chatHashId: body.chatHashId,
            apiHashId,
            provider: model.provider.name,
            model: model.name,
            config: body.config,
            messages: (systemMessage
              ? [{ role: "system", content: systemMessage }]
              : []
            ).concat(messages),
            content,
            response,
            price,
            inputTokens,
            outputTokens,
          },
        });

        const newContents = [
          {
            hashId: nanoid(),
            model: { hashId: body.modelHashId, name: model.name },
            role: "user",
            content: userContent,
            config: body.config,
          },
          {
            hashId: nanoid(),
            model: { hashId: body.modelHashId, name: model.name },
            role: "assistant",
            content,
            config: body.config,
          },
        ];

        if (!chat.userHashId || chat.userHashId === userHashId) {
          const _userContent = await createEntity(
            fastify.prisma.chatContent.create,
            {
              data: { ...body, role: "user", content: userContent },
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
          where: { hashId },
          select: { hashId: true, chat: { select: { userHashId: true } } },
        });
        if (
          !oldContent ||
          (oldContent.chat.userHashId &&
            oldContent.chat.userHashId !== user.hashId)
        ) {
          throw fastify.httpErrors.badRequest("content is not available.");
        }

        await fastify.prisma.chatContent.update({
          where: { hashId: oldContent.hashId },
          data: { content },
        });

        return { hashId, content };
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
        const userHashId = user.hashId || null;
        const { hashId } = request.params;
        const { chatHashId, modelHashId, config } = request.body;

        const model = await fastify.prisma.model.findFirst({
          where: {
            hashId: modelHashId,
            isAvailable: true,
            isFree: true,
            ...(!userHashId && { isLoginRequired: false }),
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
        const chat = await fastify.prisma.chat.findFirst({
          where: { hashId: chatHashId },
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
          select: { role: true, content: true },
          orderBy: { id: "asc" },
        });
        if (messages.some((m) => m.content === "")) {
          throw fastify.httpErrors.badRequest(
            "There is empty content in chat."
          );
        }

        const { systemMessage } = chat;
        let { content, response, inputTokens, outputTokens } =
          await getTextResponse({
            provider: model.provider.name,
            model: model.name,
            systemMessage,
            config,
            messages,
          });
        const price =
          (model.inputPricePerMillion * inputTokens) / MILLION +
          (model.outputPricePerMillion * outputTokens) / MILLION;

        await createEntity(fastify.prisma.history.create, {
          data: {
            userHashId,
            chatHashId,
            provider: model.provider.name,
            model: model.name,
            config,
            messages: (systemMessage
              ? [{ role: "system", content: systemMessage }]
              : []
            ).concat(messages),
            content,
            response,
            price,
            inputTokens,
            outputTokens,
          },
        });
        const newContent = await fastify.prisma.chatContent.update({
          where: { hashId },
          data: { content, config, modelHashId },
          select: {
            hashId: true,
            model: { select: { hashId: true, name: true } },
            role: true,
            content: true,
            config: true,
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
