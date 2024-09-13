import { Prisma } from "@prisma/client";
import { createEntity } from "../util/prisma";

export class SessionRepository {
  constructor(private session: Prisma.SessionDelegate) {}

  /**
   * Creates a new session for a given GPI hash ID.
   * @param gpiHashId - The hash ID of the GPI (General Product Information) associated with the session.
   * @returns The newly created session's hash ID.
   */
  public createSession = async (gpiHashId: string) => {
    return createEntity(
      this.session.create,
      { data: { gpiHashId }, select: { hashId: true } },
      32
    );
  };

  /**
   * Finds a session by its hash ID and checks if it is associated with the user or is public.
   * @param hashId - The session's unique hash ID.
   * @param userHashId - The user's hash ID (can be null if checking for public sessions).
   * @returns The session data including associated GPI and chat contents.
   * @throws {Error} If the session or GPI is not available or contains empty chat content.
   */
  public findSessionByHashId = async (
    hashId: string,
    userHashId: string | null
  ) => {
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
      throw new Error("Session is not available.");
    }
    const { gpi } = session;
    if (!gpi) {
      throw new Error("GPI is not available.");
    }
    if (gpi.chatContents.some((c) => c.content === "")) {
      throw new Error("There is empty content in chat.");
    }

    return { ...session, gpi };
  };

  /**
   * Retrieves all messages for a session by its hash ID.
   * @param hashId - The session's unique hash ID.
   * @param userHashId - The user's hash ID (can be null if checking for public sessions).
   * @returns An array of messages with roles and content.
   * @throws {Error} If the session is not available.
   */
  public getSessionMessages = async (
    hashId: string,
    userHashId: string | null
  ) => {
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
      throw new Error("Session is not available.");
    }

    return session.messages;
  };
}
