import { FastifyInstance, FastifyRequest } from "fastify";
import { ApiKeyRepository } from "../repositories/api-key";

export class ApiKeyService {
  private apiKeyRepository: ApiKeyRepository;

  constructor(private fastify: FastifyInstance) {
    this.apiKeyRepository = new ApiKeyRepository(fastify.prisma.apiKey);
  }

  getUserHashId = async (request: FastifyRequest) => {
    const { authorization } = request.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw this.fastify.httpErrors.unauthorized(
        "Please provide your api key."
      );
    }

    const key = authorization.split(" ")[1];
    if (!key) {
      throw this.fastify.httpErrors.unauthorized(
        "Please provide your api key."
      );
    }

    const apiKey = await this.apiKeyRepository.findByKey(key);
    return apiKey.user.hashId;
  };

  findManyByUserHashId = async (userHashId: string) => {
    const apiKeys = await this.apiKeyRepository.findManyByUserHashId(
      userHashId
    );
    return apiKeys.map((a) => ({
      hashId: a.hashId,
      key: `${a.key.slice(0, 2)}${".".repeat(20)}${a.key.slice(-4)}`,
    }));
  };

  delete = async (hashId: string, userHashId: string) => {
    await this.apiKeyRepository.delete(hashId, userHashId);
    return { hashIds: [hashId] };
  };

  create = async (userHashId: string) => {
    return this.apiKeyRepository.create(userHashId);
  };
}
