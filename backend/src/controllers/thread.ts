import { Prisma } from "@prisma/client";
import { Static, Type } from "@sinclair/typebox";
import { PostSchema } from "gpinterface-shared/type/post";
import { getDataWithHashId } from "../util/prisma";
import { getPostCreateData } from "./post";

const PostSchemaObject = Type.Object(PostSchema);
export async function createThread(
  threadDelegate: Prisma.ThreadDelegate,
  thread: {
    userHashId: string;
    title: string;
    isPublic: boolean;
    posts: Static<typeof PostSchemaObject>[];
  }
) {
  let retries = 0;

  while (retries < 5) {
    try {
      const newThread = await threadDelegate.create({
        data: getDataWithHashId(
          {
            ...thread,
            posts: {
              create: thread.posts.map((p) =>
                getPostCreateData({
                  ...p,
                  userHashId: thread.userHashId,
                  threadHashId: undefined,
                })
              ),
            },
          },
          12
        ),
        select: {
          hashId: true,
        },
      });
      return newThread;
    } catch (error) {
      retries++;
      console.log("🚀 ~ error:", error);
    }
  }

  throw "Too many collision and failed to create entity";
}
