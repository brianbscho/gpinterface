import { FastifyInstance, FastifyRequest } from "fastify";
import { ApiKeyRepository } from "../repositories/api-key";

/**
 * Interface representing the structure of an API key response.
 */
interface ApiKeyResponse {
  hashId: string;
  key: string;
}

/**
 * Service class responsible for handling API key-related business logic.
 */
export class ApiKeyService {
  private apiKeyRepository: ApiKeyRepository;

  /**
   * Initializes the ApiKeyService with the necessary repository.
   * @param fastify - The FastifyInstance for accessing Prisma and HTTP errors.
   */
  constructor(private fastify: FastifyInstance) {
    this.apiKeyRepository = new ApiKeyRepository(fastify.prisma.apiKey);
  }

  /**
   * Extracts the user's hash ID from the request's authorization header.
   * @param request - The FastifyRequest object containing the headers.
   * @returns The user's hash ID.
   * @throws {UnauthorizedError} If the authorization header is missing or invalid.
   */
  getUserHashId = async (request: FastifyRequest): Promise<string> => {
    const { authorization } = request.headers;

    // Validate the presence and format of the Authorization header
    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw this.fastify.httpErrors.unauthorized(
        "Please provide your API key."
      );
    }

    // Extract the API key from the Authorization header
    const key = authorization.split(" ")[1];
    if (!key) {
      throw this.fastify.httpErrors.unauthorized(
        "Please provide your API key."
      );
    }

    // Retrieve the API key from the repository
    const apiKey = await this.apiKeyRepository.findApiKeyByKey(key);
    if (!apiKey) {
      throw this.fastify.httpErrors.unauthorized("Invalid API key provided.");
    }

    return apiKey.user.hashId;
  };

  /**
   * Retrieves and masks all API keys associated with a specific user.
   * @param userHashId - The hash ID of the user.
   * @returns An array of masked API key objects.
   */
  getByUserHashId = async (userHashId: string): Promise<ApiKeyResponse[]> => {
    const apiKeys = await this.apiKeyRepository.findApiKeysByUserHashId(
      userHashId
    );

    // Mask each API key for security purposes
    return apiKeys.map((apiKey) => ({
      hashId: apiKey.hashId,
      key: `${apiKey.key.slice(0, 2)}${".".repeat(20)}${apiKey.key.slice(-4)}`,
    }));
  };

  /**
   * Deletes a specific API key belonging to a user.
   * @param hashId - The hash ID of the API key to delete.
   * @param userHashId - The hash ID of the user.
   * @returns An object containing the deleted hash ID.
   * @throws {NotFoundError} If the API key does not exist or does not belong to the user.
   */
  deleteApiKey = async (
    hashId: string,
    userHashId: string
  ): Promise<{ hashIds: string[] }> => {
    // Attempt to delete the API key from the repository
    const deleted = await this.apiKeyRepository.deleteApiKeyByHashId(
      hashId,
      userHashId
    );

    if (!deleted) {
      throw this.fastify.httpErrors.notFound(
        "API key not found or unauthorized."
      );
    }

    return { hashIds: [hashId] };
  };

  /**
   * Creates a new API key for a specific user.
   * @param userHashId - The hash ID of the user.
   * @returns The newly created API key object.
   * @throws {Error} If the API key creation fails.
   */
  createApiKey = async (userHashId: string): Promise<ApiKeyResponse> => {
    // Create a new API key in the repository
    const newApiKey = await this.apiKeyRepository.createApiKey(userHashId);

    if (!newApiKey) {
      throw new Error("Failed to create a new API key.");
    }

    // Mask the API key before returning
    return {
      hashId: newApiKey.hashId,
      key: `${newApiKey.key.slice(0, 2)}${".".repeat(20)}${newApiKey.key.slice(
        -4
      )}`,
    };
  };
}
