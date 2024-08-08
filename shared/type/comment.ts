import { Type } from "@sinclair/typebox";
import { Comment } from ".";

export const CommentsGetSchema = Type.Object({
  postHashId: Type.String(),
});
export type CommentsGetResponse = { comments: Comment[] };

export const CommentCreateSchema = Type.Object({
  postHashId: Type.String(),
  comment: Type.String(),
});
export type CommentCreateResponse = { comment: Comment };
