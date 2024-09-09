export type SessionCreateResponse = { hashId: string };
export type SessionMessagesGetResponse = {
  messages: { role: string; content: string }[];
};
