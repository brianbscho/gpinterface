import { Prisma } from "@prisma/client";

export class ProviderTypeRepository {
  constructor(private providerType: Prisma.ProviderTypeDelegate) {}

  async findMany() {
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
              where: { isAvailable: true },
              orderBy: { name: "asc" },
            },
          },
          orderBy: { name: "asc" },
        },
      },
    });
  }
}
