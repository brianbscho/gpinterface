import { Prisma } from "@prisma/client";
import { Static, Type } from "@sinclair/typebox";
import { PostSchema } from "gpinterface-shared/type/post";
import { getDataWithHashId } from "../util/prisma";
import { ImageExample } from "gpinterface-shared/type";

const PostSchemaObject = Type.Object(PostSchema);
export function getPostCreateData<T>(
  post: Static<typeof PostSchemaObject> & {
    userHashId: string;
    threadHashId: T;
  }
) {
  return getDataWithHashId(
    {
      ...post,
      textPrompts: {
        create: post.textPrompts.map((p) =>
          getDataWithHashId({
            ...p,
            examples: { create: p.examples.map((e) => getDataWithHashId(e)) },
            messages: { create: p.messages.map((m) => getDataWithHashId(m)) },
          })
        ),
      },
      imagePrompts: {
        create: post.imagePrompts.map((p) =>
          getDataWithHashId({
            ...p,
            examples: {
              create: p.examples.map(
                (e) => getDataWithHashId(e) as ImageExample
              ),
            },
          })
        ),
      },
    },
    12
  );
}

export async function createPost(
  postDelegate: Prisma.PostDelegate,
  post: Static<typeof PostSchemaObject> & {
    threadHashId: string;
    userHashId: string;
  }
) {
  let retries = 0;

  while (retries < 5) {
    try {
      const newPost = await postDelegate.create({
        data: getPostCreateData(post),
        select: { hashId: true },
      });
      return newPost;
    } catch (error) {
      retries++;
      console.log("🚀 ~ error:", error);
    }
  }

  throw "Too many collision and failed to create entity";
}
