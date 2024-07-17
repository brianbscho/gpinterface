import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { getDataWithHashId } from "../util/prisma";

export async function createApiKey(
  apiKey: Prisma.ApiKeyDelegate,
  userHashId: string
) {
  let retries = 0;

  while (retries < 5) {
    try {
      const newApiKey = await apiKey.create({
        data: getDataWithHashId({ key: nanoid(64), userHashId }),
        select: { hashId: true, key: true },
      });
      return newApiKey;
    } catch (error) {
      retries++;
      console.log("🚀 ~ error:", error);
    }
  }

  throw "Too many collision and failed to create entity";
}
