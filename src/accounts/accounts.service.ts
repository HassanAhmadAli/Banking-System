import { Injectable } from '@nestjs/common';
import { AccountRepository } from './repositories/account.repository';
import { PrismaService } from '@/prisma';
import { AccountType } from '@/prisma';

@Injectable()
export class AccountsService {
    constructor(
        private accountRepository: AccountRepository,
        private prisma: PrismaService,
    ) { }

    async createAccount(userId: number, accountType: AccountType) {
        return this.accountRepository.createAccount(userId, accountType);
    }

    async createCompositeAccount(userId: number, childAccountIds: number[]) {
        console.log(`Creating composite account for user ${userId} with ${childAccountIds.length} children`);

        const parentAccount = await this.accountRepository.createAccount(
            userId,
            AccountType.SAVINGS,
        );


        await this.prisma.client.account.updateMany({
            where: { account_id: { in: childAccountIds } },
            data: { parent_account_id: parentAccount.account_id },
        });

        console.log(`Composite account created: ${parentAccount.account_number}`);
        return parentAccount;
    }

    async getAccount(accountId: number) {
        return this.accountRepository.loadAccountWithChildren(accountId);
    }

    async deposit(accountId: number, amount: number) {
        console.log(`\nDEPOSIT REQUEST: $${amount} to account ID ${accountId}`);

        const account = await this.accountRepository.loadAccountWithChildren(accountId);

        account.deposit(amount);

        if (account.getChildren) {
            for (const child of account.getChildren()) {
                await this.accountRepository.saveBalance(child.getId(), child.getBalance());
            }
        } else {
            await this.accountRepository.saveBalance(accountId, account.getBalance());
        }

        return {
            success: true,
            newBalance: account.getBalance(),
            accountNumber: account.getAccountNumber(),
        };
    }

    async withdraw(accountId: number, amount: number) {
        console.log(`\nWITHDRAW REQUEST: $${amount} from account ID ${accountId}`);

        const account = await this.accountRepository.loadAccountWithChildren(accountId);

        account.withdraw(amount);

        if (account.getChildren) {
            for (const child of account.getChildren()) {
                await this.accountRepository.saveBalance(child.getId(), child.getBalance());
            }
        } else {
            await this.accountRepository.saveBalance(accountId, account.getBalance());
        }

        return {
            success: true,
            newBalance: account.getBalance(),
            accountNumber: account.getAccountNumber(),
        };
    }

    async getBalance(accountId: number) {
        const account = await this.accountRepository.loadAccountWithChildren(accountId);

        const result = {
            accountId,
            accountNumber: account.getAccountNumber(),
            balance: account.getBalance(),
            type: account.getType(),
            children: account.getChildren?.()?.map(c => ({
                id: c.getId(),
                accountNumber: c.getAccountNumber(),
                balance: c.getBalance(),
                type: c.getType(),
            })) || [],
        };

        console.log('\nBALANCE QUERY RESULT:');
        console.log(JSON.stringify(result, null, 2));

        return result;
    }
}
