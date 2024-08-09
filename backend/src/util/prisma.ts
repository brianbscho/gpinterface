import { nanoid } from "nanoid";

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

export async function upsertEntity<
  UpsertArgs extends { where: any; update: any; create: any; select?: any },
  Result
>(
  upsert: (
    args: UpsertArgs & { create: UpsertArgs["create"] & { hashId: string } }
  ) => Promise<Result>,
  args: UpsertArgs,
  nanoidSize?: number
) {
  let retries = 0;

  while (retries < 5) {
    try {
      const createWithHashId = {
        ...args,
        create: getDataWithHashId(args.create, nanoidSize),
      };
      const result = await upsert(createWithHashId);
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
