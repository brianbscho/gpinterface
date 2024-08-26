import { Prisma } from "@prisma/client";
import { getTypedContent, getDataWithHashId } from "../util/prisma";

export async function createGpi(
  chatDelegate: Prisma.ChatDelegate,
  chat: {
    userHashId: string | null;
    systemMessage: string;
    contents: {
      role: string;
      content: string;
      config: Prisma.JsonValue;
      modelHashId: string | null;
    }[];
    gpis: {
      description: string;
      userHashId: string | null;
      config: object;
      modelHashId: string;
    };
  }
) {
  let retries = 0;

  while (retries < 5) {
    try {
      const newGpi = await chatDelegate.create({
        data: {
          ...getDataWithHashId({
            ...chat,
            contents: {
              createMany: {
                data: chat.contents.map((c) =>
                  getDataWithHashId(getTypedContent(c))
                ),
              },
            },
            gpis: { create: getDataWithHashId(chat.gpis) },
          }),
        },
        select: { gpis: { select: { hashId: true } } },
      });

      if (newGpi.gpis.length === 0) {
        throw "Failed to create gpi";
      }
      return newGpi.gpis[0];
    } catch (error) {
      retries++;
      console.log("🚀 ~ error:", error);
    }
  }

  throw "Too many collision and failed to create entity";
}
