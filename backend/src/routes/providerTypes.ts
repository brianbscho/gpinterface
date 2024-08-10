import { FastifyInstance } from "fastify";
import { ProviderTypesGetResponse } from "gpinterface-shared/type/providerType";

export default async function (fastify: FastifyInstance) {
  fastify.get(
    "/",
    async (request, reply): Promise<ProviderTypesGetResponse> => {
      try {
        const providerTypes = await fastify.prisma.providerType.findMany({
          select: {
            hashId: true,
            type: true,
            providers: {
              select: {
                hashId: true,
                name: true,
                models: {
                  select: {
                    hashId: true,
                    name: true,
                    inputPricePerMillion: true,
                    outputPricePerMillion: true,
                    isFree: true,
                    isLoginRequired: true,
                    isAvailable: true,
                    configsOnModels: {
                      select: {
                        config: {
                          select: {
                            hashId: true,
                            name: true,
                            type: true,
                            description: true,
                            default: true,
                            min: true,
                            max: true,
                            options: {
                              select: {
                                hashId: true,
                                value: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        return {
          providerTypes: providerTypes.map((providerType) => ({
            ...providerType,
            providers: providerType.providers.map((provider) => ({
              ...provider,
              models: provider.models.map((model) => ({
                ...model,
                configs: model.configsOnModels.map((config) => config.config),
              })),
            })),
          })),
        };
      } catch (ex) {
        console.error("path: /provider/types, method: get, error:", ex);
        throw ex;
      }
    }
  );
}
