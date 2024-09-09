import { Type } from "@sinclair/typebox";

export const ChatCompletionSchema = Type.Object({ content: Type.String() });
export type ChatCompletionResponse = { content: string };
