import { FastifyInstance } from "fastify";
import {
  ChatCompletionContentsQuery,
  ChatCompletionModelSelect,
  createEntity,
} from "../util/prisma";
import { getTextResponse } from "../util/text";
import { Prisma } from "@prisma/client";

export const createChatCompletion = async ({
  fastify,
  gpiHashId,
  content,
  userHashId,
}: {
  fastify: FastifyInstance;
  gpiHashId: string;
  content: string;
  userHashId: string | null;
}) => {
  const gpi = await fastify.prisma.gpi.findFirst({
    where: {
      hashId: gpiHashId,
      OR: [{ userHashId }, { isPublic: true }],
      model: { isAvailable: true, isFree: true },
    },
    select: {
      config: true,
      model: { select: ChatCompletionModelSelect },
      systemMessage: true,
      chatContents: ChatCompletionContentsQuery,
    },
  });

  if (!gpi) {
    throw fastify.httpErrors.badRequest("gpi is not available.");
  }
  if (gpi.chatContents.some((c) => c.content === "")) {
    throw fastify.httpErrors.badRequest("There is empty content in chat.");
  }

  const { systemMessage, chatContents, config, model } = gpi;
  const messages = chatContents.concat({ role: "user", content });
  const response = await getTextResponse({
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
      ...response,
    },
  });

  return { content: response.content };
};
