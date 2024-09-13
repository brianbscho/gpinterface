import { Prisma } from "@prisma/client";

export class ChatContentRepository {
  constructor(private chatContent: Prisma.ChatContentDelegate) {}

  findByHashId = async (hashId: string, userHashId: string) => {
    const chatContent = await this.chatContent.findFirst({
      where: { hashId, gpi: { userHashId }, isDeployed: false },
      select: { hashId: true, gpiHashId: true, role: true, modelHashId: true },
    });
    if (!chatContent) {
      throw "content is not available.";
    }
    return chatContent;
  };

  getMessages = async (gpiHashId: string, id: number) => {
    const messages = await this.chatContent.findMany({
      where: { gpiHashId, isDeployed: false, id: { lt: id } },
      select: { role: true, content: true },
      orderBy: { id: "asc" as const },
    });
    if (messages.some((m) => m.content === "")) {
      throw "There is empty content in chat.";
    }

    return messages;
  };

  updateContent = async (
    hashId: string,
    content: string,
    isModified: boolean
  ) => {
    return this.chatContent.update({
      where: { hashId },
      data: { content, isModified },
    });
  };

  updateHistories = async (
    hashId: string,
    data: Prisma.ChatContentUncheckedUpdateInput
  ) => {
    await this.chatContent.update({
      where: { hashId },
      data: { histories: { set: [] } },
    });
    return await this.chatContent.update({
      where: { hashId },
      data,
      select: {
        hashId: true,
        model: { select: { hashId: true, name: true } },
        role: true,
        content: true,
        config: true,
        isModified: true,
      },
    });
  };

  deleteManyByHashIds = async (hashIds: string[], userHashId: string) => {
    const chatContents = await this.chatContent.findMany({
      where: {
        hashId: { in: hashIds },
        gpi: { userHashId },
        isDeployed: false,
      },
      select: { hashId: true, gpiHashId: true },
    });
    if (chatContents.length !== hashIds.length) {
      throw "Deletion is not possible.";
    }

    await this.chatContent.deleteMany({
      where: { hashId: { in: hashIds } },
    });

    return chatContents[0].gpiHashId;
  };

  getGpi = async (hashId: string, userHashId: string) => {
    const chatContent = await this.chatContent.findFirst({
      where: { hashId, isDeployed: false },
      select: {
        gpi: {
          select: { hashId: true, userHashId: true, systemMessage: true },
        },
      },
    });
    if (!chatContent || chatContent.gpi.userHashId !== userHashId) {
      throw "gpi is not available.";
    }

    const { gpi } = chatContent;
    return gpi;
  };
}
