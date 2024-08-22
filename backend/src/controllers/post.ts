import { Prisma } from "@prisma/client";
import { getTypedContent, getDataWithHashId } from "../util/prisma";

export async function createPost(
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
    posts: { title: string; post: string; userHashId: string };
  }
) {
  let retries = 0;

  while (retries < 5) {
    try {
      const newPost = await chatDelegate.create({
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
            posts: { create: getDataWithHashId(chat.posts) },
          }),
        },
        select: { posts: { select: { hashId: true } } },
      });

      if (newPost.posts.length === 0) {
        throw "Failed to create post";
      }
      return newPost.posts[0];
    } catch (error) {
      retries++;
      console.log("🚀 ~ error:", error);
    }
  }

  throw "Too many collision and failed to create entity";
}
