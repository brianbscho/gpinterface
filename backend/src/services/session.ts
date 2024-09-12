import { FastifyInstance } from "fastify";
import { SessionRepository } from "../repositories/session";
import { getTextResponse } from "../util/text";
import { GpiRepository } from "../repositories/gpi";
import { SessionMessageRepository } from "../repositories/session-message";
import { Prisma } from "@prisma/client";
import { HistoryRepository } from "../repositories/history";
import { UserRepository } from "../repositories/user";

export class SessionService {
  private historyRepository: HistoryRepository;
  private sessionRepository: SessionRepository;
  private sessionMessageRepository: SessionMessageRepository;
  private gpiRepository: GpiRepository;
  private userRepository: UserRepository;
  constructor(private fastify: FastifyInstance) {
    this.historyRepository = new HistoryRepository(fastify.prisma);
    this.sessionRepository = new SessionRepository(fastify.prisma);
    this.sessionMessageRepository = new SessionMessageRepository(
      fastify.prisma
    );
    this.gpiRepository = new GpiRepository(fastify.prisma);
    this.userRepository = new UserRepository(fastify.prisma);
  }

  create = async (gpiHashId: string, userHashId: string | null) => {
    await this.gpiRepository.findFirst(gpiHashId, userHashId);
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

    const session = await this.sessionRepository.find(
      sessionHashId,
      userHashId
    );

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
      response,
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
