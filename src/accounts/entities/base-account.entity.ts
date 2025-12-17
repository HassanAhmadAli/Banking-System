import { IAccountComponent } from "../interfaces/account-component.interface";
import { AccountType } from "@/prisma";

export abstract class BaseAccount implements IAccountComponent {
    constructor(
        protected id: number,
        protected accountNumber: string,
        protected balance: number,
        protected type: AccountType
    ) { }
    getId(): number {
        return this.id;
    }
    getAccountNumber(): string {
        return this.accountNumber;
    }
    getBalance(): number {
        return this.balance;
    }
    getType(): string {
        return this.type;
    }
    abstract deposit(amount: number): void;
    abstract withdraw(amount: number): void;
}