import { Prisma, Gpi } from "@prisma/client";
import {
  getDataWithHashId,
  getIdByHashId,
  getTypedContent,
} from "../util/prisma";

export class GpiRepository {
  constructor(private gpi: Prisma.GpiDelegate) {}

  /**
   * Finds multiple GPIs based on search criteria.
   * @param userHashId - The hash ID of the user.
   * @param keyword - The search keyword.
   * @param hashId - The last GPI hashId for pagination.
   * @returns An array of GPIs matching the criteria.
   */
  public async findGpis(
    userHashId: string,
    keyword: string,
    hashId: string | undefined | null
  ) {
    const id = await getIdByHashId(this.gpi.findFirst, hashId);
    const search = keyword.split(" ").join(" | ");
    const whereClause: Prisma.GpiWhereInput = {
      isDeployed: true,
      AND: [{ OR: [{ userHashId }, { isPublic: true }] }],
      ...(search && {
        AND: [
          {
            OR: [
              { description: { search } },
              { systemMessage: { search } },
              { chatContents: { some: { content: { search } } } },
            ],
          },
        ],
      }),
      ...(id > 0 && { id: { lt: id } }),
    };

    return this.gpi.findMany({
      where: whereClause,
      select: {
        hashId: true,
        userHashId: true,
        description: true,
        systemMessage: true,
        chatContents: {
          select: {
            hashId: true,
            role: true,
            content: true,
            config: true,
            model: { select: { hashId: true, name: true } },
            histories: {
              select: {
                provider: true,
                model: true,
                config: true,
                messages: true,
                content: true,
                response: true,
                price: true,
                inputTokens: true,
                outputTokens: true,
                createdAt: true,
              },
            },
            isModified: true,
          },
          where: { isDeployed: true },
          orderBy: { id: "asc" },
        },
        config: true,
        modelHashId: true,
        isPublic: true,
        isDeployed: true,
      },
      orderBy: { id: "desc" },
      take: 5,
    });
  }

