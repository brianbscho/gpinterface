import { Prisma } from "@prisma/client";
import { Static } from "@sinclair/typebox";
import { TextPromptSchema } from "gpinterface-shared/type/textPrompt";

export function getTypedTextPrompts(
  textPrompts: {
    hashId: string;
    provider: string;
    model: string;
    systemMessage: string;
    config: Prisma.JsonValue;
    examples: {
      hashId: string;
      input: Prisma.JsonValue;
      content: string;
      response: Prisma.JsonValue;
      price: number;
    }[];
    messages: {
      hashId: string;
      role: string;
      content: string;
    }[];
  }[]
) {
  return textPrompts.map((t) => ({
    ...t,
    config: t.config as any,
    examples: t.examples.map((e) => ({
      ...e,
      input: e.input as any,
      response: e.response as any,
    })),
  }));
}

export function confirmTextPrompt(
  textPrompts: Static<typeof TextPromptSchema>[]
) {
  return (
    textPrompts.length === 0 ||
    textPrompts.every(
      (t) =>
        (t.examples.length > 0 &&
          t.examples.every((e) => e.content.length > 0 && !!e.response)) ||
        t.messages.filter((m) => m.content.trim().length > 0).length > 0
    )
  );
}
