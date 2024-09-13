import { FastifyInstance } from "fastify";
import { getTextResponse } from "../util/text";
import { GpiRepository } from "../repositories/gpi";
import { HistoryRepository } from "../repositories/history";
import { UserRepository } from "../repositories/user";
import { Prisma } from "@prisma/client";
import { ModelService } from "./model";

export class ChatService {
  private gpiRepository: GpiRepository;
  private historyRepository: HistoryRepository;
  private userRepository: UserRepository;
  private modelService: ModelService;

  constructor(private fastify: FastifyInstance) {
    this.gpiRepository = new GpiRepository(fastify.prisma.gpi);
    this.historyRepository = new HistoryRepository(fastify.prisma.history);
    this.userRepository = new UserRepository(fastify.prisma.user);
    this.modelService = new ModelService(fastify);
  }

  async createCompletion(
    gpiHashId: string,
    userHashId: string | null,
    content: string
  ) {
    if (content.trim() === "") {
      throw this.fastify.httpErrors.badRequest("Empty content");
    }

    const gpi = await this.gpiRepository.findByHashId(gpiHashId, userHashId);
    await this.modelService.checkAvailable(gpi.model, userHashId);

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
      config: config || Prisma.JsonNull,
      messages: (systemMessage
        ? [{ role: "system", content: systemMessage }]
        : []
      ).concat(messages),
      ...response,
    });

    if (userHashId) {
      await this.userRepository.updateBalance(userHashId, { decrement: paid });
    }

    return { content: response.content };
  }
}
