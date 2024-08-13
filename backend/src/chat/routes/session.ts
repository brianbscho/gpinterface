import { FastifyInstance } from "fastify";
import { createEntity } from "../../util/prisma";
import { Static, Type } from "@sinclair/typebox";
import { getApiKey } from "../controllers/apiKey";
import { getTextResponse } from "../../util/text";
import { MILLION } from "../../util/model";
import { Prisma } from "@prisma/client";

const SessionCreateSchema = Type.Object({
  apiHashId: Type.String(),
});
type SessionCreateResponse = { hashId: string };

const SessionCompletionSchema = Type.Object({
  sessionHashId: Type.String(),
  message: Type.String(),
});
type SessionCompletionResponse = { content: string };

const SessionMessagesGetSchema = Type.Object({
  sessionHashId: Type.String(),
});
type SessionMessagesGetResponse = {
  messages: { role: string; content: string }[];
};

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Static<typeof SessionCreateSchema> }>(
    "/",
    { schema: { body: SessionCreateSchema } },
    async (request, reply): Promise<SessionCreateResponse> => {
      try {
        const { user } = await getApiKey(fastify, request);
        const { apiHashId } = request.body;
        const api = await fastify.prisma.api.findFirst({
          where: { hashId: apiHashId, userHashId: user.hashId },
          select: { hashId: true },
        });
        if (!api) {
          throw fastify.httpErrors.badRequest("no api");
        }

        const session = await createEntity(fastify.prisma.session.create, {
          data: { apiHashId },
          select: { hashId: true },
        });
        return session;
      } catch (ex) {
        console.error("path: /session, method: post, error:", ex);
        throw ex;
      }
    }
  );
  fastify.post<{ Body: Static<typeof SessionCompletionSchema> }>(
    "/completion",
    { schema: { body: SessionCompletionSchema } },
    async (request, reply): Promise<SessionCompletionResponse> => {
      try {
        const { user } = await getApiKey(fastify, request);
        const { sessionHashId, message } = request.body;

        const session = await fastify.prisma.session.findFirst({
          where: {
            hashId: sessionHashId,
            api: {
              userHashId: user.hashId,
              model: { isAvailable: true, isFree: true },
            },
          },
          select: {
            api: {
              select: {
                hashId: true,
                config: true,
                model: {
                  select: {
                    name: true,
                    inputPricePerMillion: true,
                    outputPricePerMillion: true,
                    provider: { select: { name: true } },
                  },
                },
                chat: {
                  select: {
                    systemMessage: true,
                  },
                },
              },
            },
            messages: {
              select: { role: true, content: true },
              orderBy: { id: "asc" },
            },
          },
        });

        if (!session) {
          throw fastify.httpErrors.badRequest("session is not available.");
        }

        const { messages, api } = session;
        const { chat, config, model } = api;
        const { provider, name, inputPricePerMillion, outputPricePerMillion } =
          model;
        const { systemMessage } = chat;
        messages.push({
          role: "user",
          content: message,
        });
        let { content, response, inputTokens, outputTokens } =
          await getTextResponse({
            provider: provider.name,
            model: name,
            systemMessage,
            config: config as any,
            messages,
          });
        const price =
          (inputPricePerMillion * inputTokens) / MILLION +
          (outputPricePerMillion * outputTokens) / MILLION;

        await createEntity(fastify.prisma.history.create, {
          data: {
            userHashId: user.hashId,
            sessionHashId,
            provider: model.provider.name,
            model: model.name,
            config: config ?? Prisma.JsonNull,
            messages,
            content,
            response,
            price,
            inputTokens,
            outputTokens,
          },
        });

        return { content };
      } catch (ex) {
        console.error("path: /session/completion, method: post, error:", ex);
        throw ex;
      }
    }
  );
  fastify.post<{ Params: Static<typeof SessionMessagesGetSchema> }>(
    "/:sessionHashId",
    { schema: { params: SessionMessagesGetSchema } },
    async (request, reply): Promise<SessionMessagesGetResponse> => {
      try {
        const { user } = await getApiKey(fastify, request);
        const { sessionHashId } = request.params;

        const session = await fastify.prisma.session.findFirst({
          where: { hashId: sessionHashId, api: { userHashId: user.hashId } },
          select: {
            messages: {
              select: { role: true, content: true },
              orderBy: { id: "asc" },
            },
          },
        });

        if (!session) {
          throw fastify.httpErrors.badRequest("session is not available.");
        }

        return session;
      } catch (ex) {
        console.error(
          "path: /session/:sessionHashId, method: post, error:",
          ex
        );
        throw ex;
      }
    }
  );
}