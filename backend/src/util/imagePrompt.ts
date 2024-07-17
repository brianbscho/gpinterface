import { Prisma } from "@prisma/client";
import { Static } from "@sinclair/typebox";
import { ImagePromptSchema } from "gpinterface-shared/type/imagePrompt";

export function getTypedImagePrompts(
  imagePrompts: {
    hashId: string;
    provider: string;
    model: string;
    prompt: string;
    config: Prisma.JsonValue;
    examples: {
      hashId: string;
      input: Prisma.JsonValue;
      url: string;
      response: Prisma.JsonValue;
      price: number;
    }[];
  }[]
) {
  return imagePrompts.map((i) => ({
    ...i,
    config: i.config as any,
    examples: i.examples.map((e) => ({
      ...e,
      input: e.input as any,
      response: e.response as any,
    })),
  }));
}

export function confirmImagePrompt(
  imagePrompts: Static<typeof ImagePromptSchema>[]
) {
  return (
    imagePrompts.length === 0 ||
    imagePrompts.every(
      (i) =>
        i.prompt.length > 0 &&
        i.examples.length > 0 &&
        i.examples.every((e) => e.url.length > 0 && !!e.response)
    )
  );
}
