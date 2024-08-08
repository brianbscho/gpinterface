import { FastifyInstance } from "fastify";
import { createEntity, getIdByHashId } from "../util/prisma";
import {
  ContentCreateResponse,
  ContentCreateSchema,
  ContentRefreshResponse,
  ContentRefreshSchema,
  ContentUpdateResponse,
  ContentUpdateSchema,
} from "gpinterface-shared/type/content";
import { Static } from "@sinclair/typebox";
import { getTextResponse } from "../util/text";
import { getTypedContent } from "../util/content";
import { ParamSchema } from "gpinterface-shared/type";

const MILLION = 1000000;

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Static<typeof ContentCreateSchema> }>(
    "/",
    { schema: { body: ContentCreateSchema } },
    async (request, reply): Promise<ContentCreateResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { body } = request;

        const model = await fastify.prisma.model.findFirst({
          where: { hashId: body.modelHashId },
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
          select: { systemMessage: true },
        });
        if (!chat) {
          throw fastify.httpErrors.badRequest("chat is not available.");
        }

        const { systemMessage } = chat;
        const messages = body.messages.concat({
          role: "user",
          content: body.content,
        });
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
            userHashId: user.hashId,
            chatHashId: body.chatHashId,
            provider: model.provider.name,
            model: model.name,
            config: body.config,
            messages,
            content,
            response,
            price,
            inputTokens,
            outputTokens,
          },
        });
        await createEntity(fastify.prisma.content.create, {
          data: {
            modelHashId: body.modelHashId,
            chatHashId: body.chatHashId,
            role: "user",
            content: body.content,
          },
          select: {},
        });
        const newContent = await createEntity(fastify.prisma.content.create, {
          data: {
            modelHashId: body.modelHashId,
            chatHashId: body.chatHashId,
            role: "assistant",
            content,
            config: body.config,
          },
          select: { hashId: true, role: true, content: true, config: true },
        });

        return getTypedContent(newContent);
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
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;
        const { content } = request.body;

        const oldContent = await fastify.prisma.content.findFirst({
          where: { hashId, chat: { userHashId: user.hashId } },
          select: { hashId: true },
        });
        if (!oldContent) {
          throw fastify.httpErrors.badRequest("content is not available.");
        }

        await fastify.prisma.content.update({
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
    async (request, reply): Promise<ContentRefreshResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;
        const { chatHashId, modelHashId, config } = request.body;

        const model = await fastify.prisma.model.findFirst({
          where: { hashId: modelHashId },
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
          fastify.prisma.content.findFirst,
          hashId
        );
        if (id < 1) {
          throw fastify.httpErrors.badRequest("content is not available.");
        }
        const messages = await fastify.prisma.content.findMany({
          where: { chatHashId, id: { lt: id } },
          select: { role: true, content: true },
          orderBy: { id: "asc" },
        });

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
            userHashId: user.hashId,
            chatHashId,
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
        await fastify.prisma.content.update({
          where: { hashId },
          data: { content, config, modelHashId },
        });

        return { hashId, content };
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
