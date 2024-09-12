import { FastifyInstance } from "fastify";
import { getTextResponse } from "../util/text";
import { GpiRepository } from "../repositories/gpi";
import { HistoryRepository } from "../repositories/history";
import { UserRepository } from "../repositories/user";

export class ChatService {
  private fastify: FastifyInstance;
  private gpiRepository: GpiRepository;
  private historyRepository: HistoryRepository;
  private userRepository: UserRepository;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.gpiRepository = new GpiRepository(fastify.prisma);
    this.historyRepository = new HistoryRepository(fastify.prisma);
    this.userRepository = new UserRepository(fastify.prisma);
  }

  private async checkUserAuthorization(
    fastify: FastifyInstance,
    gpi: any,
    userHashId: string | null
  ) {
    if (gpi.model.isLoginRequired || !gpi.model.isFree) {
      if (!userHashId) {
        throw fastify.httpErrors.unauthorized("Please login first.");
      }
      const balance = await this.userRepository.getBalance(userHashId);
      if (balance <= 0) {
        throw fastify.httpErrors.unauthorized(
          "You don't have enough balance. Please deposit first."
        );
      }
    }
  }

  async createCompletion(
    gpiHashId: string,
    userHashId: string | null,
    content: string
  ) {
    if (content.trim() === "") {
      throw this.fastify.httpErrors.badRequest("Empty content");
    }

    const gpi = await this.gpiRepository.findFirst(gpiHashId, userHashId);
    await this.checkUserAuthorization(this.fastify, gpi, userHashId);

    const { systemMessage, chatContents, config, model } = gpi;
    const messages = chatContents.concat({ role: "user", content });
    const response = await getTextResponse({
      model,
      systemMessage,
      config: config as any,
      messages,
    });

    const paid = gpi.model.isFree ? 0 : response.price;

    await this.historyRepository.create({
      userHashId,
      gpiHashId,
      provider: model.provider.name,
      model: model.name,
      config,
      systemMessage,
      messages,
      response,
    });

    if (userHashId) {
      await this.userRepository.updateBalance(userHashId, { decrement: paid });
    }

    return { content: response.content };
  }
}
