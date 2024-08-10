import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { getProviderTypeHashId } from "./providerType";

const prisma = new PrismaClient();

export async function getProviderHashId(name: string) {
  const providerTypeHashId = await getProviderTypeHashId();
  let provider = await prisma.provider.findFirst({
    where: { name },
    select: { hashId: true },
  });
  if (!provider) {
    provider = await prisma.provider.create({
      data: { hashId: nanoid(), name, typeHashId: providerTypeHashId },
      select: { hashId: true },
    });
  }

  return provider.hashId;
}
