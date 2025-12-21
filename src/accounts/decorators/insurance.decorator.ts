import { logger } from "@/utils";
import { AccountDecorator } from "./account-decorator.abstract";
import { IAccountComponent } from "../interfaces/account-component.interface";

export class InsuranceDecorator extends AccountDecorator {
  private monthlyFee = 5;
  private coverageLimit = 100000;
  constructor(account: IAccountComponent) {
    super(account);
    logger.info(`Insurance added to ${account.getAccountNumber()}`);
    logger.info(`Coverage: Up to $${this.coverageLimit}`);
    logger.info(`Monthly fee: $${this.monthlyFee}`);
  }

  override withdraw(amount: number): void {
    if (amount > 10000) {
      logger.info(`Large withdrawal detected: $${amount}`);
      logger.info(`Insurance monitoring active`);
      logger.info(`SMS verification required (simulated: approved)`);
    }

    this.wrappedAccount.withdraw(amount);
    logger.info(`Transaction protected by insurance`);
  }

  chargeMonthlyFee(): void {
    logger.info(`Charging insurance monthly fee: $${this.monthlyFee}`);
    this.wrappedAccount.withdraw(this.monthlyFee);
  }

  fileInsuranceClaim(amount: number, reason: string): boolean {
    if (amount > this.coverageLimit) {
      logger.info(`Claim exceeds coverage limit of $${this.coverageLimit}`);
      return false;
    }

    logger.info(`Insurance claim filed:`);
    logger.info(`Amount: $${amount}`);
    logger.info(`Reason: ${reason}`);
    logger.info(`Status: Under review`);
    return true;
  }

  override getType(): string {
    return `${this.wrappedAccount.getType()} (Insured)`;
  }
}
