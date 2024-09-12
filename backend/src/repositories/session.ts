import { PrismaClient } from "@prisma/client";
import { createEntity } from "../util/prisma";
import { UserRepository } from "./user";

export class SessionRepository {
  private userRepository: UserRepository;
  constructor(private prisma: PrismaClient) {
    this.userRepository = new UserRepository(prisma);
  }

  create = async (gpiHashId: string) => {
    return createEntity(
      this.prisma.session.create,
      { data: { gpiHashId }, select: { hashId: true } },
      32
    );
  };

  find = async (hashId: string, userHashId: string | null) => {
    const session = await this.prisma.session.findFirst({
      where: {
        hashId,
        gpi: {
          OR: [{ userHashId }, { isPublic: true }],
          model: { isAvailable: true },
        },
      },
      select: {
        gpi: {
          select: {
            hashId: true,
            systemMessage: true,
            chatContents: {
              select: { role: true, content: true },
              orderBy: { id: "asc" as const },
              where: { isDeployed: true },
            },
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
          },
        },
        messages: {
          select: { role: true, content: true },
          orderBy: { id: "asc" as const },
        },
      },
    });

    if (!session) {
      throw "session is not available.";
    }
    const { gpi } = session;
    if (!gpi) {
      throw "gpi is not available.";
    }
    if (gpi.chatContents.some((c) => c.content === "")) {
      throw "There is empty content in chat.";
    }
    if (gpi.model.isLoginRequired || !gpi.model.isFree) {
      if (!userHashId) {
        throw "Please login first.";
      }
      const balance = await this.userRepository.getBalance(userHashId);
      if (balance <= 0)
        throw "You don't have enough balance. Please deposit first.";
    }

    return { ...session, gpi };
  };

  getMessages = async (hashId: string, userHashId: string | null) => {
    const session = await this.prisma.session.findFirst({
      where: { hashId, gpi: { OR: [{ userHashId }, { isPublic: true }] } },
      select: {
        messages: {
          select: { role: true, content: true },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!session) {
      throw "session is not available.";
    }

    return session.messages;
  };
}
