import { FastifyInstance } from "fastify";
import {
  ChatCompletionContentsQuery,
  ChatCompletionModelSelect,
  createEntity,
  createManyEntities,
  getDataWithHashId,
} from "../../util/prisma";
import { getTextResponse } from "../../util/text";
import { Prisma } from "@prisma/client";

async function createSessionEntry(
  sessionDelegate: Prisma.SessionDelegate,
  session: { gpiHashId: string; messages: { role: string; content: string }[] }
) {
  let retries = 0;

  while (retries < 5) {
    try {
      const newSession = await sessionDelegate.create({
        data: {
          ...getDataWithHashId(
            {
              ...session,
              messages: {
                createMany: {
                  data: session.messages.map((m) => getDataWithHashId(m)),
                },
              },
            },
            32
          ),
        },
        select: { hashId: true },
      });

      return newSession;
    } catch (error) {
      retries++;
      console.log("🚀 ~ error:", error);
    }
  }

  throw "Too many collision and failed to create entity";
}

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
    where: { hashId: gpiHashId, OR: [{ userHashId }, { isPublic: true }] },
    select: { hashId: true, contents: ChatCompletionContentsQuery },
  });
  if (!gpi) {
    throw fastify.httpErrors.badRequest("no gpi");
  }
  if (gpi.contents.some((c) => c.content === "")) {
    throw fastify.httpErrors.badRequest("There is empty content in chat.");
  }

  const session = await createSessionEntry(fastify.prisma.session, {
    gpiHashId,
    messages: gpi.contents,
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
          systemMessage: true,
          config: true,
          model: { select: ChatCompletionModelSelect },
        },
      },
      messages: ChatCompletionContentsQuery,
    },
  });

  if (!session || !session.gpi) {
    throw fastify.httpErrors.badRequest("session is not available.");
  }

  const { messages, gpi } = session;
  const { systemMessage, config, model } = gpi;
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
