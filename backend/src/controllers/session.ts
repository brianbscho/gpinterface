import { Prisma } from "@prisma/client";
import { getDataWithHashId } from "../util/prisma";

export async function createSession(
  sessionDelegate: Prisma.SessionDelegate,
  session: {
    gpiHashId: string;
    messages: {
      role: string;
      content: string;
    }[];
  }
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
