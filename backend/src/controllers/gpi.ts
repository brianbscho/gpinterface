import { Prisma } from "@prisma/client";
import { getDataWithHashId } from "../util/prisma";

export async function createGpi(
  gpiDelegate: Prisma.GpiDelegate,
  gpis: {
    config: object;
    description: string;
    isPublic: boolean;
    chatHashId: string;
    modelHashId: string;
    userHashId: string;
  }
) {
  let retries = 0;

  while (retries < 5) {
    try {
      const newGpi = await gpiDelegate.create({
        data: getDataWithHashId(gpis, 32),
        select: { hashId: true },
      });

      return newGpi;
    } catch (error) {
      retries++;
      console.log("🚀 ~ error:", error);
    }
  }

  throw "Too many collision and failed to create entity";
}
