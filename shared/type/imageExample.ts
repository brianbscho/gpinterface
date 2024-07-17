import { Type } from "@sinclair/typebox";

export const ImageExampleSchema = Type.Object({
  input: Type.Any(),
  url: Type.String(),
  response: Type.Any(),
  price: Type.Number(),
});
