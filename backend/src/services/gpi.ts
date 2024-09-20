import { FastifyInstance } from "fastify";
import { Static } from "@sinclair/typebox";

import { ChatContent } from "gpinterface-shared/type/chat-content";
import { GpiDeploySchema, GpiUpdateSchema } from "gpinterface-shared/type/gpi";

import { GpiRepository } from "../repositories/gpi";
import { ChatContentRepository } from "../repositories/chat-content";

import { isEqual } from "../util";
import {
  getIdByHashId,
  getTypedContents,
  getUpdatedAtByHashId,
} from "../util/prisma";

/**
 * Service class responsible for handling GPI-related business logic.
 */
export class GpiService {
  private gpiRepository: GpiRepository;
  private chatContentRepository: ChatContentRepository;

  /**
   * Initializes the GpiService with necessary repositories.
   * @param fastify - The FastifyInstance for accessing Prisma.
   */
  constructor(private fastify: FastifyInstance) {
    this.gpiRepository = new GpiRepository(fastify.prisma.gpi);
    this.chatContentRepository = new ChatContentRepository(
      fastify.prisma.chatContent
    );
  }

  /**
   * Retrieves a GPI by its hash ID and user hash ID.
   * @param hashId - The hash ID of the GPI.
   * @param userHashId - The hash ID of the user.
   * @returns The GPI data with additional processing.
   * @throws {Error} If the GPI is not found or inaccessible.
   */
  getByHashIdUserHashId = async (hashId: string, userHashId: string) => {
    const gpi = await this.gpiRepository.findGpiByHashIdAndUser(
      hashId,
      userHashId
    );

    const { config, chatContents, ...rest } = gpi;
    return {
      ...rest,
      isEditing: this.getIsEditing(chatContents),
      config: config as any,
      chatContents: [],
      getTypedContents: chatContents.filter((c) => !c.isDeployed),
    };
  };

  /**
   * Retrieves multiple GPIs for a user based on pagination.
   * @param lastHashId - The last hash ID for pagination.
   * @param userHashId - The hash ID of the user.
   * @returns An array of GPIs with additional processing.
   */
  getManyByUserHashId = async (
    lastHashId: string | undefined,
    userHashId: string
  ) => {
    const updatedAt = await getUpdatedAtByHashId(
      this.fastify.prisma.gpi.findFirst,
      lastHashId
    );
    const gpis = await this.gpiRepository.findGpisByUser(userHashId, updatedAt);

    return gpis.map((gpi) => {
      const { config, chatContents, ...rest } = gpi;
      return {
        ...rest,
        isEditing: this.getIsEditing(chatContents),
        config: config as any,
        chatContents: getTypedContents(
          chatContents.filter((c) => gpi.isDeployed === c.isDeployed)
        ),
      };
    });
  };

  /**
   * Retrieves a private GPI for a user.
   * @param hashId - The hash ID of the GPI.
   * @param userHashId - The hash ID of the user.
   * @returns The private GPI data with additional processing.
   * @throws {Error} If the GPI is not available or contains empty chat content.
   */
  getPrivateGpi = async (hashId: string, userHashId: string) => {
    const gpi = await this.gpiRepository.findGpiByHashIdAndUser(
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
      isEditing: this.getIsEditing(chatContents),
      config: config as any,
      chatContents: getTypedContents(chatContents.filter((c) => !c.isDeployed)),
    };
  };

