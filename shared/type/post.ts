import { Type } from "@sinclair/typebox";
import { Post, User } from ".";
import { TextMessageSchema } from "./textMessage";
import { TextExampleSchema } from "./textExample";
import { ImageExampleSchema } from "./imageExample";
import { ImagePrompt } from "./imagePrompt";
import { TextPrompt } from "./textPrompt";

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
  title: Type.String(),
  post: Type.String(),
  chatHashId: Type.String(),
});
export type PostCreateResponse = { hashId: string };

export type PostGetResponse = {
  post: Post;
};

type PostResponse = {
  hashId: string;
  title: string;
  post: string;

  likes: number;
  comments: number;

  systemMessage: string;
  messages: { hashId: string; role: string; content: string }[];
  createdAt: string;

  user?: User | null;
};
export type PostsGetResponse = {
  posts: PostResponse[];
};
export type PostsCommentGetResponse = {
  posts: (PostResponse & { comment: string })[];
};

export const PostUpdateSchema = Type.Object({
  title: Type.String(),
  post: Type.String(),
});

export const SearchQueryParamSchema = Type.Object({
  lastHashId: Type.String(),
  keyword: Type.String(),
});
export const PostsUserParamSchema = Type.Object({
  userHashId: Type.String(),
});
