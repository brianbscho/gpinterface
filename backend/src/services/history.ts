import { FastifyInstance } from "fastify";
import { getTypedHistory } from "../util/prisma";
import { HistoryRepository } from "../repositories/history";

export class HistoryService {
  private historyRepository: HistoryRepository;

  constructor(private fastify: FastifyInstance) {
    this.historyRepository = new HistoryRepository(fastify.prisma.history);
  }

  /**
   * Retrieves and processes a list of histories for the response.
   * @param userHashId - The hash ID of the user.
   * @param lastHashId - The last hash ID for pagination.
   * @returns An array of processed histories suitable for the response.
   * @throws {BadRequestError} If fetching histories fails.
   */
  public async getHistories(
    userHashId: string,
    lastHashId: string | null | undefined
  ) {
    const histories = await this.historyRepository.findHistoriesByUserHashId(
      userHashId,
      lastHashId
    );

    return histories.map((history) => getTypedHistory(history));
  }
}
