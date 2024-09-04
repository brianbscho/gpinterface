import { Type } from "@sinclair/typebox";
import { Content } from "./content";

export const GpiCreateSchema = Type.Object({
  description: Type.String(),
  chatHashId: Type.String(),
  modelHashId: Type.String(),
  config: Type.Any(),
  isPublic: Type.Boolean(),
});
export type GpiCreateResponse = { hashId: string };

type Gpi = {
  hashId: string;
  userHashId: string | null;
  description: string;
  chat: { hashId: string; systemMessage: string; contents: Content[] };
  config: object;
  modelHashId: string;
  isPublic: boolean;
};
export type GpiGetResponse = Gpi;
export type GpisGetResponse = Gpi[];

export const GpiUpdateSchema = Type.Object({
  description: Type.Optional(Type.String()),
  config: Type.Optional(Type.Any()),
  modelHashId: Type.Optional(Type.Any()),
  isPublic: Type.Optional(Type.Boolean()),
});
export type GpiUpdateResponse = {
  hashId: string;
  description: string;
  config: object;
  modelHashId: string;
  isPublic: boolean;
};
