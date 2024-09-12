import { PrismaClient } from "@prisma/client";
import { createEntity } from "../util/prisma";

export interface HistoryCreateData {
  userHashId: string | null;
  gpiHashId: string;
  provider: string;
  model: string;
  config: any;
  systemMessage?: string;
  messages: Array<{ role: string; content: string }>;
  response: any;
}

export class HistoryRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: HistoryCreateData) {
    try {
      const historyData = {
        userHashId: data.userHashId,
        gpiHashId: data.gpiHashId,
        provider: data.provider,
        model: data.model,
        config: data.config ?? null,
        messages: (data.systemMessage
          ? [{ role: "system", content: data.systemMessage }]
          : []
        ).concat(data.messages),
        ...data.response,
      };

      const createdHistory = await createEntity(this.prisma.history.create, {
        data: historyData,
      });

      return createdHistory;
    } catch (error) {
      console.error("Error creating history:", error);
      throw "Failed to create history record";
    }
  }
}
