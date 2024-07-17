import { Type } from "@sinclair/typebox";
import { TextMessageSchema } from "./textMessage";
import { TextExampleSchema } from "./textExample";

export const TextPrompt = {
  provider: Type.String(),
  model: Type.String(),
  systemMessage: Type.String(),
  config: Type.Any(),
};
export const TextPromptSchema = Type.Object({
  ...TextPrompt,
  examples: Type.Array(TextExampleSchema),
  messages: Type.Array(TextMessageSchema),
});

export const TextPromptExecuteSchema = Type.Object({
  hashId: Type.String(),
});
export const TextPromptDraftExecuteSchema = Type.Object({
  ...TextPrompt,

  input: Type.Any(),
  messages: Type.Array(TextMessageSchema),
});
export type TextPromptExecuteResponse = {
  content: string;
  response: any;
  price: number;
};

export const TextPromptUpdateSchema = Type.Object({
  hashId: Type.Optional(Type.String()),
  postHashId: Type.String(),
  ...TextPrompt,
  examples: Type.Array(TextExampleSchema),
  messages: Type.Array(TextMessageSchema),
});
export type TextPromptUpdateResponse = { hashId: string };

export const TextPromptDeleteSchema = Type.Object({
  hashId: Type.String(),
});
