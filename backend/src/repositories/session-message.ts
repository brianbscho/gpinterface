import { Prisma } from "@prisma/client";
import { createManyEntities } from "../util/prisma";

export class SessionMessageRepository {
  constructor(private sessionMessage: Prisma.SessionMessageDelegate) {}

  /**
   * Creates session messages for both the user and the assistant in a single operation.
   * @param sessionHashId - The unique identifier of the session.
   * @param userContent - The content of the user's message.
   * @param assistantContent - The content of the assistant's message.
   */
  public createUserAndAssistantMessages(
    sessionHashId: string,
    userContent: string,
    assistantContent: string
  ) {
    createManyEntities(this.sessionMessage.createMany, {
      data: [
        { sessionHashId, role: "user", content: userContent },
        { sessionHashId, role: "assistant", content: assistantContent },
      ],
    });
  }
}
