import { Type } from "@sinclair/typebox";
import { Content } from ".";

export const ContentCreateSchema = Type.Object({
  chatHashId: Type.String(),
  modelHashId: Type.String(),
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
