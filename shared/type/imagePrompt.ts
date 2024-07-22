import { Type } from "@sinclair/typebox";
import { ImageExampleSchema } from "./imageExample";
import { ImagePrompt as ImagePromptType } from ".";

export const ImagePrompt = {
  provider: Type.String(),
  model: Type.String(),
  prompt: Type.String(),
  config: Type.Any(),
};
export const ImagePromptSchema = Type.Object({
  ...ImagePrompt,
  examples: Type.Array(ImageExampleSchema),
});

export const ImagePromptExecuteSchema = Type.Object({
  hashId: Type.String(),
});
export const ImagePromptDraftExecuteSchema = Type.Object({
  ...ImagePrompt,

  input: Type.Any(),
});
export type ImagePromptExecuteResponse = {
  url: string;
  response: object;
  price: number;
};

export const ImagePromptUpdateSchema = Type.Object({
  hashId: Type.Optional(Type.String()),
  postHashId: Type.String(),
  ...ImagePrompt,
  examples: Type.Array(ImageExampleSchema),
});
export type ImagePromptUpdateResponse = { hashId: string };

export const ImagePromptDeleteSchema = Type.Object({
  hashId: Type.String(),
});

export type ImagePromptBookmark = {
  hashId: string;
  post: { hashId: string; user: { hashId: string; name: string } | null };
  imagePrompt: ImagePromptType;
};
export type ImagePromptBookmarksGetResponse = {
  imagePrompts: ImagePromptBookmark[];
};
