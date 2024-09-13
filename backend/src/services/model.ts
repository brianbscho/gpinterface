import { FastifyInstance } from "fastify";
import { UserRepository } from "../repositories/user";

export class ModelService {
  private userRepository: UserRepository;

  constructor(private fastify: FastifyInstance) {
    this.userRepository = new UserRepository(fastify.prisma.user);
  }

  checkAvailable = async (
    model: { isLoginRequired: boolean; isFree: boolean },
    userHashId: string | null
  ) => {
    if (model.isLoginRequired || model.isFree) {
      if (!userHashId) {
        throw "Please login first.";
      }
      const balance = await this.userRepository.getBalance(userHashId);
      if (balance <= 0)
        throw "You don't have enough balance. Please deposit first.";
    }
  };
}
