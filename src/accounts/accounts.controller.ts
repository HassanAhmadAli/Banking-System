import { Controller, Post, Delete, Get, Body, Param, ParseIntPipe, Query } from "@nestjs/common";
import { AccountsService } from "./accounts.service";
import { CreateAccountDto } from "./dto/create-account.dto";
import { CreateCompositeAccountDto } from "./dto/create-composite-account.dto";
import { TransactionDto } from "./dto/transaction.dto";
import { EditFeatureDto } from "./dto/add-feature.dto";
import { ApplyInterestDto } from "./dto/apply-interest.dto";
import { CompareInterestDto } from "./dto/compare-interest.dto";

@Controller("accounts")
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Post()
  createAccount(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.createAccount(createAccountDto);
  }

  @Post("composite")
  createComposite(@Body() body: CreateCompositeAccountDto) {
    return this.accountsService.createCompositeAccount(body.userId, body.childAccountIds);
  }

  @Get(":id/balance")
  getBalance(@Param("id", ParseIntPipe) id: number) {
    return this.accountsService.getBalance(id);
  }

  @Post(":id/deposit")
  deposit(@Param("id", ParseIntPipe) id: number, @Body() body: TransactionDto) {
    return this.accountsService.deposit(id, body.amount);
  }

  @Post(":id/withdraw")
  withdraw(@Param("id", ParseIntPipe) id: number, @Body() body: TransactionDto) {
    return this.accountsService.withdraw(id, body.amount);
  }

  //Decorator Pattern End-Points
  @Post(":id/features")
  addFeature(@Param("id", ParseIntPipe) id: number, @Body() { featureName }: EditFeatureDto) {
    return this.accountsService.addFeature(id, featureName);
  }

  @Delete(":id/features")
  removeFeature(@Param("id", ParseIntPipe) id: number, @Body() { featureName }: EditFeatureDto) {
    return this.accountsService.removeFeature(id, featureName);
  }

  @Get(":id/with-features")
  getAccountWithFeatures(@Param("id", ParseIntPipe) id: number) {
    return this.accountsService.getAccountWithFeatures(id);
  }

  @Post(":id/deposit-with-features")
  depositWithFeatures(@Param("id", ParseIntPipe) id: number, @Body() body: TransactionDto) {
    return this.accountsService.depositWithFeatures(id, body.amount);
  }

  @Post(":id/withdraw-with-features")
  withdrawWithFeatures(@Param("id", ParseIntPipe) id: number, @Body() body: TransactionDto) {
    return this.accountsService.withdrawWithFeatures(id, body.amount);
  }

  //Strategy Pattern End-Points
  @Post(":id/apply-interest")
  applyInterest(@Param("id", ParseIntPipe) id: number, @Body() { days }: ApplyInterestDto) {
    return this.accountsService.applyInterest(id, days);
  }

  @Get(":id/interest-rate")
  getInterestRate(@Param("id", ParseIntPipe) id: number) {
    return this.accountsService.getInterestRate(id);
  }

  @Get("compare-interest")
  compareInterest(@Query() { days, balance }: CompareInterestDto) {
    return this.accountsService.compareInterest(balance, days);
  }

  @Post("apply-interest-all")
  applyInterestToAll(@Body() body: ApplyInterestDto) {
    return this.accountsService.applyInterestToAll(body.days);
  }
}
