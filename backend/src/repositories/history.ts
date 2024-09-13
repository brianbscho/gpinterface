import { Prisma } from "@prisma/client";
import { createEntity, getDataWithHashId, getIdByHashId } from "../util/prisma";

export class HistoryRepository {
  constructor(private history: Prisma.HistoryDelegate) {}

  /**
   * Creates a new history entry for a user.
   *
   * @param data - The data for creating the history entry (excluding hashId).
   * @returns The newly created history entry.
   */
  public async createHistory(
    data: Omit<Prisma.HistoryUncheckedCreateInput, "hashId">
  ) {
    const createdHistory = await createEntity(this.history.create, {
      data: getDataWithHashId(data),
    });

    return createdHistory;
  }

  /**
   * Finds multiple histories for a user, with optional pagination.
   *
   * @param userHashId - The hash ID of the user whose histories are to be retrieved.
   * @param hashId - The last history ID for pagination (optional).
   * @returns An array of histories matching the user and pagination criteria.
   */
  public async findHistoriesByUserHashId(
    userHashId: string,
    hashId: string | null | undefined
  ) {
    const id = await getIdByHashId(this.history.findFirst, hashId);

    return this.history.findMany({
      where: {
        userHashId,
        ...(id > 0 && { id: { lt: id } }), // Fetch histories with IDs less than the pagination ID
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
      orderBy: { id: "desc" }, // Sort by descending ID for pagination
      take: 20, // Limit the number of records to 20
    });
  }

  /**
   * Deletes histories by setting their userHashId to null, effectively disassociating them from the user.
   *
   * @param userHashId - The user's hash ID whose histories are to be deleted.
   * @returns The number of updated (disassociated) histories.
   */
  public async deleteHistoriesByUserHashId(userHashId: string) {
    return await this.history.updateMany({
      where: { userHashId },
      data: { userHashId: null }, // Set userHashId to null to "delete" the association
    });
  }
}
