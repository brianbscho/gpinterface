import { Prisma, ChatContent, Gpi } from "@prisma/client";
import { getDataWithHashId, getIdByHashId } from "../util/prisma";

// Shared schema for selecting chat content fields
const chatContentSelection = {
  hashId: true,
  gpiHashId: true,
  role: true,
  modelHashId: true,
};

export class ChatContentRepository {
  constructor(private chatContent: Prisma.ChatContentDelegate) {}

  /**
   * Finds chat content by its hash ID and associated user hash ID.
   * @param hashId - The hash ID of the chat content.
   * @param userHashId - The hash ID of the user.
   * @returns The found chat content with selected fields.
   * @throws {Error} If content is not available.
   */
  public async findChatContentByHashId(
    hashId: string,
    userHashId: string
  ): Promise<
    Pick<ChatContent, "hashId" | "gpiHashId" | "role" | "modelHashId">
  > {
    const chatContent = await this.chatContent.findFirst({
      where: { hashId, gpi: { userHashId }, isDeployed: false },
      select: chatContentSelection,
    });

    if (!chatContent) {
      throw new Error("Content is not available.");
    }

    return chatContent;
  }

  /**
   * Retrieves chat messages associated with a GPI hash ID up to a certain ID.
   * @param gpiHashId - The GPI hash ID.
   * @param hashId - The hash ID of the chat content to use as a boundary for retrieving messages.
   * @returns An array of messages.
   * @throws {Error} If any message content is empty.
   */
  public async getMessages(
    gpiHashId: string,
    hashId: string
  ): Promise<Pick<ChatContent, "role" | "content">[]> {
    const id = await getIdByHashId(this.chatContent.findFirst, hashId);
    if (id < 1) {
      throw new Error("Content is not available.");
    }

    const messages = await this.chatContent.findMany({
      where: { gpiHashId, isDeployed: false, id: { lt: id } },
      select: { role: true, content: true },
      orderBy: { id: "asc" },
    });

    if (messages.some((message) => message.content.trim() === "")) {
      throw new Error("There is empty content in chat.");
    }

    return messages;
  }

  /**
   * Updates the content and modification status of a chat content entry.
   * @param hashId - The hash ID of the chat content to update.
   * @param content - The new content for the chat content.
   * @param isModified - Whether the content has been modified.
   * @returns The updated chat content.
   */
  public async updateChatContent(
    hashId: string,
    content: string,
    isModified: boolean
  ): Promise<ChatContent> {
    return this.chatContent.update({
      where: { hashId },
      data: { content, isModified },
    });
  }

  /**
   * Clears existing histories and updates them with new data for a chat content entry.
   * @param hashId - The hash ID of the chat content to update.
   * @param data - The update data for the histories.
   * @returns The updated chat content with selected fields.
   */
  public async clearAndUpdateHistories(
    hashId: string,
    data: Prisma.ChatContentUncheckedUpdateInput
  ) {
    // Clear existing histories
    await this.chatContent.update({
      where: { hashId },
      data: { histories: { set: [] } },
    });

    // Update with new data and return updated content
    return this.chatContent.update({
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
  }

  /**
   * Marks all chat contents associated with a GPI hash ID as deployed.
   * @param gpiHashId - The GPI hash ID.
   */
  public async markChatContentsAsDeployed(gpiHashId: string): Promise<void> {
    await this.chatContent.deleteMany({
      where: { gpiHashId, isDeployed: true },
    });

    await this.chatContent.updateMany({
      where: { gpiHashId },
      data: { isDeployed: true },
    });
  }

  /**
   * Creates multiple chat content entries.
   * @param data - An array of chat content data excluding hash IDs.
   * @returns The result of the createMany operation.
   */
  public async createChatContents(
    data: Omit<Prisma.ChatContentCreateManyInput, "hashId">[]
  ): Promise<Prisma.BatchPayload> {
    const dataWithHashIds = data.map(getDataWithHashId);
    return this.chatContent.createMany({
      data: dataWithHashIds,
    });
  }

  /**
   * Creates multiple chat content entries and returns the created records.
   * @param data - An array of chat content data excluding hash IDs.
   * @returns An array of created chat contents with selected fields.
   */
  public async createChatContentsAndReturn(
    data: Omit<Prisma.ChatContentCreateManyInput, "hashId">[]
  ) {
    const dataWithHashIds = data.map(getDataWithHashId);
    return this.chatContent.createManyAndReturn({
      data: dataWithHashIds,
      select: {
        hashId: true,
        model: true,
        role: true,
        content: true,
        config: true,
        isModified: true,
      },
    });
  }

  /**
   * Deletes multiple chat content entries by their hash IDs.
   * @param hashIds - An array of hash IDs to delete.
   * @param userHashId - The user's hash ID.
   * @returns The GPI hash ID associated with the deleted contents.
   * @throws {Error} If deletion is not possible.
   */
  public async deleteChatContentsByHashIds(
    hashIds: string[],
    userHashId: string
  ): Promise<string> {
    const chatContents = await this.chatContent.findMany({
      where: {
        hashId: { in: hashIds },
        gpi: { userHashId },
        isDeployed: false,
      },
      select: { hashId: true, gpiHashId: true },
    });

    if (chatContents.length !== hashIds.length) {
      throw new Error("Deletion is not possible.");
    }

    await this.chatContent.deleteMany({
      where: { hashId: { in: hashIds } },
    });

    return chatContents[0].gpiHashId;
  }

  /**
   * Retrieves the GPI associated with a given chat content hash ID and user hash ID.
   * @param hashId - The hash ID of the chat content.
   * @param userHashId - The user's hash ID.
   * @returns The associated GPI with selected fields.
   * @throws {Error} If GPI is not available.
   */
  public async getGpiByHashId(
    hashId: string,
    userHashId: string
  ): Promise<Pick<Gpi, "hashId" | "userHashId" | "systemMessage">> {
    const chatContent = await this.chatContent.findFirst({
      where: { hashId, isDeployed: false },
      select: {
        gpi: {
          select: { hashId: true, userHashId: true, systemMessage: true },
        },
      },
    });

    if (!chatContent || chatContent.gpi.userHashId !== userHashId) {
      throw new Error("GPI is not available.");
    }

    return chatContent.gpi;
  }
}
