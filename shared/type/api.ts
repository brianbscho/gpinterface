import { Type } from "@sinclair/typebox";
import { Content } from "./content";

export const ApiCreateSchema = Type.Object({
  description: Type.String(),
  chatHashId: Type.String(),
  modelHashId: Type.String(),
  config: Type.Any(),
  isPublic: Type.Boolean(),
});
export type ApiCreateResponse = { hashId: string };

export type ApiGetResponse = {
  hashId: string;
  userHashId: string | null;
  description: string;
  chat: { hashId: string; systemMessage: string; contents: Content[] };
  config: object;
  modelHashId: string;
  isPublic: boolean;
};

type ApiResponse = {
  hashId: string;
  description: string;

  systemMessage: string;
  messages: { hashId: string; role: string; content: string }[];
  createdAt: string;
};
export type ApisGetResponse = {
  apis: ApiResponse[];
};

export const ApiUpdateSchema = Type.Object({
  description: Type.Optional(Type.String()),
  config: Type.Optional(Type.Any()),
  modelHashId: Type.Optional(Type.Any()),
  isPublic: Type.Optional(Type.Boolean()),
});
