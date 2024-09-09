import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { getDateString } from "./string";

export function getDataWithHashId<T>(data: T, nanoidSize?: number) {
  return { ...data, hashId: nanoid(nanoidSize) };
}

export async function createEntity<
  CreateArgs extends { data: any; select?: any },
  Result
>(
  create: (
    args: CreateArgs & { data: CreateArgs["data"] & { hashId: string } }
  ) => Promise<Result>,
  args: CreateArgs,
  nanoidSize?: number
) {
  let retries = 0;

  while (retries < 5) {
    try {
      const dataWithHashId = {
        ...args,
        data: getDataWithHashId(args.data, nanoidSize),
      };
      const result = await create(dataWithHashId);
      return result;
    } catch (error) {
      retries++;
      console.log("🚀 ~ error:", error);
    }
  }

  throw "Too many collision and failed to create entity";
}

export async function createManyEntities<
  CreateArgs extends { data: any[]; select?: any },
  Result
>(
  createMany: (
    args: CreateArgs & {
      data: (CreateArgs["data"][number] & { hashId: string })[];
    }
  ) => Promise<Result>,
  args: CreateArgs,
  nanoidSize?: number
) {
  let retries = 0;

  while (retries < 5) {
    try {
      const dataWithHashId = {
        ...args,
        data: args.data.map((d) => getDataWithHashId(d, nanoidSize)),
      };
      const result = await createMany(dataWithHashId);
      return result;
    } catch (error) {
      retries++;
      console.log("🚀 ~ error:", error);
    }
  }

  throw "Too many collision and failed to create entity";
}

export async function getIdByHashId(
  findFirst: (args: {
    where: { hashId: string };
    select: { id: true };
  }) => Promise<{ id: number } | null>,
  hashId?: string
) {
  if (!hashId) return -1;

  const prompt = await findFirst({
    where: { hashId },
    select: { id: true },
  });
  if (!prompt) {
    return -1;
  }
  return prompt.id;
}

export async function getUpdatedAtByHashId(
  findFirst: (args: {
    where: { hashId: string };
    select: { updatedAt: true };
  }) => Promise<{ updatedAt: Date | null } | null>,
  hashId?: string
) {
  if (!hashId) return null;

  const prompt = await findFirst({
    where: { hashId },
    select: { updatedAt: true },
  });
  if (!prompt) {
    return null;
  }
  return prompt.updatedAt;
}

export function getTypedContent<T>(
  chatContent: T & { config: Prisma.JsonValue }
) {
  return { ...chatContent, config: chatContent.config as any };
}

export function getTypedContents<T, H>(
  chatContents: (T & {
    config: Prisma.JsonValue;
    histories?: (H & {
      response: Prisma.JsonValue;
      config: Prisma.JsonValue;
      messages: Prisma.JsonValue;
      createdAt: Date;
    })[];
  })[]
) {
  return chatContents.map((c) => {
    const { histories, ...rest } = c;
    const chatContent = getTypedContent(rest);
    if (!histories || histories.length === 0) return chatContent;

    return { history: getTypedHistory(histories[0]), ...chatContent };
  });
}

export function getTypedHistory<T>(
  history:
    | T & {
        response: Prisma.JsonValue;
        config: Prisma.JsonValue;
        messages: Prisma.JsonValue;
        createdAt: Date;
      }
) {
  if (!history) return history;
  return {
    ...history,
    createdAt: getDateString(history.createdAt),
    response: history.response as any,
    config: history.config as any,
    messages: history.messages as any,
  };
}

export const ChatCompletionModelSelect = {
  name: true,
  inputPricePerMillion: true,
  outputPricePerMillion: true,
  provider: { select: { name: true } },
  isFree: true,
  isLoginRequired: true,
};

export const ChatCompletionContentsQuery = {
  select: { role: true, content: true },
  orderBy: { id: "asc" as const },
  where: { isDeployed: true },
};
export const MessageCompletionContentsQuery = {
  select: { role: true, content: true },
  orderBy: { id: "asc" as const },
};

export const ContentHistorySelect = {
  provider: true,
  model: true,
  config: true,
  messages: true,
  content: true,
  response: true,
  price: true,
  inputTokens: true,
  outputTokens: true,
  createdAt: true,
};
