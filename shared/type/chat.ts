import { Chat } from ".";

export type ChatsGetResponse = { chats: Chat[] };
export type ChatCreateResponse = { chat: Chat };
export type ChatDuplicateResponse = { hashId: string };
