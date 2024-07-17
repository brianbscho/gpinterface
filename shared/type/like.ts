import { Type } from "@sinclair/typebox";

export const LikeUpdateSchema = Type.Object({
  postHashId: Type.String(),
  isLiked: Type.Boolean(),
});
export type LikeUpdateResponse = {
  isLiked: boolean;
  likes: number;
};
