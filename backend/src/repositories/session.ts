import { Prisma } from "@prisma/client";
import { createEntity } from "../util/prisma";

export class SessionRepository {
  constructor(private session: Prisma.SessionDelegate) {}

  create = async (gpiHashId: string) => {
    return createEntity(
      this.session.create,
      { data: { gpiHashId }, select: { hashId: true } },
      32
    );
  };

  findByHashId = async (hashId: string, userHashId: string | null) => {
    const session = await this.session.findFirst({
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

    return { ...session, gpi };
  };

  getMessages = async (hashId: string, userHashId: string | null) => {
    const session = await this.session.findFirst({
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
