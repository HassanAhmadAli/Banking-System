import { Injectable, NotImplementedException } from "@nestjs/common";
import { IInterestStrategy } from "../strategies/interest-strategy.interface";
import { SavingsInterestStrategy } from "../strategies/savings-interest.strategy";
import { CheckingInterestStrategy } from "../strategies/cheking-interest.strategy";
import { LoanInterestStrategy } from "../strategies/loan-interest.strategy";
import { InvestmentInterestStrategy } from "../strategies/investment-interest.strategy";
import { AccountType } from "@/prisma";
import { logger } from "@/utils";

@Injectable()
export class InterestCalculatorService {
  private strategies: Map<AccountType, IInterestStrategy>;
  constructor(
    private savingsStrategy: SavingsInterestStrategy,
    private checkingStrategy: CheckingInterestStrategy,
    private loanStrategy: LoanInterestStrategy,
    private investmentStrategy: InvestmentInterestStrategy,
  ) {
    // Initialize strategy map
    this.strategies = new Map<AccountType, IInterestStrategy>([
      [AccountType.SAVINGS, savingsStrategy],
      [AccountType.CHECKING, checkingStrategy],
      [AccountType.LOAN, loanStrategy],
      [AccountType.INVESTMENT, investmentStrategy],
    ]);
  }

  calculateInterest(accountType: AccountType, balance: number, days: number = 30): number {
    const strategy = this.strategies.get(accountType);

    if (!strategy) {
      throw new NotImplementedException(`No interest strategy found for account type: ${accountType}`);
    }

    logger.info(`Using Strategy: ${strategy.getStrategyName()}`);
    return strategy.calculateInterest(balance, days);
  }

  getAnnualRate(accountType: AccountType): number {
    const strategy = this.strategies.get(accountType);
    if (!strategy) {
      throw new NotImplementedException(`No interest strategy found for account type: ${accountType}`);
    }
    return strategy.getAnnualRate();
  }

  setStrategy(accountType: AccountType, strategy: IInterestStrategy): void {
    logger.info(`Changing strategy for ${accountType} to: ${strategy.getStrategyName()}`);
    this.strategies.set(accountType, strategy);
  }

  getAllStrategies(): Map<AccountType, IInterestStrategy> {
    return this.strategies;
  }

  compareReturns(balance: number, days: number = 30): { [key: string]: number } {
    logger.info(`Comparing interest returns for balance: $${balance} over ${days} days:`);

    const results: { [key: string]: number } = {};

    this.strategies.forEach((strategy, accountType) => {
      const interest = strategy.calculateInterest(balance, days);
      results[accountType] = interest;
    });

    return results;
  }
}