  /**
   * Retrieves and processes a public GPI for the response.
   * @param hashId - The hash ID of the GPI.
   * @param userHashId - The hash ID of the user.
   * @returns The processed GPI data suitable for the response.
   * @throws {Error} If the GPI is not found or contains empty chat content.
   */
  public async getPublicGpi(hashId: string, userHashId: string) {
    const gpi = await this.gpiRepository.findGpiByHashIdAndUserOrPublic(
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
      config: config as any,
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

    const gpis = await this.gpiRepository.findGpis(
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

  /**
   * Creates a new GPI.
   * @param userHashId - The hash ID of the user.
   * @param modelHashId - The hash ID of the model.
   * @param config - The configuration for the GPI.
   * @returns The created GPI object.
   */
  create = async (userHashId: string, modelHashId: string, config: any) => {
    return this.gpiRepository.createGpiWithChatContents(
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

  /**
   * Updates fields of an existing GPI.
   * @param hashId - The hash ID of the GPI to update.
   * @param userHashId - The hash ID of the user.
   * @param data - The data to update, conforming to GpiUpdateSchema.
   * @returns The updated GPI object.
   */
  patch = async (
    hashId: string,
    userHashId: string,
    data: Static<typeof GpiUpdateSchema>
  ) => {
    await this.gpiRepository.checkGpiAccessibility(hashId, userHashId);

    const { description, systemMessage, config, modelHashId, isPublic } = data;
    const updatedGpi = await this.gpiRepository.updateGpiFields(
      hashId,
      userHashId,
      {
        ...(description !== undefined && { description }),
        ...(systemMessage !== undefined && { systemMessage }),
        ...(config !== undefined && { config }),
        ...(modelHashId !== undefined && { modelHashId }),
        ...(isPublic !== undefined && { isPublic }),
        updatedAt: new Date(),
      }
    );

    return { ...updatedGpi, config: updatedGpi.config as any };
  };

  /**
   * Deploys a GPI.
   * @param hashId - The hash ID of the GPI to deploy.
   * @param userHashId - The hash ID of the user.
   * @param data - The data required for deployment, conforming to GpiDeploySchema.
   * @returns An object containing the hash ID of the deployed GPI.
   */
  put = async (
    hashId: string,
    userHashId: string,
    data: Static<typeof GpiDeploySchema>
  ): Promise<{ hashId: string }> => {
    const gpi = await this.gpiRepository.updateGpiWithDeploymentStatus(
      hashId,
      userHashId,
      false,
      { ...data, updatedAt: new Date() }
    );

    await this.chatContentRepository.markChatContentsAsDeployed(hashId);
    await this.chatContentRepository.createChatContents(
      gpi.chatContents.map((c) => ({
        ...c,
        config: c.config as any,
        gpiHashId: hashId,
        isDeployed: false,
      }))
    );

    return { hashId };
  };

  /**
   * Deploys a GPI (similar to the put method).
   * @param hashId - The hash ID of the GPI to deploy.
   * @param userHashId - The hash ID of the user.
   * @param data - The data required for deployment, conforming to GpiDeploySchema.
   * @returns An object containing the hash ID of the deployed GPI.
   */
  deploy = async (
    hashId: string,
    userHashId: string,
    data: Static<typeof GpiDeploySchema>
  ): Promise<{ hashId: string }> => {
    const gpi = await this.gpiRepository.updateGpiWithDeploymentStatus(
      hashId,
      userHashId,
      true,
      { ...data, isDeployed: true }
    );

    await this.chatContentRepository.markChatContentsAsDeployed(hashId);
    await this.chatContentRepository.createChatContents(
      gpi.chatContents.map((c) => ({
        ...c,
        config: c.config as any,
        gpiHashId: hashId,
        isDeployed: false,
      }))
    );

    return { hashId };
  };

  /**
   * Creates a copy of an existing GPI.
   * @param hashId - The hash ID of the GPI to copy.
   * @param userHashId - The hash ID of the user.
   * @returns The copied GPI object.
   */
  copy = async (hashId: string, userHashId: string) => {
    return this.gpiRepository.createGpiCopy(hashId, userHashId);
  };

  /**
   * Deletes a GPI.
   * @param hashId - The hash ID of the GPI to delete.
   * @param userHashId - The hash ID of the user.
   * @returns An object containing the hash IDs of the deleted GPIs.
   */
  delete = async (
    hashId: string,
    userHashId: string
  ): Promise<{ hashIds: string[] }> => {
    await this.gpiRepository.deleteGpi(hashId, userHashId);
    return { hashIds: [hashId] };
  };

  /**
   * Determines if a GPI is being edited based on its chat contents.
   * @param chatContents - An array of chat content objects.
   * @returns A boolean indicating if the GPI is being edited.
   */
  getIsEditing = (
    chatContents: (Omit<ChatContent, "config"> & {
      isDeployed: boolean;
      config: any;
      histories: any;
    })[]
  ): boolean => {
    const deployedContents = chatContents.filter((c) => c.isDeployed);
    const editingContents = chatContents.filter((c) => !c.isDeployed);

    const isDifferentLength =
      deployedContents.length !== editingContents.length;
    return (
      isDifferentLength ||
      !deployedContents.reduce((acc, curr, index) => {
        const editingContent = editingContents[index];
        return (
          acc &&
          isEqual(curr.config, editingContent.config) &&
          isEqual(curr.model, editingContent.model) &&
          isEqual(
            { role: curr.role, content: curr.content },
            { role: editingContent.role, content: editingContent.content }
          )
        );
      }, true)
    );
  };
}
