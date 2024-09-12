import { PrismaClient } from "@prisma/client";
import { createManyEntities } from "../util/prisma";

export class SessionMessageRepository {
  constructor(private prisma: PrismaClient) {}

  createMany(
    sessionHashId: string,
    userContent: string,
    assistantContent: string
  ) {
    createManyEntities(this.prisma.sessionMessage.createMany, {
      data: [
        { sessionHashId, role: "user", content: userContent },
        { sessionHashId, role: "assistant", content: assistantContent },
      ],
    });
  }
}
