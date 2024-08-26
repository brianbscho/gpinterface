import { FastifyInstance } from "fastify";
import {
  ChatCompletionContentsQuery,
  ChatCompletionModelSelect,
  createEntity,
} from "../../util/prisma";
import { Static, Type } from "@sinclair/typebox";
import { getTextResponse } from "../../util/text";
import { Prisma } from "@prisma/client";
import { getApiKey } from "../controllers/apiKey";

const ChatCompletionSchema = Type.Object({
  gpiHashId: Type.String(),
  message: Type.String(),
});

type ChatCompletionResponse = { content: string };

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Static<typeof ChatCompletionSchema> }>(
    "/completion",
    { schema: { body: ChatCompletionSchema } },
    async (request, reply): Promise<ChatCompletionResponse> => {
      try {
        const userHashId = await getApiKey(fastify, request, true);
        const { gpiHashId, message } = request.body;

        const gpi = await fastify.prisma.gpi.findFirst({
          where: {
            hashId: gpiHashId,
            OR: [{ userHashId }, { isPublic: true }],
            model: {
              isAvailable: true,
              isFree: true,
              ...(!userHashId && { isLoginRequired: false }),
            },
          },
          select: {
            config: true,
            model: { select: ChatCompletionModelSelect },
            chat: {
              select: {
                systemMessage: true,
                contents: ChatCompletionContentsQuery,
              },
            },
          },
        });

        if (!gpi) {
          throw fastify.httpErrors.badRequest("gpi is not available.");
        }
        if (gpi.chat.contents.some((c) => c.content === "")) {
          throw fastify.httpErrors.badRequest(
            "There is empty content in chat."
          );
        }

        const { chat, config, model } = gpi;
        const { systemMessage, contents } = chat;
        const messages = contents.concat({
          role: "user",
          content: message,
        });
        const { content, ...response } = await getTextResponse({
          model,
          systemMessage,
          config: config as any,
          messages,
        });

        await createEntity(fastify.prisma.history.create, {
          data: {
            userHashId,
            gpiHashId,
            provider: model.provider.name,
            model: model.name,
            config: config ?? Prisma.JsonNull,
            messages: (systemMessage
              ? [{ role: "system", content: systemMessage }]
              : []
            ).concat(messages),
            content,
            ...response,
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
