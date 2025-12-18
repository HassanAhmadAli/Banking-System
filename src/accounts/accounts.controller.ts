import { Controller, Post, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountType } from '@/prisma';

@Controller('accounts')
export class AccountsController {
    constructor(private accountsService: AccountsService) { }

    @Post()
    createAccount(@Body() body: { userId: number; accountType: AccountType }) {
        return this.accountsService.createAccount(body.userId, body.accountType);
    }

    @Post('composite')
    createComposite(@Body() body: { userId: number; childAccountIds: number[] }) {
        return this.accountsService.createCompositeAccount(body.userId, body.childAccountIds);
    }

    @Get(':id/balance')
    getBalance(@Param('id', ParseIntPipe) id: number) {
        return this.accountsService.getBalance(id);
    }

    @Post(':id/deposit')
    deposit(@Param('id', ParseIntPipe) id: number, @Body() body: { amount: number }) {
        return this.accountsService.deposit(id, body.amount);
    }

    @Post(':id/withdraw')
    withdraw(@Param('id', ParseIntPipe) id: number, @Body() body: { amount: number }) {
        return this.accountsService.withdraw(id, body.amount);
    }
}