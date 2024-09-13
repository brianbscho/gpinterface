import { FastifyInstance } from "fastify";
import { ChatContentRepository } from "../repositories/chat-content";
import { GpiRepository } from "../repositories/gpi";
import { ModelRepository } from "../repositories/model";
import { ModelService } from "./model";
import {
  getIdByHashId,
  getTypedContent,
  getTypedContents,
  getTypedHistory,
} from "../util/prisma";
import { getTextResponse } from "../util/text";
import { HistoryRepository } from "../repositories/history";
import { UserRepository } from "../repositories/user";

export class ChatContentService {
  private chatContentRepository: ChatContentRepository;
  private gpiRepository: GpiRepository;
  private modelRepository: ModelRepository;
  private modelService: ModelService;
  private historyRepository: HistoryRepository;
  private userRepository: UserRepository;

  constructor(private fastify: FastifyInstance) {
    this.chatContentRepository = new ChatContentRepository(
      fastify.prisma.chatContent
    );
    this.gpiRepository = new GpiRepository(fastify.prisma.gpi);
    this.modelRepository = new ModelRepository(fastify.prisma.model);
    this.modelService = new ModelService(fastify);
    this.historyRepository = new HistoryRepository(fastify.prisma.history);
    this.userRepository = new UserRepository(fastify.prisma.user);
  }

  patch = async (hashId: string, userHashId: string, content: string) => {
    const oldContent = await this.chatContentRepository.findByHashId(
      hashId,
      userHashId
    );

    const isModified = oldContent.role !== "user" && !!oldContent.modelHashId;
    await this.chatContentRepository.updateContent(hashId, content, isModified);
    await this.gpiRepository.updateUpdatedAt(oldContent.gpiHashId);
    return { hashId, content, isModified };
  };

  createEmpty = async (gpiHashId: string, userHashId: string) => {
    await this.gpiRepository.checkIsAccessible(gpiHashId, userHashId);

    const chatContents = await this.chatContentRepository.createManyAndReturn([
      {
        gpiHashId,
        role: "user",
        content: "",
        isDeployed: false,
      },
      {
        gpiHashId,
        role: "assistant",
        content: "",
        isDeployed: false,
      },
    ]);
    await this.gpiRepository.updateUpdatedAt(gpiHashId);

    return getTypedContents(chatContents);
  };

  createCompletion = async (
    gpiHashId: string,
    userHashId: string,
    modelHashId: string,
    config: any,
    content: string
  ) => {
    const model = await this.modelRepository.findByHashId(modelHashId);
    await this.modelService.checkAvailable(model, userHashId);

    const gpi = await this.gpiRepository.findByHashId(
      gpiHashId,
      userHashId,
      true
    );

    const { systemMessage, chatContents } = gpi;
    const messages = chatContents.concat({ role: "user", content });
    let response = await getTextResponse({
      model,
      systemMessage,
      config,
      messages,
    });
    const paid = model.isFree ? 0 : response.price;

    const [userChatContent, assistantChatContent] =
      await this.chatContentRepository.createManyAndReturn([
        {
          role: "user",
          content,
          gpiHashId,
          isDeployed: false,
        },
        {
          modelHashId,
          config,
          role: "assistant",
          content: response.content,
          gpiHashId,
          isDeployed: false,
        },
      ]);

    const history = await this.historyRepository.create({
      userHashId,
      gpiHashId,
      chatContentHashId: assistantChatContent.hashId,
      provider: model.provider.name,
      model: model.name,
      config: config,
      messages: (systemMessage
        ? [{ role: "system", content: systemMessage }]
        : []
      ).concat(messages),
      paid,
      ...response,
    });
    await this.gpiRepository.updateUpdatedAt(gpiHashId);
    if (paid > 0) {
      await this.userRepository.updateBalance(userHashId, { decrement: paid });
    }

    return [
      getTypedContent(userChatContent),
      {
        ...getTypedContent(assistantChatContent),
        history: getTypedHistory(history),
      },
    ];
  };

  refresh = async (
    hashId: string,
    userHashId: string,
    modelHashId: string,
    config: any
  ) => {
    const model = await this.modelRepository.findByHashId(modelHashId);
    await this.modelService.checkAvailable(model, userHashId);

    const gpi = await this.chatContentRepository.getGpi(hashId, userHashId);

    const id = await getIdByHashId(
      this.fastify.prisma.chatContent.findFirst,
      hashId
    );
    if (id < 1) {
      throw this.fastify.httpErrors.badRequest("content is not available.");
    }
    const messages = await this.chatContentRepository.getMessages(
      gpi.hashId,
      id
    );

    const { systemMessage } = gpi;
    let response = await getTextResponse({
      model,
      systemMessage,
      config,
      messages,
    });

    const paid = model.isFree ? 0 : response.price;
    const history = await this.historyRepository.create({
      userHashId,
      gpiHashId: gpi.hashId,
      chatContentHashId: hashId,
      provider: model.provider.name,
      model: model.name,
      config,
      messages: (systemMessage
        ? [{ role: "system", content: systemMessage }]
        : []
      ).concat(messages),
      paid,
      ...response,
    });
    const newContent = await this.chatContentRepository.updateHistories(
      hashId,
      {
        content: response.content,
        config,
        modelHashId,
        isModified: false,
        histories: { connect: { hashId: history.hashId } },
      }
    );
    await this.gpiRepository.updateUpdatedAt(gpi.hashId);
    if (paid > 0) {
      await this.userRepository.updateBalance(userHashId, { decrement: paid });
    }

    return getTypedContent({
      history: getTypedHistory(history),
      ...newContent,
    });
  };

  delete = async (hashIds: string[], userHashId: string) => {
    if (hashIds.length === 0) {
      throw this.fastify.httpErrors.badRequest("Nothing to delete");
    }

    const gpiHashId = await this.chatContentRepository.deleteManyByHashIds(
      hashIds,
      userHashId
    );
    await this.gpiRepository.updateUpdatedAt(gpiHashId);

    return { hashIds };
  };
}
