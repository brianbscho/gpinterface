import { Prisma } from "@prisma/client";
import {
  ChatCompletionContentsQuery,
  ChatCompletionModelSelect,
} from "../util/prisma";

export class ChatRepository {
  constructor(private chat: Prisma.GpiDelegate) {}

  async findFirst(gpiHashId: string, userHashId: string | null) {
    const gpi = await this.chat.findFirst({
      where: {
        hashId: gpiHashId,
        OR: [{ userHashId }, { isPublic: true }],
        model: { isAvailable: true },
      },
      select: {
        config: true,
        model: { select: ChatCompletionModelSelect },
        systemMessage: true,
        chatContents: ChatCompletionContentsQuery,
      },
    });

    if (!gpi) {
      throw new Error(`GPI with hashId ${gpiHashId} not found`);
    }

    return gpi;
  }
}
