import { Prisma, ChatContent, Gpi } from "@prisma/client";
import { getDataWithHashId } from "../util/prisma";

export class ChatContentRepository {
  constructor(private chatContent: Prisma.ChatContentDelegate) {}

  /**
   * Finds chat content by its hash ID and associated user hash ID.
   * @param hashId - The hash ID of the chat content.
   * @param userHashId - The hash ID of the user.
   * @returns The found chat content.
   * @throws {Error} If content is not available.
   */
  public async findByHashId(
    hashId: string,
    userHashId: string
  ): Promise<
    Pick<ChatContent, "hashId" | "gpiHashId" | "role" | "modelHashId">
  > {
    const chatContent = await this.chatContent.findFirst({
      where: { hashId, gpi: { userHashId }, isDeployed: false },
      select: { hashId: true, gpiHashId: true, role: true, modelHashId: true },
    });

    if (!chatContent) {
      throw new Error("Content is not available.");
    }

    return chatContent;
  }

  /**
   * Retrieves messages associated with a GPI hash ID up to a certain ID.
   * @param gpiHashId - The GPI hash ID.
   * @param lastId - The ID to retrieve messages less than this value.
   * @returns An array of messages.
   * @throws {Error} If any message content is empty.
   */
  public async getMessages(
    gpiHashId: string,
    lastId: number
  ): Promise<Pick<ChatContent, "role" | "content">[]> {
    const messages = await this.chatContent.findMany({
      where: { gpiHashId, isDeployed: false, id: { lt: lastId } },
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
   * @param content - The new content.
   * @param isModified - Whether the content has been modified.
   * @returns The updated chat content.
   */
  public async updateContent(
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
   * Updates the histories of a chat content entry.
   * @param hashId - The hash ID of the chat content to update.
   * @param data - The update data.
   * @returns The updated chat content with selected fields.
   */
  public async updateHistories(
    hashId: string,
    data: Prisma.ChatContentUncheckedUpdateInput
  ) {
    // Clear existing histories
    await this.chatContent.update({
      where: { hashId },
      data: { histories: { set: [] } },
    });

    // Update with new data
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
  public async markAsDeployed(gpiHashId: string): Promise<void> {
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
   * @param data - An array of chat content data without hash IDs.
   * @returns The result of the createMany operation.
   */
  public async createMany(
    data: Omit<Prisma.ChatContentCreateManyInput, "hashId">[]
  ): Promise<Prisma.BatchPayload> {
    const dataWithHashIds = data.map(getDataWithHashId);
    return this.chatContent.createMany({
      data: dataWithHashIds,
    });
  }

  /**
   * Creates multiple chat content entries and returns the created records.
   * @param data - An array of chat content data without hash IDs.
   * @returns An array of created chat contents with selected fields.
   */
  public async createManyAndReturn(
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
  public async deleteManyByHashIds(
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
   * @returns The associated GPI.
   * @throws {Error} If GPI is not available.
   */
  public async getGpi(
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
