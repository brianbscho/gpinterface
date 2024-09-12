import { Static } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import { ApiKeyService } from "../../services/api-key";
import {
  ApiKeyCreateResponse,
  ApiKeysGetResponse,
} from "gpinterface-shared/type/api-key";
import { DeleteResponse, HashIdParam } from "gpinterface-shared/type";

export default async function (fastify: FastifyInstance) {
  const apiKeyService = new ApiKeyService(fastify);

  fastify.get("/", async (request, reply): Promise<ApiKeysGetResponse> => {
    const { user } = await fastify.getUser(request, reply);
    return apiKeyService.findManyByUserHashId(user.hashId);
  });

  fastify.delete<{ Params: Static<typeof HashIdParam> }>(
    "/:hashId",
    { schema: { params: HashIdParam } },
    async (request, reply): Promise<DeleteResponse> => {
      const { user } = await fastify.getUser(request, reply);
      const { hashId } = request.params;

      return apiKeyService.delete(hashId, user.hashId);
    }
  );

  fastify.post("/", async (request, reply): Promise<ApiKeyCreateResponse> => {
    const { user } = await fastify.getUser(request, reply);
    return apiKeyService.create(user.hashId);
  });
}
