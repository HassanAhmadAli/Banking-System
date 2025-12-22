import { logger } from "@/utils";
import { Injectable } from "@nestjs/common";
import { Account, PrismaService, AccountType } from "@/prisma";
import { IAccountComponent } from "../interfaces/account-component.interface";
import { SavingsAccount } from "../model/savings-account.model";
import { CheckingAccount } from "../model/checking-account.model";
import { CompositeAccount } from "../model/composite-account.model";
import { InsuranceDecorator } from "../decorators/insurance.decorator";
import { PremiumServiceDecorator } from "../decorators/premium-service.decorator";
import { OverdraftProtectionDecorator } from "../decorators/overdraft-protection.decorator";

@Injectable()
export class AccountRepository {
  constructor(private prismaService: PrismaService) {}

  public get prisma() {
    return this.prismaService.client;
  }

  async createAccount(userId: number, accountType: AccountType, parentAccountId?: number) {
    const accountNumber = this.generateAccountNumber(accountType);

    const account = await this.prisma.account.create({
      data: {
        account_number: accountNumber,
        account_type: accountType,
        balance: 0,
        state: "ACTIVE",
        owner_id: userId,
        parent_account_id: parentAccountId,
      },
    });

    logger.info(`Created ${accountType} account: ${accountNumber}`);
    return account;
  }

  private toDomainEntity(dbAccount: Account): IAccountComponent {
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
    }
  }

  async loadAccountWithChildren(account_id: number): Promise<IAccountComponent> {
    const dbAccount = await this.prisma.account.findUniqueOrThrow({
      where: { account_id: account_id },
      include: {
        sub_accounts: true,
      },
    });
    const { sub_accounts, account_number } = dbAccount;
    if (sub_accounts && sub_accounts.length > 0) {
      logger.info(`Loading composite account ${account_number} with ${sub_accounts.length} children`);
      const composite = new CompositeAccount(account_id, account_number);
      for (const childDb of sub_accounts) {
        const childEntity = this.toDomainEntity(childDb);
        composite.add(childEntity);
      }
      return composite;
    }

    logger.info(`Loading individual account ${account_number}`);
    return this.toDomainEntity(dbAccount);
  }

  async saveBalance(accountId: number, newBalance: number): Promise<void> {
    await this.prisma.account.update({
      where: { account_id: accountId },
      data: { balance: newBalance },
    });

    logger.info(`Saved balance $${newBalance} for account ID ${accountId}`);
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
    const dbAccount = await this.prisma.account.findUnique({
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
      const composite = new CompositeAccount(dbAccount.account_id, dbAccount.account_number);
      for (const childDb of dbAccount.sub_accounts) {
        const childEntity = this.toDomainEntity(childDb);
        composite.add(childEntity);
      }
      account = composite;
    } else {
      // Individual account
      account = this.toDomainEntity(dbAccount);
    }

    logger.info(`\nApplying decorators to account ${dbAccount.account_number}:`);

    for (const featureMap of dbAccount.features) {
      const featureName = featureMap.feature.name;

      switch (featureName) {
        case "OVERDRAFT":
          account = new OverdraftProtectionDecorator(account);
          break;

        case "PREMIUM":
          account = new PremiumServiceDecorator(account);
          break;

        case "INSURANCE":
          account = new InsuranceDecorator(account);
          break;
      }
    }

    return account;
  }
}
