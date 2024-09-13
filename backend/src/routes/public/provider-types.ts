import { FastifyInstance } from "fastify";
import { ProviderTypesGetResponse } from "gpinterface-shared/type/provider-type";
import { ProviderTypeService } from "../../services/provider-type";

export default async function (fastify: FastifyInstance) {
  const providerTypeService = new ProviderTypeService(fastify);

  fastify.get(
    "/",
    async (request, reply): Promise<ProviderTypesGetResponse> => {
      return await providerTypeService.getHistories();
    }
  );
}
