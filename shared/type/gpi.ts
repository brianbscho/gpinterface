import { Type } from "@sinclair/typebox";
import { ChatContent } from "./chat-content";

export const GpiDeploySchema = Type.Object({
  description: Type.String(),
  modelHashId: Type.String(),
  config: Type.Any(),
  isPublic: Type.Boolean(),
});

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
  isDeployed: boolean;
  isEditing: boolean;
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
