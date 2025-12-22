import { Injectable } from "@nestjs/common";
import { AccountRepository } from "./repositories/account.repository";
import { PrismaService } from "@/prisma";
import { AccountType, FeatureName } from "@/prisma";
import { logger } from "@/utils";
import { InterestCalculatorService } from "./services/interest-calculator.service";

@Injectable()
export class AccountsService {
  constructor(
    private accountRepository: AccountRepository,
    private prismaService: PrismaService,
    private interestCalculator: InterestCalculatorService,
  ) {}

  public get prisma() {
    return this.prismaService.client;
  }

  async createAccount(userId: number, accountType: AccountType) {
    return this.accountRepository.createAccount(userId, accountType);
  }

  async createCompositeAccount(userId: number, childAccountIds: number[]) {
    logger.info(`Creating composite account for user ${userId} with ${childAccountIds.length} children`);

    const parentAccount = await this.accountRepository.createAccount(userId, AccountType.SAVINGS);

    await this.prisma.account.updateMany({
      where: { account_id: { in: childAccountIds } },
      data: { parent_account_id: parentAccount.account_id },
    });

    logger.info(`Composite account created: ${parentAccount.account_number}`);
    return parentAccount;
  }

  async getAccount(accountId: number) {
    return this.accountRepository.loadAccountWithChildren(accountId);
  }

  async deposit(accountId: number, amount: number) {
    logger.info(`\nDEPOSIT REQUEST: $${amount} to account ID ${accountId}`);

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
    logger.info(`\nWITHDRAW REQUEST: $${amount} from account ID ${accountId}`);

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
      children:
        account.getChildren?.()?.map((c) => ({
          id: c.getId(),
          accountNumber: c.getAccountNumber(),
          balance: c.getBalance(),
          type: c.getType(),
        })) || [],
    };

    logger.info("\nBALANCE QUERY RESULT:");
    logger.info(JSON.stringify(result, null, 2));

    return result;
  }

  //Decorator Pattern
  async addFeature(accountId: number, featureName: FeatureName) {
    logger.info(`\nAdding feature ${featureName} to account ${accountId}`);

    let feature = await this.prisma.accountFeature.findFirst({
      where: { name: featureName },
    });

    if (!feature) {
      const costs = {
        OVERDRAFT: 0,
        PREMIUM: 10,
        INSURANCE: 5,
      };

      feature = await this.prisma.accountFeature.create({
        data: {
          name: featureName,
          extra_cost: costs[featureName] || 0,
        },
      });
    }

    const featureMap = await this.prisma.accountFeatureMap.create({
      data: {
        account_id: accountId,
        feature_id: feature.feature_id,
      },
    });

    logger.info(`Feature ${featureName} added successfully`);
    return featureMap;
  }

  async removeFeature(accountId: number, featureName: FeatureName) {
    logger.info(`\nRemoving feature ${featureName} from account ${accountId}`);

    const feature = await this.prisma.accountFeature.findFirst({
      where: { name: featureName },
    });

    if (!feature) {
      throw new Error(`Feature ${featureName} not found`);
    }

    await this.prisma.accountFeatureMap.deleteMany({
      where: {
        account_id: accountId,
        feature_id: feature.feature_id,
      },
    });

    logger.info(`Feature ${featureName} removed successfully`);
  }

  async getAccountWithFeatures(accountId: number) {
    return this.accountRepository.loadAccountWithFeatures(accountId);
  }

  async depositWithFeatures(accountId: number, amount: number) {
    logger.info(`\nDEPOSIT WITH FEATURES: $${amount} to account ID ${accountId}`);

    const account = await this.accountRepository.loadAccountWithFeatures(accountId);

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
      accountType: account.getType(),
    };
  }

  async withdrawWithFeatures(accountId: number, amount: number) {
    logger.info(`\nWITHDRAW WITH FEATURES: $${amount} from account ID ${accountId}`);

    const account = await this.accountRepository.loadAccountWithFeatures(accountId);

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
      accountType: account.getType(),
    };
  }

  //Strategy Pattern
  async applyInterest(accountId: number, days: number = 30) {
    console.log(`\nApplying interest to account ${accountId}`);

    // Get account from database
    const dbAccount = await this.prisma.account.findUnique({
      where: { account_id: accountId },
    });

    if (!dbAccount) {
      throw new Error("Account not found");
    }

    const balance = Number(dbAccount.balance);
    const accountType = dbAccount.account_type;

    // Calculate interest using appropriate strategy
    const interest = this.interestCalculator.calculateInterest(accountType, balance, days);

    // Apply interest to balance
    const newBalance = balance + interest;

    await this.prisma.account.update({
      where: { account_id: accountId },
      data: { balance: newBalance },
    });

    logger.info(`Interest applied: $${interest.toFixed(2)}`);
    logger.info(`Old balance: $${balance.toFixed(2)}`);
    logger.info(`New balance: $${newBalance.toFixed(2)}`);

    return {
      accountId,
      accountType,
      oldBalance: balance,
      interestEarned: interest,
      newBalance,
      days,
    };
  }

  /**
   * Get interest rate for account
   */
  async getInterestRate(accountId: number) {
    const dbAccount = await this.prisma.account.findUnique({
      where: { account_id: accountId },
    });

    if (!dbAccount) {
      throw new Error("Account not found");
    }

    const rate = this.interestCalculator.getAnnualRate(dbAccount.account_type);

    return {
      accountId,
      accountType: dbAccount.account_type,
      annualRate: rate,
      annualRatePercent: `${(rate * 100).toFixed(2)}%`,
    };
  }

  /**
   * Compare interest returns across account types
   */
  async compareInterestReturns(balance: number, days: number = 30) {
    const results = this.interestCalculator.compareReturns(balance, days);

    const formatted = Object.entries(results).map(([accountType, interest]) => ({
      accountType,
      balance,
      days,
      interestEarned: interest,
      finalBalance: balance + interest,
      annualizedReturn: `${((interest / balance) * (365 / days) * 100).toFixed(2)}%`,
    }));

    return Promise.resolve(formatted);
  }

  /**
   * Apply interest to all accounts (batch job - cron)
   */
  async applyInterestToAll(days: number = 30) {
    logger.info(`\nApplying interest to ALL accounts...`);

    const accounts = await this.prisma.account.findMany({
      where: {
        state: "ACTIVE",
      },
    });

    const results = [];

    for (const account of accounts) {
      try {
        const result = await this.applyInterest(account.account_id, days);
        results.push(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error applying interest to account ${account.account_id}:`, errorMessage);
      }
    }

    logger.info(`Interest applied to ${results.length} accounts`);
    return results;
  }
}
