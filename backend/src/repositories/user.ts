import { Prisma } from "@prisma/client";

export class UserRepository {
  constructor(private user: Prisma.UserDelegate) {}

  async getBalance(hashId: string) {
    const user = await this.user.findFirst({
      where: { hashId },
      select: { balance: true },
    });

    if (!user) {
      throw `User with hashId ${hashId} not found`;
    }

    return user.balance;
  }

  async updateBalance(
    hashId: string,
    balance: { decrement: number } | { increment: number }
  ) {
    const user = await this.user.update({
      where: { hashId },
      data: { balance },
      select: { balance: true },
    });

    return user.balance;
  }
}
