import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma";
import { IAccountComponent } from '../interfaces/account-component.interface';
import { SavingsAccount } from "../entities/savings-account.entity";
import { CheckingAccount } from '../entities/checking-account.entity';
import { CompositeAccount } from '../entities/composite-account.entity';
import { AccountType } from "@/prisma";
import { InsuranceDecorator } from "../decorators/insurance.decorator";
import { PremiumServiceDecorator } from "../decorators/premium-service.decorator";
import { OverdraftProtectionDecorator } from "../decorators/overdraft-protection.decorator";

@Injectable()
export class AccountRepository {
    constructor(private prisma: PrismaService) { }

    async createAccount(
        userId: number,
        accountType: AccountType,
        parentAccountId?: number,
    ) {
        const accountNumber = this.generateAccountNumber(accountType);

        const account = await this.prisma.client.account.create({
            data: {
                account_number: accountNumber,
                account_type: accountType,
                balance: 0,
                state: 'ACTIVE',
                owner_id: userId,
                parent_account_id: parentAccountId,
            },
        });

        console.log(`Created ${accountType} account: ${accountNumber}`);
        return account;
    }

    private toDomainEntity(dbAccount: any): IAccountComponent {
        const id = dbAccount.account_id;
        const accountNumber = dbAccount.account_number;
        const balance = Number(dbAccount.balance);

        switch (dbAccount.account_type) {
            case AccountType.SAVINGS:
                return new SavingsAccount(id, accountNumber, balance);

            case AccountType.CHECKING:
                return new CheckingAccount(id, accountNumber, balance);

            case AccountType.LOAN:
                return new CheckingAccount(id, accountNumber, balance);

            case AccountType.INVESTMENT:
                return new CheckingAccount(id, accountNumber, balance);

            default:
                throw new Error(`Unknown account type: ${dbAccount.account_type}`);
        }
    }

    async loadAccountWithChildren(accountId: number): Promise<IAccountComponent> {
        const dbAccount = await this.prisma.client.account.findUnique({
            where: { account_id: accountId },
            include: {
                sub_accounts: true,
            },
        });

        if (!dbAccount) {
            throw new Error(`Account with ID ${accountId} not found`);
        }

        if (dbAccount.sub_accounts && dbAccount.sub_accounts.length > 0) {
            console.log(`Loading composite account ${dbAccount.account_number} with ${dbAccount.sub_accounts.length} children`);

            const composite = new CompositeAccount(
                dbAccount.account_id,
                dbAccount.account_number,
            );

            for (const childDb of dbAccount.sub_accounts) {
                const childEntity = this.toDomainEntity(childDb);
                composite.add(childEntity);
            }

            return composite;
        }

        console.log(`Loading individual account ${dbAccount.account_number}`);
        return this.toDomainEntity(dbAccount);
    }

    async saveBalance(accountId: number, newBalance: number): Promise<void> {
        await this.prisma.client.account.update({
            where: { account_id: accountId },
            data: { balance: newBalance },
        });

        console.log(`Saved balance $${newBalance} for account ID ${accountId}`);
    }

    private generateAccountNumber(type: AccountType): string {
        const prefix = type.substring(0, 3).toUpperCase();
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `${prefix}${timestamp}${random}`;
    }

    //Decorator Pattern
    async loadAccountWithFeatures(accountId: number): Promise<IAccountComponent> {
        // Load account with features
        const dbAccount = await this.prisma.client.account.findUnique({
            where: { account_id: accountId },
            include: {
                features: {
                    include: {
                        feature: true, // Include feature details
                    },
                },
                sub_accounts: true, // For composite pattern
            },
        });

        if (!dbAccount) {
            throw new Error(`Account with ID ${accountId} not found`);
        }

        // Create base account (or composite)
        let account: IAccountComponent;

        if (dbAccount.sub_accounts && dbAccount.sub_accounts.length > 0) {
            // Composite account
            const composite = new CompositeAccount(
                dbAccount.account_id,
                dbAccount.account_number,
            );
            for (const childDb of dbAccount.sub_accounts) {
                const childEntity = this.toDomainEntity(childDb);
                composite.add(childEntity);
            }
            account = composite;
        } else {
            // Individual account
            account = this.toDomainEntity(dbAccount);
        }

        console.log(`\nApplying decorators to account ${dbAccount.account_number}:`);

        for (const featureMap of dbAccount.features) {
            const featureName = featureMap.feature.name;

            switch (featureName) {
                case 'OVERDRAFT':
                    account = new OverdraftProtectionDecorator(account);
                    break;

                case 'PREMIUM':
                    account = new PremiumServiceDecorator(account);
                    break;

                case 'INSURANCE':
                    account = new InsuranceDecorator(account);
                    break;

                default:
                    console.log(`Unknown feature: ${featureName}`);
            }
        }

        return account;
    }
}