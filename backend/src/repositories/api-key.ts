import { ApiKey, Prisma } from "@prisma/client";
import { getDataWithHashId } from "../util/prisma";
import { nanoid } from "nanoid";

// Shared types for API Key Responses
type ApiKeyWithUserHashId = Pick<ApiKey, "hashId"> & {
  user: { hashId: string };
};
type ApiKeyBasicInfo = Pick<ApiKey, "hashId" | "key">;

// Custom Error Classes
class ApiKeyNotFoundError extends Error {
  constructor(message: string = "API key not found") {
    super(message);
    this.name = "ApiKeyNotFoundError";
  }
}

class ApiKeyCreationError extends Error {
  constructor(
    message: string = "Too many collisions and failed to create entity"
  ) {
    super(message);
    this.name = "ApiKeyCreationError";
  }
}

export class ApiKeyRepository {
  // Maximum number of retries for key generation to avoid collisions
  private readonly MAX_RETRIES = 5;

  // Initialize the repository with the Prisma delegate for ApiKey
  constructor(private apiKey: Prisma.ApiKeyDelegate) {}

  /**
   * Finds an API key by its key string.
   *
   * @param key - The API key string to search for.
   * @returns The API key associated with its hash ID and the user’s hash ID.
   * @throws ApiKeyNotFoundError if the key is not found.
   */
  public async findApiKeyByKey(key: string): Promise<ApiKeyWithUserHashId> {
    const apiKey = await this.apiKey.findFirst({
      where: { key },
      select: { hashId: true, user: { select: { hashId: true } } },
    });

    if (!apiKey) {
      throw new ApiKeyNotFoundError();
    }

    return apiKey;
  }

  /**
   * Finds all API keys associated with a specific user's hash ID.
   *
   * @param userHashId - The user's hash ID to search for API keys.
   * @returns An array of API keys with their hash IDs and key strings.
   */
  public async findApiKeysByUserHashId(
    userHashId: string
  ): Promise<Array<ApiKeyBasicInfo>> {
    return this.apiKey.findMany({
      where: { userHashId },
      select: { hashId: true, key: true },
    });
  }

  /**
   * Creates a new API key for a given user.
   *
   * @param userHashId - The user's hash ID for whom the API key will be created.
   * @returns The newly created API key including its hash ID and key string.
   * @throws ApiKeyCreationError if key creation fails after exceeding retries.
   */
  public async createApiKey(userHashId: string): Promise<ApiKeyBasicInfo> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const newKey = nanoid(64); // Generate a new unique key
        const data = getDataWithHashId({ key: newKey, userHashId });

        return await this.apiKey.create({
          data,
          select: { hashId: true, key: true },
        });
      } catch (error) {
        if (this.isUniqueConstraintError(error)) {
          console.error(
            `Attempt ${attempt}: Collision detected for API key. Retrying...`,
            error
          );
          continue;
        }
        // Re-throw the error if it's not a unique constraint error
        throw error;
      }
    }

    // Throw custom error if max retries exceeded
    throw new ApiKeyCreationError();
  }

  /**
   * Deletes an API key based on its hash ID and the user's hash ID.
   *
   * @param hashId - The hash ID of the API key to delete.
   * @param userHashId - The user's hash ID to validate ownership.
   * @returns The deleted API key record.
   */
  public async deleteApiKeyByHashId(
    hashId: string,
    userHashId: string
  ): Promise<ApiKey> {
    try {
      return await this.apiKey.delete({
        where: { hashId, userHashId },
      });
    } catch (error) {
      console.error(`Failed to delete API key with hashId: ${hashId}`, error);
      throw error;
    }
  }

  /**
   * Deletes all API keys associated with a specific user's hash ID.
   *
   * @param userHashId - The user's hash ID.
   * @returns The count of deleted API keys.
   */
  public async deleteApiKeysByUserHashId(userHashId: string) {
    return this.apiKey.deleteMany({ where: { userHashId } });
  }

  /**
   * Determines if an error is related to a unique constraint violation.
   * Adjust this method for your specific database type (this is for PostgreSQL).
   *
   * @param error - The error object to inspect.
   * @returns True if the error is due to a unique constraint violation, false otherwise.
   */
  private isUniqueConstraintError(error: any): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" // Unique constraint violation code for Prisma
    );
  }
}
