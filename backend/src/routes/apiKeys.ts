import { FastifyInstance } from "fastify";
import { ApiKeysGetResponse } from "gpinterface-shared/type/apiKey";

export default async function (fastify: FastifyInstance) {
  fastify.get("/", async (request, reply): Promise<ApiKeysGetResponse> => {
    try {
      const { user } = await fastify.getUser(request, reply);

      const apiKeys = await fastify.prisma.apiKey.findMany({
        where: { userHashId: user.hashId },
        select: { hashId: true, key: true },
      });

      return {
        apiKeys: apiKeys.map((a) => ({
          hashId: a.hashId,
          key: `${a.key.slice(0, 2)}........................${a.key.slice(-4)}`,
        })),
      };
    } catch (ex) {
      console.error("path: /api/keys, method: get, error:", ex);
      throw ex;
    }
  });
}
