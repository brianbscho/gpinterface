import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  ApiKeyCreateResponse,
  ApiKeyDeleteResponse,
  ApiKeyDeleteSchema,
} from "gpinterface-shared/type/apiKey";
import { createApiKey } from "../controllers/apiKey";

export default async function (fastify: FastifyInstance) {
  fastify.delete<{ Body: Static<typeof ApiKeyDeleteSchema> }>(
    "/",
    { schema: { body: ApiKeyDeleteSchema } },
    async (request, reply): Promise<ApiKeyDeleteResponse> => {
      try {
        const { user } = await fastify.getUser(request, reply);
        const { hashId } = request.body;

        await fastify.prisma.apiKey.delete({
          where: { hashId, userHashId: user.hashId },
        });
        return { hashId };
      } catch (ex) {
        console.error("path: /api/key, method: delete, error:", ex);
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
      console.error("path: /api/key, method: post, error:", ex);
      throw ex;
    }
  });
}
