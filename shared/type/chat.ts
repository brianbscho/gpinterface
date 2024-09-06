import { Type } from "@sinclair/typebox";

export const ChatCompletionSchema = Type.Object({
  gpiHashId: Type.String(),
  content: Type.String(),
});
export type ChatCompletionResponse = { content: string };
export type ChatCompletionSampleResponse = {
  content: string;
  sessionHashId: string;
};
