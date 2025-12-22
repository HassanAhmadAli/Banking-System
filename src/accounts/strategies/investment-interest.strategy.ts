import { Injectable } from "@nestjs/common";
import { IInterestStrategy } from "./interest-strategy.interface";
import { logger } from "@/utils";

@Injectable()
export class InvestmentInterestStrategy implements IInterestStrategy {
  private baseAnnualRate = 0.07; // 7% base rate

  calculateInterest(balance: number, days: number = 30): number {
    if (balance <= 0) {
      return 0;
    }

    // Simulate market volatility: ±2% variation
    const volatility = (Math.random() - 0.5) * 0.04; // -2% to +2%
    const effectiveRate = this.baseAnnualRate + volatility;

    const monthlyRate = effectiveRate / 12;
    const interest = balance * monthlyRate * (days / 30);

    logger.info(`Investment Interest Calculation:`);
    logger.info(`Balance: $${balance.toFixed(2)}`);
    logger.info(`Base Annual Rate: ${(this.baseAnnualRate * 100).toFixed(2)}%`);
    logger.info(`Market Volatility: ${(volatility * 100).toFixed(2)}%`);
    logger.info(`Effective Rate: ${(effectiveRate * 100).toFixed(2)}%`);
    logger.info(`Days: ${days}`);
    logger.info(`Interest: $${interest.toFixed(2)}`);

    return interest;
  }

  getAnnualRate(): number {
    return this.baseAnnualRate;
  }

  getStrategyName(): string {
    return "Investment Interest Strategy (7% APY ±2% volatility)";
  }
}
