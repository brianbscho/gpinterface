import { PrismaClient } from "@prisma/client";
import { getDataWithHashId } from "../util/prisma";
import { nanoid } from "nanoid";

export class ApiKeyRepository {
  constructor(private prisma: PrismaClient) {}

  findByKey = async (key: string) => {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { key },
      select: { hashId: true, user: { select: { hashId: true } } },
    });

    if (!apiKey) {
      throw "API key not found";
    }

    return apiKey;
  };

  findManyByUserHashId = async (userHashId: string) => {
    return this.prisma.apiKey.findMany({
      where: { userHashId },
      select: { hashId: true, key: true },
    });
  };

  create = async (userHashId: string) => {
    let retries = 0;

    while (retries < 5) {
      try {
        return await this.prisma.apiKey.create({
          data: getDataWithHashId({ key: nanoid(64), userHashId }),
          select: { hashId: true, key: true },
        });
      } catch (error) {
        retries++;
        console.log("🚀 ~ error:", error);
      }
    }

    throw "Too many collisions and failed to create entity";
  };

  delete = async (hashId: string, userHashId: string) => {
    return this.prisma.apiKey.delete({ where: { hashId, userHashId } });
  };
}