  /**
   * Retrieves multiple GPI records associated with a user, optionally filtered by an update timestamp.
   * @param userHashId - The hash ID of the user.
   * @param updatedAt - Optional date to filter GPIs updated before this timestamp.
   * @returns An array of GPI records.
   */
  public async findGpisByUser(
    userHashId: string,
    updatedAt: Date | null = null
  ) {
    const whereClause: Prisma.GpiWhereInput = {
      userHashId,
      ...(updatedAt && { updatedAt: { lt: updatedAt } }),
    };

    return this.gpi.findMany({
      where: whereClause,
      select: {
        hashId: true,
        userHashId: true,
        description: true,
        systemMessage: true,
        chatContents: {
          select: {
            hashId: true,
            role: true,
            content: true,
            config: true,
            model: { select: { hashId: true, name: true } },
            histories: {
              select: {
                provider: true,
                model: true,
                config: true,
                messages: true,
                content: true,
                response: true,
                price: true,
                inputTokens: true,
                outputTokens: true,
                createdAt: true,
              },
            },
            isModified: true,
            isDeployed: true,
          },
          orderBy: { id: "asc" },
        },
        config: true,
        modelHashId: true,
        isPublic: true,
        isDeployed: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });
  }

  /**
   * Retrieves a single GPI by its hash ID, ensuring it belongs to the user or is public.
   * @param hashId - The hash ID of the GPI.
   * @param userHashId - The hash ID of the user (nullable).
   * @param isPublic - Whether to include public GPIs.
   * @returns The found GPI record.
   * @throws {Error} If the GPI is not found or contains empty chat content.
   */
  public async findGpiByHashId(
    hashId: string,
    userHashId: string | null,
    isPublic: boolean = false
  ) {
    if (!isPublic && !userHashId) {
      throw new Error("User hash ID is required for non-public GPIs.");
    }

    const orConditions: Prisma.GpiWhereInput[] = [{ userHashId }];
    if (isPublic) {
      orConditions.push({ isPublic: true });
    }

    const gpi = await this.gpi.findFirst({
      where: {
        hashId,
        OR: orConditions,
        model: { isAvailable: true },
      },
      select: {
        config: true,
        model: {
          select: {
            name: true,
            inputPricePerMillion: true,
            outputPricePerMillion: true,
            provider: { select: { name: true } },
            isFree: true,
            isLoginRequired: true,
          },
        },
        systemMessage: true,
        chatContents: {
          select: { role: true, content: true },
          orderBy: { id: "asc" },
          where: { isDeployed: true },
        },
      },
    });

    if (!gpi) {
      throw new Error(`GPI with hashId ${hashId} not found.`);
    }

    if (gpi.chatContents.some((content) => content.content.trim() === "")) {
      throw new Error("There is empty content in chat.");
    }

    return gpi;
  }

  /**
   * Finds a GPI by hashId and userHashId.
   * @param hashId - The hash ID of the GPI.
   * @param userHashId - The hash ID of the user.
   * @returns The found GPI or null if not found.
   */
  public async findGpiByHashIdAndUser(hashId: string, userHashId: string) {
    const gpi = await this.gpi.findFirst({
      where: { hashId, userHashId },
      select: {
        hashId: true,
        userHashId: true,
        description: true,
        systemMessage: true,
        chatContents: {
          select: {
            hashId: true,
            role: true,
            content: true,
            config: true,
            model: { select: { hashId: true, name: true } },
            histories: {
              select: {
                provider: true,
                model: true,
                config: true,
                messages: true,
                content: true,
                response: true,
                price: true,
                inputTokens: true,
                outputTokens: true,
                createdAt: true,
              },
            },
            isModified: true,
            isDeployed: true,
          },
          orderBy: { id: "asc" },
        },
        config: true,
        modelHashId: true,
        isPublic: true,
        isDeployed: true,
      },
    });

    if (!gpi) {
      throw new Error(`GPI with hashId ${hashId} not found.`);
    }

    return gpi;
  }

  /**
   * Finds a GPI by hashId, allowing access if it is public or owned by the user.
   * @param hashId - The hash ID of the GPI.
   * @param userHashId - The hash ID of the user.
   * @returns The found GPI or null if not found.
   */
  public async findGpiByHashIdAndUserOrPublic(
    hashId: string,
    userHashId: string
  ) {
    const gpi = await this.gpi.findFirst({
      where: {
        hashId,
        isDeployed: true,
        OR: [{ userHashId }, { isPublic: true }],
      },
      select: {
        hashId: true,
        userHashId: true,
        description: true,
        systemMessage: true,
        chatContents: {
          select: {
            hashId: true,
            role: true,
            content: true,
            config: true,
            model: { select: { hashId: true, name: true } },
            histories: {
              select: {
                provider: true,
                model: true,
                config: true,
                messages: true,
                content: true,
                response: true,
                price: true,
                inputTokens: true,
                outputTokens: true,
                createdAt: true,
              },
            },
            isModified: true,
          },
          where: { isDeployed: true },
          orderBy: { id: "asc" },
        },
        config: true,
        modelHashId: true,
        isPublic: true,
        isDeployed: true,
      },
    });

    if (!gpi) {
      throw new Error(`GPI with hashId ${hashId} not found.`);
    }

    return gpi;
  }

  /**
   * Updates specific fields of a GPI, ensuring it belongs to the user or is public.
   * @param hashId - The hash ID of the GPI to update.
   * @param userHashId - The hash ID of the user (nullable).
   * @param data - The data to update.
   * @returns The updated GPI record.
   * @throws {Error} If the update operation fails.
   */
  public async updateGpiFields(
    hashId: string,
    userHashId: string | null,
    data: Prisma.GpiUncheckedUpdateInput
  ): Promise<
    Pick<
      Gpi,
      | "hashId"
      | "description"
      | "systemMessage"
      | "config"
      | "modelHashId"
      | "isPublic"
    >
  > {
    const orConditions: Prisma.GpiWhereInput[] = [
      { userHashId },
      { isPublic: true },
    ];

    const updatedGpi = await this.gpi.update({
      where: {
        hashId,
        OR: orConditions,
      },
      data,
      select: {
        hashId: true,
        description: true,
        systemMessage: true,
        config: true,
        modelHashId: true,
        isPublic: true,
      },
    });

    return updatedGpi;
  }

  /**
   * Updates a GPI's deployment status and other data, ensuring proper deployment transitions.
   * @param hashId - The hash ID of the GPI to update.
   * @param userHashId - The hash ID of the user (nullable).
   * @param isDeploying - Flag indicating whether the GPI is being deployed.
   * @param data - The data to update.
   * @returns The updated GPI record.
   * @throws {Error} If deployment conditions are not met or the GPI is not found.
   */
  public async updateGpiWithDeploymentStatus(
    hashId: string,
    userHashId: string | null,
    isDeploying: boolean,
    data: Prisma.GpiUncheckedUpdateInput
  ) {
    const gpi = await this.gpi.findFirst({
      where: { hashId, userHashId },
      select: {
        isDeployed: true,
        chatContents: {
          select: { role: true, content: true, config: true },
          orderBy: { id: "asc" },
          where: { isDeployed: false },
        },
      },
    });

    if (!gpi) {
      throw new Error(`GPI with hashId ${hashId} not found.`);
    }

    if (gpi.chatContents.some((content) => content.content.trim() === "")) {
      throw new Error("There is empty content in chat.");
    }

    if (!isDeploying && !gpi.isDeployed) {
      throw new Error("GPI is not deployed yet.");
    }

    if (isDeploying && gpi.isDeployed) {
      throw new Error("GPI is already deployed.");
    }

    const updatedGpi = await this.gpi.update({
      where: { hashId, userHashId },
      data: { ...data, updatedAt: new Date() },
      select: {
        isDeployed: true,
        chatContents: {
          select: {
            role: true,
            content: true,
            config: true,
            modelHashId: true,
          },
          orderBy: { id: "asc" },
          where: { isDeployed: false },
        },
      },
    });

    return updatedGpi;
  }

  /**
   * Checks if a GPI is accessible to a user.
   * @param hashId - The hash ID of the GPI.
   * @param userHashId - The hash ID of the user.
   * @returns True if accessible.
   * @throws {Error} If the GPI is not accessible.
   */
  public async checkGpiAccessibility(
    hashId: string,
    userHashId: string
  ): Promise<boolean> {
    const gpi = await this.gpi.findFirst({
      where: { hashId, userHashId },
      select: { hashId: true },
    });

    if (!gpi) {
      throw new Error(`GPI with hashId ${hashId} not found or inaccessible.`);
    }

    return true;
  }

  /**
   * Creates a new GPI along with its associated chat contents.
   * Retries up to 5 times in case of hash ID collisions.
   * @param gpiData - The data for the GPI excluding the hash ID.
   * @param chatContents - An array of chat content data.
   * @returns The created GPI's hash ID.
   * @throws {Error} If creation fails after maximum retries.
   */
  public async createGpiWithChatContents(
    gpiData: Omit<Prisma.GpiUncheckedCreateInput, "hashId">,
    chatContents: (Omit<
      Prisma.ChatContentUncheckedCreateInput,
      "hashId" | "config" | "gpiHashId"
    > & {
      config: Prisma.InputJsonValue;
    })[]
  ): Promise<Pick<Gpi, "hashId">> {
    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const dataWithHashId = getDataWithHashId(
          {
            ...gpiData,
            chatContents: {
              createMany: {
                data: chatContents.map((chat) =>
                  getDataWithHashId(getTypedContent(chat))
                ),
              },
            },
          },
          32
        );

        const createdGpi = await this.gpi.create({
          data: dataWithHashId,
          select: { hashId: true },
        });

        return createdGpi;
      } catch (error) {
        if (this.isUniqueConstraintError(error)) {
          attempt++;
          console.warn(
            `Hash ID collision detected. Retry attempt ${attempt}/${maxRetries}.`
          );
        } else {
          console.error("Error creating GPI:", error);
          throw new Error("Failed to create GPI due to an unexpected error.");
        }
      }
    }

