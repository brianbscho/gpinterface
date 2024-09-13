import { FastifyInstance } from "fastify";
import { ProviderTypeRepository } from "../repositories/provider-type";

export class ProviderTypeService {
  private providerTypeRepository: ProviderTypeRepository;

  constructor(private fastify: FastifyInstance) {
    this.providerTypeRepository = new ProviderTypeRepository(
      fastify.prisma.providerType
    );
  }

  /**
   * Retrieves and processes a list of providerTypes for the response.
   * @returns An array of processed providerTypes suitable for the response.
   * @throws {BadRequestError} If fetching providerTypes fails.
   */
  public async getHistories() {
    return await this.providerTypeRepository.findMany();
  }
}
