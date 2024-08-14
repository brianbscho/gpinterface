import { Type } from "@sinclair/typebox";
import { Chat, Content } from ".";

export type ChatsGetResponse = { chats: Chat[] };
export const ChatCreateSchema = Type.Object({
  modelHashId: Type.String(),
  content: Type.String(),
  config: Type.Any(),
});
export type ChatCreateResponse = {
  hashId: string;

  isApi: boolean;
  isPost: boolean;

  systemMessage: string;
  contents: Content[];
  createdAt: string;
};
export type ChatDuplicateResponse = { hashId: string };
