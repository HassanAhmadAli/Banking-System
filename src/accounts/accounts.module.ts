import { Module } from "@nestjs/common";
import { AccountsService } from "./accounts.service";
import { AccountsController } from "./accounts.controller";
import { AccountRepository } from "./repositories/account.repository";
import { InterestCalculatorService } from "./services/interest-calculator.service";
import { SavingsInterestStrategy } from "./strategies/savings-interest.strategy";
import { LoanInterestStrategy } from "./strategies/loan-interest.strategy";
import { CheckingInterestStrategy } from "./strategies/cheking-interest.strategy";
import { InvestmentInterestStrategy } from "./strategies/investment-interest.strategy";

@Module({
  providers: [AccountsService,
    AccountRepository,
    InterestCalculatorService,
    SavingsInterestStrategy,
    CheckingInterestStrategy,
    LoanInterestStrategy,
    InvestmentInterestStrategy,],
  controllers: [AccountsController],
  exports: [AccountsService],
})
export class AccountsModule { }
