import { Prisma } from "@prisma/client";
import { createEntity, getDataWithHashId } from "../util/prisma";

export class HistoryRepository {
  constructor(private history: Prisma.HistoryDelegate) {}

  async create(data: Omit<Prisma.HistoryUncheckedCreateInput, "hashId">) {
    const createdHistory = await createEntity(this.history.create, {
      data: getDataWithHashId(data),
    });

    return createdHistory;
  }
}
