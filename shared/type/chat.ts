import { Type } from "@sinclair/typebox";
import { Content } from "./content";

type Chat = {
  hashId: string;
  userHashId: string | null;

  systemMessage: string;
  contents: Content[];
  createdAt: string;
  gpis: {
    hashId: string;
    description: string;
    config: object;
    modelHashId: string;
    isPublic: boolean;
  }[];
};
export type ChatGetResponse = Chat;
export type ChatsGetResponse = Chat[];

export type ChatUpdateResponse = {
  systemMessage: string;
};
export const ChatUpdateSchema = Type.Object({
  systemMessage: Type.String(),
});

export type ChatCreateResponse = Chat;

export const ChatCompletionSchema = Type.Object({
  gpiHashId: Type.String(),
  content: Type.String(),
});

export type ChatCompletionResponse = { content: string };
export type ChatCompletionSampleResponse = {
  content: string;
  sessionHashId: string;
};
