import { Injectable } from "@nestjs/common";
import { IInterestStrategy } from "./interest-strategy.interface";
import { logger } from "@/utils";

@Injectable()
export class CheckingInterestStrategy implements IInterestStrategy {
  private annualRate = 0.001;

  calculateInterest(balance: number, days: number = 30): number {
    if (balance <= 0) return 0;
    const monthlyRate = this.annualRate / 12;
    const interest = balance * monthlyRate * (days / 30);
    logger.info(`Checking Interest Calculation:`);
    logger.info(`Balance: $${balance.toFixed(2)}`);
    logger.info(`Annual Rate: ${(this.annualRate * 100).toFixed(2)}%`);
    logger.info(`Days: ${days}`);
    logger.info(`Interest: $${interest.toFixed(2)}`);
    return interest;
  }

  getAnnualRate(): number {
    return this.annualRate;
  }

  getStrategyName(): string {
    return "Checking Interest Strategy (0.1% APY)";
  }
}
