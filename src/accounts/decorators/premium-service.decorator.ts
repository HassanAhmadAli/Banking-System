import { logger } from "@/utils";
import { AccountDecorator } from "./account-decorator.abstract";
import { IAccountComponent } from "../interfaces/account-component.interface";

export class PremiumServiceDecorator extends AccountDecorator {
  private monthlyFee = 10;
  private interestBonus = 0.01;
  constructor(account: IAccountComponent) {
    super(account);
    logger.info(`Premium Service added to ${account.getAccountNumber()}`);
    logger.info(`Monthly fee: $${this.monthlyFee}`);
    logger.info(`Benefits: No fees, +1% interest, Priority support`);
  }

  override deposit(amount: number): void {
    logger.info(`Premium Deposit (no transaction fees)`);
    this.wrappedAccount.deposit(amount);

    const bonus = amount * this.interestBonus;
    logger.info(`Interest bonus (+1%): $${bonus.toFixed(2)}`);
    this.wrappedAccount.deposit(bonus);
  }

  override withdraw(amount: number): void {
    logger.info(`Premium Withdrawal (no transaction fees)`);
    this.wrappedAccount.withdraw(amount);
  }

  chargeMonthlyFee(): void {
    logger.info(`Charging premium monthly fee: $${this.monthlyFee}`);
    this.wrappedAccount.withdraw(this.monthlyFee);
  }

  override getType(): string {
    return `${this.wrappedAccount.getType()} (Premium)`;
  }
}