    throw new Error("Too many hash ID collisions. Failed to create GPI.");
  }

  /**
   * Creates a copy of an existing GPI for a user.
   * @param originalHashId - The hash ID of the GPI to copy.
   * @param userHashId - The hash ID of the user creating the copy.
   * @returns The newly created GPI's hash ID.
   * @throws {Error} If the original GPI is not found or inaccessible.
   */
  public async createGpiCopy(
    hashId: string,
    userHashId: string
  ): Promise<Pick<Gpi, "hashId">> {
    const originalGpi = await this.gpi.findFirst({
      where: { hashId, OR: [{ userHashId }, { isPublic: true }] },
      select: {
        config: true,
        userHashId: true,
        description: true,
        modelHashId: true,
        isPublic: true,
        systemMessage: true,
        chatContents: {
          select: {
            role: true,
            content: true,
            config: true,
            modelHashId: true,
          },
          where: { isDeployed: true },
        },
      },
    });

    if (!originalGpi) {
      throw new Error(`GPI with hashId ${hashId} not found or inaccessible.`);
    }

    const { chatContents, ...gpiData } = originalGpi;

    const newChatContents = chatContents.map((chat) => ({
      ...chat,
      config: chat.config as Prisma.InputJsonValue,
    }));

    return this.createGpiWithChatContents(
      { ...gpiData, config: gpiData.config as Prisma.InputJsonValue },
      newChatContents
    );
  }

  /**
   * Updates the 'updatedAt' timestamp of a GPI.
   * @param hashId - The hash ID of the GPI.
   * @returns The updated GPI record.
   */
  public async updateGpiTimestamp(hashId: string): Promise<Gpi> {
    return this.gpi.update({
      where: { hashId },
      data: { updatedAt: new Date() },
    });
  }

  /**
   * Deletes a GPI, ensuring it is accessible to the user.
   * @param hashId - The hash ID of the GPI to delete.
   * @param userHashId - The hash ID of the user requesting deletion.
   * @throws {Error} If the GPI is not accessible or deletion fails.
   */
  public async deleteGpi(hashId: string, userHashId: string): Promise<void> {
    await this.checkGpiAccessibility(hashId, userHashId);
    await this.gpi.delete({ where: { hashId } });
  }

  /**
   * Determines if an error is due to a unique constraint violation.
   * @param error - The error to check.
   * @returns True if the error is a unique constraint violation, else false.
   */
  private isUniqueConstraintError(error: any): boolean {
    // Adjust this method based on how Prisma exposes unique constraint errors
    return error?.code === "P2002";
  }
}
