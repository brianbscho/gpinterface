import { Type } from "@sinclair/typebox";

export const TextExampleSchema = Type.Object({
  input: Type.Any(),
  content: Type.String(),
  response: Type.Any(),
  price: Type.Number(),
});
