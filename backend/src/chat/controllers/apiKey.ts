import { FastifyInstance, FastifyRequest } from "fastify";

export async function getApiKey(
  fastify: FastifyInstance,
  request: FastifyRequest
) {
  const { authorization } = request.headers;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw fastify.httpErrors.unauthorized("Please provide your api key.");
  }

  const key = authorization.split(" ")[1] ?? "";
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

  return apiKey;
}
