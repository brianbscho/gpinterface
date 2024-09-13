import { ApiKey, Prisma } from "@prisma/client";
import { getDataWithHashId } from "../util/prisma";
import { nanoid } from "nanoid";

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
  private readonly MAX_RETRIES = 5;

  constructor(private apiKey: Prisma.ApiKeyDelegate) {}

  /**
   * Finds an API key by its key string.
   * @param key - The API key string.
   * @returns The API key with associated user hash ID.
   * @throws ApiKeyNotFoundError if the key is not found.
   */
  public async findByKey(
    key: string
  ): Promise<Pick<ApiKey, "hashId"> & { user: { hashId: string } }> {
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
   * Finds multiple API keys associated with a user's hash ID.
   * @param userHashId - The user's hash ID.
   * @returns An array of API keys with their hash IDs and key strings.
   */
  public async findManyByUserHashId(
    userHashId: string
  ): Promise<Array<Pick<ApiKey, "hashId" | "key">>> {
    return this.apiKey.findMany({
      where: { userHashId },
      select: { hashId: true, key: true },
    });
  }

  /**
   * Creates a new API key for a user.
   * @param userHashId - The user's hash ID.
   * @returns The newly created API key with its hash ID and key string.
   * @throws ApiKeyCreationError if key creation fails after maximum retries.
   */
  public async create(
    userHashId: string
  ): Promise<Pick<ApiKey, "hashId" | "key">> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const newKey = nanoid(64);
        const data = getDataWithHashId({ key: newKey, userHashId });

        return await this.apiKey.create({
          data,
          select: { hashId: true, key: true },
        });
      } catch (error) {
        if (this.isUniqueConstraintError(error)) {
          // Log the collision and retry
          console.error(
            `Attempt ${attempt}: Collision detected for API key. Retrying...`,
            error
          );
          continue;
        }
        // For other errors, rethrow
        throw error;
      }
    }

    throw new ApiKeyCreationError();
  }

  /**
   * Deletes an API key based on its hash ID and the user's hash ID.
   * @param hashId - The hash ID of the API key.
   * @param userHashId - The hash ID of the user.
   * @returns The deleted API key.
   */
  public async delete(hashId: string, userHashId: string): Promise<ApiKey> {
    try {
      return await this.apiKey.delete({
        where: { hashId, userHashId },
      });
    } catch (error) {
      // Handle specific errors or rethrow
      console.error(`Failed to delete API key with hashId: ${hashId}`, error);
      throw error;
    }
  }

  /**
   * Checks if the error is a unique constraint violation.
   * This implementation assumes PostgreSQL; adjust as needed for your DB.
   * @param error - The error to check.
   * @returns True if it's a unique constraint error, else false.
   */
  private isUniqueConstraintError(error: any): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" // Unique constraint failed
    );
  }

  public async deleteByUserHashId(userHashId: string) {
    return this.apiKey.deleteMany({ where: { userHashId } });
  }
}
