import { Type } from "@sinclair/typebox";
import { Post } from ".";
import { TextMessageSchema } from "./textMessage";
import { TextExampleSchema } from "./textExample";
import { ImageExampleSchema } from "./imageExample";
import { ImagePrompt } from "./imagePrompt";
import { TextPrompt } from "./textPrompt";

export const PostCopySchema = Type.Object({ hashId: Type.String() });

export const PostSchema = {
  post: Type.String(),
  textPrompts: Type.Array(
    Type.Object({
      ...TextPrompt,
      examples: Type.Array(TextExampleSchema),
      messages: Type.Array(TextMessageSchema),
    })
  ),
  imagePrompts: Type.Array(
    Type.Object({
      ...ImagePrompt,
      examples: Type.Array(ImageExampleSchema),
    })
  ),
};
export const PostCreateSchema = Type.Object({
  threadHashId: Type.String(),
  ...PostSchema,
});
export type PostCreateResponse = { hashId: string };

export const PostGetSchema = Type.Object({ hashId: Type.String() });
export type PostGetResponse = {
  thread: { hashId: string; title: string };
  post: Post;
};

export const PostsGetSchema = Type.Object({ threadHashId: Type.String() });
export type PostsGetResponse = { posts: Post[] };

export const PostUpdateSchema = Type.Object({
  hashId: Type.String(),
  post: Type.String(),
});
