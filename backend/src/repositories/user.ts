import { Prisma } from "@prisma/client";
import { getDataWithHashId } from "../util/prisma";

export class UserRepository {
  constructor(private user: Prisma.UserDelegate) {}

  /**
   * Retrieves the balance of a user by their hash ID.
   *
   * @param hashId - The user's hash ID.
   * @returns The user's current balance.
   * @throws Error if the user is not found.
   */
  public async getUserBalanceByHashId(hashId: string) {
    const user = await this.user.findFirst({
      where: { hashId },
      select: { balance: true },
    });

    if (!user) {
      throw new Error(`User with hashId ${hashId} not found`);
    }

    return user.balance;
  }

  /**
   * Updates the user's balance by incrementing or decrementing it.
   *
   * @param hashId - The user's hash ID.
   * @param balance - The amount to increment or decrement the balance by.
   * @returns The updated balance.
   */
  public async updateUserBalanceByHashId(
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

  /**
   * Finds a user by their email address.
   *
   * @param email - The email of the user to find.
   * @returns The user's details, including their hash ID, email, name, password, and balance.
   */
  public async findUserByEmail(email: string) {
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

  /**
   * Finds a user by their hash ID.
   *
   * @param hashId - The hash ID of the user to find.
   * @returns The user's details, including their hash ID, email, name, and balance.
   */
  public async findUserByHashId(hashId: string) {
    return this.user.findFirst({
      where: { hashId },
      select: { hashId: true, email: true, name: true, balance: true },
    });
  }

  /**
   * Creates a new user with the provided data.
   *
   * @param data - The user's data including email, optional password, name, and balance.
   * @returns The newly created user's details, including their hash ID, email, name, and balance.
   */
  public async createUser(data: {
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

  /**
   * Updates a user's name based on their hash ID.
   *
   * @param hashId - The user's hash ID.
   * @param name - The new name for the user.
   * @returns The updated user details including hash ID, email, name, and balance.
   */
  public async updateUserNameByHashId(hashId: string, name: string) {
    return this.user.update({
      where: { hashId },
      data: { name },
      select: { hashId: true, email: true, name: true, balance: true },
    });
  }

  /**
   * Finds the password for a user by their hash ID.
   *
   * @param hashId - The user's hash ID.
   * @returns The user's password.
   */
  public async findUserPasswordByHashId(hashId: string) {
    return this.user.findFirst({
      where: { hashId },
      select: { password: true },
    });
  }

  /**
   * Updates a user's password based on their hash ID.
   *
   * @param hashId - The user's hash ID.
   * @param newPassword - The new password for the user.
   */
  public async updateUserPasswordByHashId(hashId: string, newPassword: string) {
    return this.user.update({
      where: { hashId },
      data: { password: newPassword },
    });
  }

  /**
   * Deletes a user by their hash ID.
   *
   * @param hashId - The hash ID of the user to delete.
   * @returns The deleted user record.
   */
  public async deleteUserByHashId(hashId: string) {
    return this.user.delete({ where: { hashId } });
  }
}
