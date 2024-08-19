import { Type } from "@sinclair/typebox";
import { Content } from ".";

interface Chat {
  hashId: string;
  userHashId: string | null;

  isApi: boolean;
  isPost: boolean;

  systemMessage: string;
  contents: Content[];
  createdAt: string;
}

export type ChatsGetResponse = { chats: Chat[] };
export const ChatCreateSchema = Type.Object({ modelHashId: Type.String() });

export type ChatUpdateResponse = {
  systemMessage: string;
};
export const ChatUpdateSchema = Type.Object({
  systemMessage: Type.String(),
});

export type ChatCreateResponse = Chat;
export type ChatDuplicateResponse = { hashId: string };
