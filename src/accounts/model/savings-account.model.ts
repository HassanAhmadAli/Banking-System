import { logger } from "@/utils";
import { BaseAccount } from "./base-account.model";
import { AccountType } from "@/prisma";
import { BadRequestException } from "@nestjs/common";

export class SavingsAccount extends BaseAccount {
  constructor(id: number, accountNumber: string, balance: number) {
    super(id, accountNumber, balance, AccountType.SAVINGS);
  }
  override deposit(amount: number): void {
    if (amount <= 0) {
      throw new BadRequestException("Amount must be positive");
    }
    this.balance += amount;
    logger.info(`Deposited $${amount} to Savings ${this.accountNumber}. New balance: $${this.balance}`);
  }

  override withdraw(amount: number): void {
    if (amount <= 0) {
      throw new BadRequestException("Amount must be positive");
    }
    this.balance -= amount;
    logger.info(`Withdrew $${amount} from Savings ${this.accountNumber}. New balance: $${this.balance}`);
  }

  canWithdraw(amount: number): boolean {
    return this.balance >= amount;
  }
}
