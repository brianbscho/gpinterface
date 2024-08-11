import { FastifyInstance } from "fastify";
import { createEntity } from "../../util/prisma";
import { Static, Type } from "@sinclair/typebox";
import { getTextResponse } from "../../util/text";
import { Prisma } from "@prisma/client";
import { getApiKey } from "../controllers/apiKey";
import { MILLION } from "../../util/model";

const ChatCompletionSchema = Type.Object({
  apiHashId: Type.String(),
  message: Type.String(),
});

type ChatCompletionResponse = { content: string };

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Static<typeof ChatCompletionSchema> }>(
    "/completion",
    { schema: { body: ChatCompletionSchema } },
    async (request, reply): Promise<ChatCompletionResponse> => {
      try {
        const { user } = await getApiKey(fastify, request);
        const { apiHashId, message } = request.body;

        const api = await fastify.prisma.api.findFirst({
          where: {
            hashId: apiHashId,
            model: { isAvailable: true, isFree: true },
          },
          select: {
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
                contents: {
                  select: { role: true, content: true },
                  orderBy: { id: "asc" },
                },
              },
            },
          },
        });

        if (!api) {
          throw fastify.httpErrors.badRequest("api is not available.");
        }

        const { chat, config, model } = api;
        const { provider, name, inputPricePerMillion, outputPricePerMillion } =
          model;
        const { systemMessage, contents } = chat;
        const messages = contents.concat({
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
            apiHashId,
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
        console.error("path: /chat/completion, method: post, error:", ex);
        throw ex;
      }
    }
  );
}
