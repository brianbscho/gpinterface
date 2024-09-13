import { ChatContent } from "gpinterface-shared/type/chat-content";
import { compareObjects } from "../util";

import { GpiRepository } from "../repositories/gpi";
import { FastifyInstance } from "fastify";
import { GpiDeploySchema, GpiUpdateSchema } from "gpinterface-shared/type/gpi";
import { Static } from "@sinclair/typebox";
import { ChatContentRepository } from "../repositories/chat-content";
import {
  getIdByHashId,
  getTypedContents,
  getUpdatedAtByHashId,
} from "../util/prisma";

export class GpiService {
  private gpiRepository: GpiRepository;
  private chatContentRepository: ChatContentRepository;

  constructor(private fastify: FastifyInstance) {
    this.gpiRepository = new GpiRepository(fastify.prisma.gpi);
    this.chatContentRepository = new ChatContentRepository(
      fastify.prisma.chatContent
    );
  }

  getByHashIdUserHashId = async (hashId: string, userHashId: string) => {
    const gpi = await this.gpiRepository.findByHashIdAndUser(
      hashId,
      userHashId
    );

    const { config, chatContents, ...rest } = gpi;
    return {
      ...rest,
      isEditing: getIsEditing(chatContents),
      config: config as any,
      chatContents: [],
      getTypedContents: chatContents.filter((c) => !c.isDeployed),
    };
  };

  getManyByUserHashId = async (
    lastHashId: string | undefined,
    userHashId: string
  ) => {
    const updatedAt = await getUpdatedAtByHashId(
      this.fastify.prisma.gpi.findFirst,
      lastHashId
    );
    const gpis = await this.gpiRepository.findManyByUserHashId(
      userHashId,
      updatedAt
    );

    return gpis.map((gpi) => {
      const { chatContents, config, ...rest } = gpi;
      return {
        ...rest,
        isEditing: getIsEditing(chatContents),
        config: config as any,
        chatContents: getTypedContents(
          chatContents.filter((c) => gpi.isDeployed === c.isDeployed)
        ),
      };
    });
  };

  getPrivateGpi = async (hashId: string, userHashId: string) => {
    const gpi = await this.gpiRepository.findByHashIdAndUser(
      hashId,
      userHashId
    );

    if (!gpi) {
      throw new Error("The GPI is not available.");
    }

    const { config, chatContents, ...rest } = gpi;

    // Check for empty chat content
    if (chatContents.some((c) => c.content.trim() === "")) {
      throw new Error("There is empty content in chat.");
    }

    return {
      ...rest,
      isEditing: getIsEditing(chatContents),
      config: config as any, // Adjust the type as necessary
      chatContents: getTypedContents(chatContents.filter((c) => !c.isDeployed)),
    };
  };

  /**
   * Retrieves and processes a public GPI for the response.
   * @param hashId - The hash ID of the GPI.
   * @param userHashId - The hash ID of the user.
   * @returns The processed GPI data suitable for the response.
   * @throws {BadRequestError} If the GPI is not found or contains empty chat content.
   */
  public async getPublicGpi(hashId: string, userHashId: string) {
    const gpi = await this.gpiRepository.findByHashIdAndUserForPublic(
      hashId,
      userHashId
    );

    if (!gpi) {
      throw new Error("The GPI is not available.");
    }

    const { config, chatContents, ...rest } = gpi;

    // Check for empty chat content
    if (chatContents.some((c) => c.content.trim() === "")) {
      throw new Error("There is empty content in chat.");
    }

    return {
      ...rest,
      isEditing: false, // As per the controller's logic
      config: config as any, // Adjust the type as necessary
      chatContents: getTypedContents(chatContents),
    };
  }

