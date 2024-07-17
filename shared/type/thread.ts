import { Type } from "@sinclair/typebox";
import { Thread } from ".";
import { PostSchema } from "./post";

export const ThreadGetSchema = Type.Object({ hashId: Type.String() });
export type ThreadGetResponse = { thread: Thread };

export const ThreadsUserGetSchema = Type.Object({ userHashId: Type.String() });
export const ThreadsUserQueryParamSchema = Type.Object({
  lastHashId: Type.Optional(Type.String()),
  type: Type.Union([
    Type.Literal("thread"),
    Type.Literal("post"),
    Type.Literal("bookmark"),
  ]),
});
export type ThreadsGetResponse = { threads: Thread[] };

export const ThreadCreateSchema = Type.Object({
  title: Type.String(),
  isPublic: Type.Boolean(),
  posts: Type.Array(Type.Object(PostSchema)),
});
export type ThreadCreateResponse = { hashId: string };

export const ThreadUpdateSchema = Type.Object({
  hashId: Type.String(),
  title: Type.String(),
});

export const SearchQueryParamSchema = Type.Object({
  lastHashId: Type.String(),
  keyword: Type.String(),
});
