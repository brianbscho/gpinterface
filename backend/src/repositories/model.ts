import { Prisma } from "@prisma/client";

export class ModelRepository {
  constructor(private model: Prisma.ModelDelegate) {}

  /**
   * Finds a model by its hash ID, ensuring it is available.
   *
   * @param hashId - The hash ID of the model to be retrieved.
   * @returns The model details, including pricing and provider information.
   * @throws Error if the model is not found or unavailable.
   */
  public async findModelByHashId(hashId: string) {
    const model = await this.model.findFirst({
      where: { hashId, isAvailable: true }, // Ensure the model is available
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
      throw new Error(`Model with hashId ${hashId} not found`);
    }

    return model;
  }
}
