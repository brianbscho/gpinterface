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
                    configs: {
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

        return { providerTypes };
      } catch (ex) {
        console.error("path: /provider/types, method: get, error:", ex);
        throw ex;
      }
    }
  );
}
