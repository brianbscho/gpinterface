import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

export async function getProviderTypeHashId() {
  let providerType = await prisma.providerType.findFirst({
    where: { type: "Text generation" },
    select: { hashId: true },
  });
  if (!providerType) {
    providerType = await prisma.providerType.create({
      data: { type: "Text generation", hashId: nanoid() },
      select: { hashId: true },
    });
  }

  return providerType.hashId;
}
