import { Prisma } from "@prisma/client";

export class ProviderTypeRepository {
  constructor(private providerType: Prisma.ProviderTypeDelegate) {}

  /**
   * Retrieves all provider types along with their associated providers and available models.
   * The models and their configurations are included only if they are available.
   *
   * @returns A list of provider types with nested providers, models, and their configurations.
   */
  public async findAllProviderTypes() {
    return await this.providerType.findMany({
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
              where: { isAvailable: true }, // Only select models that are available
              orderBy: { name: "asc" }, // Order models by name in ascending order
            },
          },
          orderBy: { name: "asc" }, // Order providers by name in ascending order
        },
      },
    });
  }
}
