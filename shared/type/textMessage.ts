import { Type } from "@sinclair/typebox";

export const TextMessageSchema = Type.Object({
  role: Type.String(),
  content: Type.String(),
});
