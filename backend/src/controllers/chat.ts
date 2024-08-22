import { Prisma } from "@prisma/client";
import { getDataWithHashId } from "../util/prisma";
import { getTypedContent } from "../util/content";

export async function createChat(
  chatDelegate: Prisma.ChatDelegate,
  chat: {
    userHashId: string;
    systemMessage: string;
    contents: {
      role: string;
      content: string;
      config: Prisma.JsonValue;
      modelHashId: string | null;
    }[];
  }
) {
  let retries = 0;

  while (retries < 5) {
    try {
      const newChat = await chatDelegate.create({
        data: getDataWithHashId({
          ...chat,
          contents: {
            createMany: {
              data: chat.contents.map((c) =>
                getDataWithHashId(getTypedContent(c))
              ),
            },
          },
        }),
        select: { hashId: true },
      });
      return newChat;
    } catch (error) {
      retries++;
      console.log("🚀 ~ error:", error);
    }
  }

  throw "Too many collision and failed to create entity";
}
