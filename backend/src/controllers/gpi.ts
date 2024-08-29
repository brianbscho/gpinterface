import { Prisma, PrismaClient } from "@prisma/client";
import { getDataWithHashId, getTypedContent } from "../util/prisma";

export async function createGpi(
  gpiDelegate: Prisma.GpiDelegate,
  gpis: {
    config: Prisma.JsonValue;
    description: string;
    isPublic: boolean;
    chatHashId: string;
    modelHashId: string;
    userHashId: string;
  }
) {
  let retries = 0;

  while (retries < 5) {
    try {
      const newGpi = await gpiDelegate.create({
        data: getDataWithHashId(
          { ...gpis, config: gpis.config ?? Prisma.JsonNull },
          32
        ),
        select: { hashId: true },
      });

      return newGpi;
    } catch (error) {
      retries++;
      console.log("🚀 ~ error:", error);
    }
  }

  throw "Too many collision and failed to create entity";
}

export async function copyGpi(
  prisma: PrismaClient,
  hashId: string,
  userHashId: string
) {
  const gpi = await prisma.gpi.findFirst({
    where: { hashId, OR: [{ userHashId }, { isPublic: true }] },
    select: {
      config: true,
      description: true,
      modelHashId: true,
      isPublic: true,
      chat: {
        select: {
          systemMessage: true,
          contents: {
            select: {
              role: true,
              content: true,
              config: true,
              modelHashId: true,
            },
          },
        },
      },
    },
  });

  if (!gpi) {
    throw "no gpi";
  }

  const { chat, ...rest } = gpi;
  const newChat = await prisma.chat.create({
    data: getDataWithHashId(
      {
        ...chat,
        userHashId,
        contents: {
          createMany: {
            data: chat.contents.map((c) =>
              getDataWithHashId(getTypedContent(c))
            ),
          },
        },
      },
      32
    ),
    select: { hashId: true },
  });
  const newGpi = await createGpi(prisma.gpi, {
    ...rest,
    config: rest.config,
    userHashId,
    chatHashId: newChat.hashId,
  });

  return newGpi;
}
