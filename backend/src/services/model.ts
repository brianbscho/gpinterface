import { FastifyInstance } from "fastify";
import { UserRepository } from "../repositories/user";

/**
 * Interface representing the properties of a model.
 */
interface Model {
  isLoginRequired: boolean;
  isFree: boolean;
}

/**
 * Service class responsible for handling model-related business logic.
 */
export class ModelService {
  private userRepository: UserRepository;

  /**
   * Initializes the ModelService with the necessary repositories.
   * @param fastify - The FastifyInstance for accessing Prisma.
   */
  constructor(private fastify: FastifyInstance) {
    this.userRepository = new UserRepository(fastify.prisma.user);
  }

  /**
   * Checks if the model is available for the user based on the model's requirements and the user's balance.
   * @param model - The model object containing its properties.
   * @param userHashId - The hash ID of the user. Can be null if the user is not logged in.
   * @throws {Error} If the model requires login but the user is not logged in.
   * @throws {Error} If the user does not have sufficient balance.
   */
  checkAvailable = async (
    model: Model,
    userHashId: string | null
  ): Promise<void> => {
    // Determine if the model requires login or is not free
    if (model.isLoginRequired || !model.isFree) {
      // If login is required but userHashId is null, throw an error
      if (!userHashId) {
        throw new Error("Please login first.");
      }

      // Retrieve the user's balance
      const balance = await this.userRepository.getUserBalanceByHashId(
        userHashId
      );

      // If the balance is insufficient, throw an error
      if (balance <= 0) {
        throw new Error("You don't have enough balance. Please deposit first.");
      }
    }
  };
}
