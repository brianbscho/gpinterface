import { Type } from "@sinclair/typebox";

export type ChatContent = {
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
};

export const ChatContentCreateSchema = Type.Object({
  modelHashId: Type.String(),
  content: Type.String(),
  config: Type.Any(),
});

export const ChatContentUpdateSchema = Type.Object({
  content: Type.String(),
});
export type ChatContentUpdateResponse = {
  hashId: string;
  content: string;
  isModified: boolean;
};

export const ChatContentsDeleteSchema = Type.Object({
  hashIds: Type.Array(Type.String()),
});

export const ChatContentRefreshSchema = Type.Object({
  modelHashId: Type.String(),
  config: Type.Any(),
});

export const ChatContentsCreateSchema = Type.Object({
  gpiHashId: Type.String(),
});
export type ChatContentsCreateResponse = ChatContent[];
