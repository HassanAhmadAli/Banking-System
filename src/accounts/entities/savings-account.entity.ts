import { BaseAccount } from "./base-account.entity";
import { AccountType } from "@/prisma";

export class SavingsAccount extends BaseAccount {
    constructor(id: number, accountNumber: string, balance: number) {
        super(id, accountNumber, balance, AccountType.SAVINGS);
    }
    override deposit(amount: number): void {
        if (amount <= 0) {
            throw new Error('Amount must be positive');
        }
        this.balance += amount;
        console.log(`Deposited $${amount} to Savings ${this.accountNumber}. New balance: $${this.balance}`);
    }
    override withdraw(amount: number): void {
        if (amount <= 0) {
            throw new Error('Amount must be positive');
        }
        if (this.balance < amount) {
            throw new Error(`Insufficient funds. Available: $${this.balance}, Requested: $${amount}`);
        }
        this.balance -= amount;
        console.log(`Withdrew $${amount} from Savings ${this.accountNumber}. New balance: $${this.balance}`);
    }
}