import { Type } from "@sinclair/typebox";
import { Content } from ".";

interface Api {
  hashId: string;
  description: string;
  chat: { hashId: string; systemMessage: string; contents: Content[] };
}

export const ApiCreateSchema = Type.Object({
  description: Type.String(),
  chatHashId: Type.String(),
  modelHashId: Type.String(),
  config: Type.Any(),
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
export type ApiChatsGetResponse = {
  chats: {
    hashId: string;
    messages: { role: string; content: string }[];
    createdAt: string;
  }[];
};
export type ApiSessionsGetResponse = {
  sessions: {
    hashId: string;
    messages: { hashId: string; role: string; content: string }[];
    createdAt: string;
  }[];
};

export const ApiUpdateSchema = Type.Object({
  description: Type.String(),
});
