import { Prisma } from "@prisma/client";
import { getDataWithHashId } from "../util/prisma";

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

  async findUserByEmail(email: string) {
    return this.user.findFirst({
      where: { email },
      select: {
        hashId: true,
        email: true,
        name: true,
        password: true,
        balance: true,
      },
    });
  }

  async findUserByHashId(hashId: string) {
    return this.user.findFirst({
      where: { hashId },
      select: { hashId: true, email: true, name: true, balance: true },
    });
  }

  async createUser(data: {
    email: string;
    password?: string;
    name: string;
    balance: number;
  }) {
    return this.user.create({
      data: getDataWithHashId(data),
      select: { hashId: true, email: true, name: true, balance: true },
    });
  }

  async updateUserName(hashId: string, name: string) {
    return this.user.update({
      where: { hashId },
      data: { name },
      select: { hashId: true, email: true, name: true, balance: true },
    });
  }

  async findPasswordByHashId(hashId: string) {
    return this.user.findFirst({
      where: { hashId },
      select: { password: true },
    });
  }

  async updateUserPassword(hashId: string, newPassword: string) {
    return this.user.update({
      where: { hashId },
      data: { password: newPassword },
    });
  }

  async deleteUser(hashId: string) {
    return this.user.delete({ where: { hashId } });
  }
}
