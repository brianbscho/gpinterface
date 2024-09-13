import { Prisma } from "@prisma/client";
import { createManyEntities } from "../util/prisma";

export class SessionMessageRepository {
  constructor(private sessionMessage: Prisma.SessionMessageDelegate) {}

  createMany(
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
