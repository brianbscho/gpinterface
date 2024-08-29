import { Type } from "@sinclair/typebox";

export const SessionCreateSchema = Type.Object({
  gpiHashId: Type.String(),
});
export type SessionCreateResponse = { hashId: string };

export const SessionCompletionSchema = Type.Object({
  sessionHashId: Type.String(),
  content: Type.String(),
});
export type SessionCompletionResponse = { content: string };

export const SessionMessagesGetSchema = Type.Object({
  sessionHashId: Type.String(),
});
export type SessionMessagesGetResponse = {
  messages: { role: string; content: string }[];
};
