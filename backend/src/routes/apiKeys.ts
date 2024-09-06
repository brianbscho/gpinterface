import { Static } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import {
  ApiKeyCreateResponse,
  ApiKeyDeleteResponse,
  ApiKeysGetResponse,
} from "gpinterface-shared/type/apiKey";
import { createApiKey } from "../controllers/apiKey";
import { ParamSchema } from "gpinterface-shared/type";

export default async function (fastify: FastifyInstance) {
  fastify.get("/", async (request, reply): Promise<ApiKeysGetResponse> => {
    try {
      const { user } = await fastify.getUser(request, reply);

      const apiKeys = await fastify.prisma.apiKey.findMany({
        where: { userHashId: user.hashId },
        select: { hashId: true, key: true },
      });

      return apiKeys.map((a) => ({
        hashId: a.hashId,
        key: `${a.key.slice(0, 2)}${".".repeat(20)}${a.key.slice(-4)}`,
      }));
    } catch (ex) {
      console.error("path: /api/keys, method: get, error:", ex);
      throw ex;
    }
  });
  fastify.delete<{ Params: Static<typeof ParamSchema> }>(
    "/:hashId",
    { schema: { params: ParamSchema } },
    async (request, reply): Promise<ApiKeyDeleteResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.params;

        await fastify.prisma.apiKey.delete({
          where: { hashId, userHashId: user.hashId },
        });
        return { hashId };
      } catch (ex) {
        console.error("path: /api/keys/:hashId, method: delete, error:", ex);
        throw ex;
      }
    }
  );
  fastify.post("/", async (request, reply): Promise<ApiKeyCreateResponse> => {
    try {
      const { user } = await fastify.getUser(request, reply);

      const newApiKey = await createApiKey(fastify.prisma.apiKey, user.hashId);

      return newApiKey;
    } catch (ex) {
      console.error("path: /api/keys, method: post, error:", ex);
      throw ex;
    }
  });
}
