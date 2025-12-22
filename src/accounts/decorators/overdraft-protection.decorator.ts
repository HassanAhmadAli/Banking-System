import { logger } from "@/utils";
import { AccountDecorator } from "./account-decorator.abstract";
import { IAccountComponent } from "../interfaces/account-component.interface";

export class OverdraftProtectionDecorator extends AccountDecorator {
  private overdraftLimit = 1000;
  private overdraftFee = 0.05;
  constructor(account: IAccountComponent) {
    super(account);
    logger.info(`Overdraft Protection added to ${account.getAccountNumber()}`);
    logger.info(`Limit: $${this.overdraftLimit}`);
  }

  override withdraw(amount: number): void {
    const currentBalance = this.wrappedAccount.getBalance();
    const minAllowedBalance = -this.overdraftLimit;
    if (amount <= 0) {
      throw new Error("Withdrawal amount must be positive");
    }
    const balanceAfterWithdrawal = currentBalance - amount;
    if (balanceAfterWithdrawal < minAllowedBalance) {
      const availableToWithdraw = currentBalance + this.overdraftLimit;
      throw new Error(`Exceeds overdraft limit. You can withdraw up to $${availableToWithdraw.toFixed(2)}`);
    }

    if (amount > currentBalance) {
      const overdraftAmount = amount - currentBalance;
      const fee = overdraftAmount * this.overdraftFee;
      logger.info(`Using overdraft protection:`);
      logger.info(`Current balance: $${currentBalance.toFixed(2)}`);
      logger.info(`Withdrawal amount: $${amount.toFixed(2)}`);
      logger.info(`Overdraft used: $${overdraftAmount.toFixed(2)}`);
      logger.info(`Overdraft fee (5%): $${fee.toFixed(2)}`);
      logger.info(`Total deducted: $${(amount + fee).toFixed(2)}`);
      this.wrappedAccount.withdraw(amount + fee);
      const newBalance = this.wrappedAccount.getBalance();
      logger.info(`New balance: $${newBalance.toFixed(2)}`);
      if (newBalance < 0) {
        logger.info(`Account is overdrawn by $${Math.abs(newBalance).toFixed(2)}`);
      }
    } else {
      this.wrappedAccount.withdraw(amount);
      logger.info(`Normal withdrawal: $${amount.toFixed(2)}`);
      logger.info(`New balance: $${this.wrappedAccount.getBalance().toFixed(2)}`);
    }
  }

  getAvailableBalance(): number {
    return this.wrappedAccount.getBalance() + this.overdraftLimit;
  }

  override getBalance(): number {
    const balance = this.wrappedAccount.getBalance();
    logger.info(
      `Balance: $${balance.toFixed(2)} (Available with overdraft: $${this.getAvailableBalance().toFixed(2)})`,
    );
    return balance;
  }

    override getType(): string {
        return `${this.wrappedAccount.getType()} (Overdraft Protected)`;
    }
}
