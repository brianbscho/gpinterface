import { FastifyInstance } from "fastify";
import { SessionRepository } from "../repositories/session";
import { getTextResponse } from "../util/text";
import { GpiRepository } from "../repositories/gpi";
import { SessionMessageRepository } from "../repositories/session-message";
import { Prisma } from "@prisma/client";
import { HistoryRepository } from "../repositories/history";
import { UserRepository } from "../repositories/user";
import { ModelService } from "./model";

export class SessionService {
  private historyRepository: HistoryRepository;
  private sessionRepository: SessionRepository;
  private sessionMessageRepository: SessionMessageRepository;
  private gpiRepository: GpiRepository;
  private userRepository: UserRepository;
  private modelService: ModelService;

  constructor(private fastify: FastifyInstance) {
    this.historyRepository = new HistoryRepository(fastify.prisma.history);
    this.sessionRepository = new SessionRepository(fastify.prisma.session);
    this.sessionMessageRepository = new SessionMessageRepository(
      fastify.prisma.sessionMessage
    );
    this.gpiRepository = new GpiRepository(fastify.prisma.gpi);
    this.userRepository = new UserRepository(fastify.prisma.user);
    this.modelService = new ModelService(fastify);
  }

  create = async (gpiHashId: string, userHashId: string | null) => {
    await this.gpiRepository.findByHashId(gpiHashId, userHashId);
    return this.sessionRepository.create(gpiHashId);
  };

  createCompletion = async (
    userHashId: string | null,
    sessionHashId: string,
    content: string
  ) => {
    if (content.trim() === "") {
      throw this.fastify.httpErrors.badRequest("Empty content");
    }

    const session = await this.sessionRepository.findByHashId(
      sessionHashId,
      userHashId
    );
    await this.modelService.checkAvailable(session.gpi.model, userHashId);

    const { gpi } = session;
    const { systemMessage, config, model } = gpi;
    const messages = gpi.chatContents
      .concat(session.messages)
      .concat({ role: "user", content });
    const response = await getTextResponse({
      model,
      systemMessage,
      config: config as any,
      messages,
    });
    await this.sessionMessageRepository.createMany(
      sessionHashId,
      content,
      response.content
    );

    const paid = session.gpi.model.isFree ? 0 : response.price;
    await this.historyRepository.create({
      userHashId,
      gpiHashId: session.gpi.hashId,
      sessionHashId,
      provider: model.provider.name,
      model: model.name,
      config: config ?? Prisma.JsonNull,
      messages,
      paid,
      ...response,
    });
    if (userHashId) {
      await this.userRepository.updateBalance(userHashId, { decrement: paid });
    }

    return { content: response.content };
  };

  getMessages = async (sessionHashId: string, userHashId: string | null) => {
    return this.sessionRepository.getMessages(sessionHashId, userHashId);
  };
}
