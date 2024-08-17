import { Prisma } from "@prisma/client";

export function getTypedContent<T>(content: T & { config: Prisma.JsonValue }) {
  return { ...content, config: content.config as any };
}
