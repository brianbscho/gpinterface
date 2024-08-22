import { Type } from "@sinclair/typebox";
import { User } from "./user";

interface Comment {
  hashId: string;
  comment: string;
  user?: User | null;
  createdAt: string;
}

export const CommentsGetSchema = Type.Object({
  postHashId: Type.String(),
});
export type CommentsGetResponse = { comments: Comment[] };

export const CommentCreateSchema = Type.Object({
  postHashId: Type.String(),
  comment: Type.String(),
});
export type CommentCreateResponse = { comment: Comment };
