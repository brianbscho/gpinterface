import { Prisma } from "@prisma/client";
import { createEntity, getDataWithHashId, getIdByHashId } from "../util/prisma";

export class HistoryRepository {
  constructor(private history: Prisma.HistoryDelegate) {}

  async create(data: Omit<Prisma.HistoryUncheckedCreateInput, "hashId">) {
    const createdHistory = await createEntity(this.history.create, {
      data: getDataWithHashId(data),
    });

    return createdHistory;
  }

  /**
   * Finds multiple histories based on user hash ID, search keyword, and pagination ID.
   * @param userHashId - The hash ID of the user.
   * @param hashId - The last history ID for pagination.
   * @returns An array of histories matching the criteria.
   */
  public async findMany(userHashId: string, hashId: string | null | undefined) {
    const id = await getIdByHashId(this.history.findFirst, hashId);

    return this.history.findMany({
      where: {
        userHashId,
        ...(id > 0 && { id: { lt: id } }),
      },
      select: {
        hashId: true,
        provider: true,
        model: true,
        config: true,
        messages: true,
        content: true,
        response: true,
        price: true,
        inputTokens: true,
        outputTokens: true,
        createdAt: true,
        paid: true,
      },
      orderBy: { id: "desc" },
      take: 20,
    });
  }

  public async deleteByUserHashId(userHashId: string) {
    await this.history.updateMany({
      where: { userHashId },
      data: { userHashId: null },
    });
  }
}
