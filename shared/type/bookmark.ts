import { Type } from "@sinclair/typebox";
import { Post } from ".";

export const BookmarkUpdateSchema = Type.Object({
  postHashId: Type.String(),
  isBookmarked: Type.Boolean(),
});
export type BookmarkUpdateResponse = {
  isBookmarked: boolean;
};

export const BookmarksQueryParamSchema = Type.Object({
  lastHashId: Type.Optional(Type.String()),
  type: Type.Optional(
    Type.Union([Type.Literal("post"), Type.Literal("prompt")])
  ),
});
export type BookmarksGetResponse = {
  bookmarks: { hashId: string; post: Post }[];
};
