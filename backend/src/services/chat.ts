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
  if (content.trim() === "") {
    throw fastify.httpErrors.badRequest("Empty content");
  }

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
  if (gpi.model.isLoginRequired || !gpi.model.isFree) {
    if (!userHashId) {
      throw fastify.httpErrors.unauthorized("Please login first.");
    }
    const user = await fastify.prisma.user.findFirst({
      where: { hashId: userHashId },
      select: { balance: true },
    });
    if (!user || user.balance <= 0)
      throw fastify.httpErrors.unauthorized(
        "You don't have enough balance. Please deposit first."
      );
  }

  const { systemMessage, chatContents, config, model } = gpi;
  const messages = chatContents.concat({ role: "user", content });
  const response = await getTextResponse({
    model,
    systemMessage,
    config: config as any,
    messages,
  });

  const paid = gpi.model.isFree ? 0 : response.price;
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
  if (userHashId) {
    await fastify.prisma.user.update({
      where: { hashId: userHashId },
      data: { balance: { decrement: paid } },
    });
  }

  return { content: response.content };
};
