import { Type } from "@sinclair/typebox";

export const BookmarkUpdateSchema = Type.Object({
  postHashId: Type.String(),
  isBookmarked: Type.Boolean(),
});
export type BookmarkUpdateResponse = {
  isBookmarked: boolean;
};
