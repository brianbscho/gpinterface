import { Type } from "@sinclair/typebox";

export interface Content {
  hashId: string;

  model?: { hashId: string | undefined; name: string } | null;
  role: string;
  content: string;
  config?: object | null;
  history?: {
    provider: string;
    model: string;
    config: object;
    messages: object;
    content: string;
    response: object;
    price: number;
    inputTokens: number;
    outputTokens: number;
    createdAt: string;
  } | null;
  isModified: boolean;
}

export const ContentCreateSchema = Type.Object({
  chatHashId: Type.String(),
  gpiHashId: Type.Optional(Type.String()),
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

export const ContentsCreateSchema = Type.Object({
  chatHashId: Type.String(),
});
export type ContentsCreateResponse = {
  contents: Content[];
};
