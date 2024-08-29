import { FastifyInstance } from "fastify";
import {
  ChatCompletionContentsQuery,
  ChatCompletionModelSelect,
  createEntity,
  createManyEntities,
} from "../../util/prisma";
import { getTextResponse } from "../../util/text";
import { Prisma } from "@prisma/client";
import { createSession as _createSession } from "../../controllers/session";

export async function createSession({
  fastify,
  userHashId,
  gpiHashId,
}: {
  fastify: FastifyInstance;
  userHashId: string | null;
  gpiHashId: string;
}) {
  const gpi = await fastify.prisma.gpi.findFirst({
    where: {
      hashId: gpiHashId,
      OR: [{ userHashId }, { isPublic: true }],
    },
    select: {
      hashId: true,
      chat: { select: { contents: ChatCompletionContentsQuery } },
    },
  });
  if (!gpi) {
    throw fastify.httpErrors.badRequest("no gpi");
  }

  const session = await _createSession(fastify.prisma.session, {
    gpiHashId,
    messages: gpi.chat.contents,
  });

  return session;
}

export async function createSessionCompletion({
  fastify,
  userHashId,
  body,
}: {
  fastify: FastifyInstance;
  userHashId: string | null;
  body: { sessionHashId: string; content: string };
}) {
  const { sessionHashId, content: userContent } = body;

  const session = await fastify.prisma.session.findFirst({
    where: {
      hashId: sessionHashId,
      gpi: {
        OR: [{ userHashId }, { isPublic: true }],
        model: { isAvailable: true, isFree: true },
      },
    },
    select: {
      gpi: {
        select: {
          hashId: true,
          config: true,
          model: { select: ChatCompletionModelSelect },
          chat: { select: { systemMessage: true } },
        },
      },
      messages: ChatCompletionContentsQuery,
    },
  });

  if (!session) {
    throw fastify.httpErrors.badRequest("session is not available.");
  }

  const { messages, gpi } = session;
  const { chat, config, model } = gpi;
  const { systemMessage } = chat;
  messages.push({ role: "user", content: userContent });
  const { content, ...response } = await getTextResponse({
    model,
    systemMessage,
    config: config as any,
    messages,
  });

  await createManyEntities(fastify.prisma.sessionMessage.createMany, {
    data: [
      { sessionHashId, role: "user", content: userContent },
      { sessionHashId, role: "assistant", content },
    ],
  });
  await createEntity(fastify.prisma.history.create, {
    data: {
      userHashId,
      gpiHashId: session.gpi.hashId,
      sessionHashId,
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

  return content;
}

export async function getSessionMessages({
  fastify,
  userHashId,
  sessionHashId,
}: {
  fastify: FastifyInstance;
  userHashId: string | null;
  sessionHashId: string;
}) {
  const session = await fastify.prisma.session.findFirst({
    where: {
      hashId: sessionHashId,
      gpi: { OR: [{ userHashId }, { isPublic: true }] },
    },
    select: { messages: ChatCompletionContentsQuery },
  });

  if (!session) {
    throw fastify.httpErrors.badRequest("session is not available.");
  }

  return session;
}