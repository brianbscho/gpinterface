import { Prisma } from "@prisma/client";
import { getDataWithHashId } from "../util/prisma";
import { getTypedContent } from "../util/content";

export async function createApi(
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
    apis: {
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
      const newApi = await chatDelegate.create({
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
            apis: { create: getDataWithHashId(chat.apis) },
          }),
        },
        select: { apis: { select: { hashId: true } } },
      });

      if (newApi.apis.length === 0) {
        throw "Failed to create api";
      }
      return newApi.apis[0];
    } catch (error) {
      retries++;
      console.log("🚀 ~ error:", error);
    }
  }

  throw "Too many collision and failed to create entity";
}