  /**
   * Retrieves and processes a list of GPIs based on search criteria.
   * @param userHashId - The hash ID of the user.
   * @param keyword - The search keyword.
   * @param lastHashId - The last hash ID for pagination.
   * @returns An array of processed GPIs suitable for the response.
   */
  public async getGpis(
    userHashId: string,
    keyword: string,
    lastHashId: string | undefined | null
  ) {
    const id = await getIdByHashId(
      this.fastify.prisma.gpi.findFirst,
      lastHashId
    );

    const gpis = await this.gpiRepository.findMany(
      userHashId,
      keyword,
      lastHashId
    );

    return gpis.map((gpi) => {
      const { config, chatContents, ...rest } = gpi;
      return {
        ...rest,
        isEditing: false, // Assuming no editing in list view
        config: config as any,
        chatContents: getTypedContents(chatContents),
      };
    });
  }

  create = async (userHashId: string, modelHashId: string, config: any) => {
    return this.gpiRepository.create(
      {
        userHashId,
        modelHashId,
        config,
        description: "",
        isPublic: false,
        systemMessage: "",
      },
      []
    );
  };

  patch = async (
    hashId: string,
    userHashId: string,
    data: Static<typeof GpiUpdateSchema>
  ) => {
    await this.gpiRepository.checkIsAccessible(hashId, userHashId);

    const { description, systemMessage, config, modelHashId, isPublic } = data;
    const isIsPublicBoolean = typeof isPublic === "boolean";
    const updatedGpi = await this.gpiRepository.updateFields(
      hashId,
      userHashId,
      {
        ...(!!description && { description }),
        ...(!!systemMessage && { systemMessage }),
        ...(!!config && { config }),
        ...(!!modelHashId && { modelHashId }),
        ...(isIsPublicBoolean && { isPublic }),
        updatedAt: new Date(),
      }
    );

    return { ...updatedGpi, config: updatedGpi.config as any };
  };

  put = async (
    hashId: string,
    userHashId: string,
    data: Static<typeof GpiDeploySchema>
  ) => {
    const gpi = await this.gpiRepository.update(hashId, userHashId, false, {
      ...data,
      updatedAt: new Date(),
    });

    await this.chatContentRepository.markAsDeployed(hashId);
    await this.chatContentRepository.createMany(
      gpi.chatContents.map((c) => ({
        ...c,
        config: c.config as any,
        gpiHashId: hashId,
        isDeployed: false,
      }))
    );

    return { hashId };
  };

  deploy = async (
    hashId: string,
    userHashId: string,
    data: Static<typeof GpiDeploySchema>
  ) => {
    const gpi = await this.gpiRepository.update(hashId, userHashId, true, {
      ...data,
      isDeployed: true,
    });

    await this.chatContentRepository.markAsDeployed(hashId);
    await this.chatContentRepository.createMany(
      gpi.chatContents.map((c) => ({
        ...c,
        config: c.config as any,
        gpiHashId: hashId,
        isDeployed: false,
      }))
    );

    return { hashId };
  };

  copy = async (hashId: string, userHashId: string) => {
    return this.gpiRepository.createCopy(hashId, userHashId);
  };

  delete = async (hashId: string, userHashId: string) => {
    await this.gpiRepository.delete(hashId, userHashId);
    return { hashIds: [hashId] };
  };
}

export function getIsEditing(
  chatContents: (Omit<ChatContent, "config"> & {
    isDeployed: boolean;
    config: any;
    histories: any;
  })[]
) {
  const deployedContents = [...chatContents].filter((c) => c.isDeployed);
  const editingContents = [...chatContents].filter((c) => !c.isDeployed);

  const i =
    deployedContents.length !== editingContents.length ||
    !deployedContents.reduce((acc, curr, index) => {
      const editingContent = editingContents[index];
      return (
        acc &&
        compareObjects(curr.config, editingContent.config) &&
        compareObjects(curr.model, editingContent.model) &&
        compareObjects(
          { role: curr.role, content: curr.content },
          { role: editingContent.role, content: editingContent.content }
        )
      );
    }, true);
  return i;
}
