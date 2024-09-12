import { Prisma } from "@prisma/client";

export class GpiRepository {
  constructor(private gpi: Prisma.GpiDelegate) {}

  async findFirst(hashId: string, userHashId: string | null) {
    const gpi = await this.gpi.findFirst({
      where: {
        hashId,
        OR: [{ userHashId }, { isPublic: true }],
        model: { isAvailable: true },
      },
      select: {
        config: true,
        model: {
          select: {
            name: true,
            inputPricePerMillion: true,
            outputPricePerMillion: true,
            provider: { select: { name: true } },
            isFree: true,
            isLoginRequired: true,
          },
        },
        systemMessage: true,
        chatContents: {
          select: { role: true, content: true },
          orderBy: { id: "asc" as const },
          where: { isDeployed: true },
        },
      },
    });

    if (!gpi) {
      throw new Error(`GPI with hashId ${hashId} not found`);
    }

    return gpi;
  }
}
