import { Prisma } from "@prisma/client";

export class ModelRepository {
  constructor(private model: Prisma.ModelDelegate) {}

  async findByHashId(hashId: string) {
    const model = await this.model.findFirst({
      where: { hashId, isAvailable: true },
      select: {
        name: true,
        inputPricePerMillion: true,
        outputPricePerMillion: true,
        provider: { select: { name: true } },
        isFree: true,
        isLoginRequired: true,
      },
    });

    if (!model) {
      throw `Model with hashId ${hashId} not found`;
    }

    return model;
  }
}
