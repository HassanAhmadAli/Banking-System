import { BaseAccount } from "./base-account.entity";
import { AccountType } from "@/prisma";

export class CheckingAccount extends BaseAccount {
    constructor(id: number, accountNumber: string, balance: number) {
        super(id, accountNumber, balance, AccountType.CHECKING);
    }

    override deposit(amount: number): void {
        if (amount <= 0) {
            throw new Error('Amount must be positive');
        }
        this.balance += amount;
        console.log(`Deposited $${amount} to Checking ${this.accountNumber}. New balance: $${this.balance}`);
    }

    override withdraw(amount: number): void {
        if (amount <= 0) {
            throw new Error('Amount must be positive');
        }
        this.balance -= amount;
        console.log(`Withdrew $${amount} from Checking ${this.accountNumber}. New balance: $${this.balance}`);
    }

    canWithdraw(amount: number): boolean {
        return this.balance >= amount;
    }
}
