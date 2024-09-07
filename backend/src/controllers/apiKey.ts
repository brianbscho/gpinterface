import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { getDataWithHashId } from "../util/prisma";
import { FastifyInstance, FastifyRequest } from "fastify";

export async function getApiKey(
  fastify: FastifyInstance,
  request: FastifyRequest
) {
  try {
    const { authorization } = request.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw fastify.httpErrors.unauthorized("Please provide your api key.");
    }

    const key = authorization.split(" ")[1];
    if (!key) {
      throw fastify.httpErrors.unauthorized("Please provide your api key.");
    }

    const apiKey = await fastify.prisma.apiKey.findFirst({
      where: { key },
      select: { hashId: true, user: { select: { hashId: true } } },
    });
    if (!apiKey) {
      throw fastify.httpErrors.unauthorized("Please provide your api key.");
    }

    return apiKey.user.hashId;
  } catch (ex) {
    throw ex;
  }
}

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
