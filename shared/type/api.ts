import { Type } from "@sinclair/typebox";
import { Api } from ".";

export const ApiCreateSchema = Type.Object({
  description: Type.String(),
  chatHashId: Type.String(),
});
export type ApiCreateResponse = { hashId: string };

export type ApiGetResponse = {
  api: Api;
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
  description: Type.String(),
});
