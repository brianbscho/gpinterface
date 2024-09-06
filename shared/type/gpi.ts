import { Type } from "@sinclair/typebox";
import { ChatContent } from "./chatContent";

export const GpiCreateSchema = Type.Object({
  modelHashId: Type.String(),
  config: Type.Any(),
});
export type GpiCreateResponse = { hashId: string };

type Gpi = {
  hashId: string;
  userHashId: string | null;
  description: string;
  systemMessage: string;
  chatContents: ChatContent[];
  config: object;
  modelHashId: string;
  isPublic: boolean;
};
export type GpiGetResponse = Gpi;
export type GpisGetResponse = Gpi[];

export const GpiUpdateSchema = Type.Object({
  description: Type.Optional(Type.String()),
  systemMessage: Type.Optional(Type.String()),
  config: Type.Optional(Type.Any()),
  modelHashId: Type.Optional(Type.Any()),
  isPublic: Type.Optional(Type.Boolean()),
});
export type GpiUpdateResponse = {
  hashId: string;
  description: string;
  systemMessage: string;
  config: object;
  modelHashId: string;
  isPublic: boolean;
};
