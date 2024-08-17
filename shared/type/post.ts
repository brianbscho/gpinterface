import { Type } from "@sinclair/typebox";
import { Content, User } from ".";

export interface Post {
  hashId: string;
  title: string;
  post: string;
  createdAt: string;

  isBookmarked: boolean;
  isLiked: boolean;
  likes: number;

  chat: { hashId: string; systemMessage: string; contents: Content[] };

  user?: User | null | undefined;
}

export const PostCreateSchema = Type.Object({
  title: Type.String(),
  post: Type.String(),
  chatHashId: Type.String(),
});
export type PostCreateResponse = { hashId: string };

export type PostGetResponse = { post: Post };

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
export type PostsGetResponse = { posts: PostResponse[] };
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
