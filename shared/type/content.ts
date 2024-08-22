import { Type } from "@sinclair/typebox";
import { Content } from ".";

export const ContentCreateSchema = Type.Object({
  chatHashId: Type.String(),
  apiHashId: Type.Optional(Type.String()),
  modelHashId: Type.Optional(Type.String()),
  content: Type.String(),
  config: Type.Any(),
});

export const ContentUpdateSchema = Type.Object({
  content: Type.String(),
});
export type ContentUpdateResponse = {
  hashId: string;
  content: string;
};

export const ContentsDeleteSchema = Type.Object({
  hashIds: Type.Array(Type.String()),
});
export type ContentsDeleteResponse = {
  success: boolean;
};

export const ContentRefreshSchema = Type.Object({
  chatHashId: Type.String(),
  modelHashId: Type.String(),
  config: Type.Any(),
});

export const ContentsGetSchema = Type.Object({
  chatHashId: Type.String(),
});
export type ContentsGetResponse = {
  contents: Content[];
};

export const ContentsCreateSchema = Type.Object({
  chatHashId: Type.String(),
});
export type ContentsCreateResponse = {
  contents: Content[];
};
