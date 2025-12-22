import { Controller, Post, Delete, Get, Body, Param, ParseIntPipe, Query } from "@nestjs/common";
import { AccountsService } from "./accounts.service";
import { AccountType, FeatureName } from "@/prisma";

@Controller("accounts")
export class AccountsController {
    constructor(private accountsService: AccountsService) { }

    @Post()
    createAccount(@Body() body: { userId: number; accountType: AccountType }) {
        return this.accountsService.createAccount(body.userId, body.accountType);
    }

    @Post("composite")
    createComposite(@Body() body: { userId: number; childAccountIds: number[] }) {
        return this.accountsService.createCompositeAccount(body.userId, body.childAccountIds);
    }

    @Get(":id/balance")
    getBalance(@Param("id", ParseIntPipe) id: number) {
        return this.accountsService.getBalance(id);
    }

    @Post(":id/deposit")
    deposit(@Param("id", ParseIntPipe) id: number, @Body() body: { amount: number }) {
        return this.accountsService.deposit(id, body.amount);
    }

    @Post(":id/withdraw")
    withdraw(@Param("id", ParseIntPipe) id: number, @Body() body: { amount: number }) {
        return this.accountsService.withdraw(id, body.amount);
    }

    //Decorator Pattern End-Points
    @Post(":id/features")
    addFeature(@Param("id", ParseIntPipe) id: number, @Body() body: { featureName: FeatureName }) {
        return this.accountsService.addFeature(id, body.featureName);
    }

    @Delete(":id/features/:featureName")
    removeFeature(@Param("id", ParseIntPipe) id: number, @Param("featureName") featureName: FeatureName) {
        return this.accountsService.removeFeature(id, featureName);
    }

    @Get(":id/with-features")
    getAccountWithFeatures(@Param("id", ParseIntPipe) id: number) {
        return this.accountsService.getAccountWithFeatures(id);
    }

    @Post(":id/deposit-with-features")
    depositWithFeatures(@Param("id", ParseIntPipe) id: number, @Body() body: { amount: number }) {
        return this.accountsService.depositWithFeatures(id, body.amount);
    }

    @Post(":id/withdraw-with-features")
    withdrawWithFeatures(@Param("id", ParseIntPipe) id: number, @Body() body: { amount: number }) {
        return this.accountsService.withdrawWithFeatures(id, body.amount);
    }

    //Strategy Pattern End-Points
    @Post(':id/apply-interest')
    applyInterest(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { days?: number }
    ) {
        return this.accountsService.applyInterest(id, body.days || 30);
    }

    @Get(':id/interest-rate')
    getInterestRate(@Param('id', ParseIntPipe) id: number) {
        return this.accountsService.getInterestRate(id);
    }

    @Get('compare-interest')
    compareInterest(
        @Query('balance') balance: string,
        @Query('days') days?: string
    ) {
        return this.accountsService.compareInterestReturns(
            Number(balance),
            days ? Number(days) : 30
        );
    }

    @Post('apply-interest-all')
    applyInterestToAll(@Body() body: { days?: number }) {
        return this.accountsService.applyInterestToAll(body.days || 30);
    }
}
