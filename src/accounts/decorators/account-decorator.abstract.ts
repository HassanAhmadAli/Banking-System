import { IAccountComponent } from "../interfaces/account-component.interface";

export abstract class AccountDecorator implements IAccountComponent {
    constructor(protected wrappedAccount: IAccountComponent) { }

    getId(): number {
        return this.wrappedAccount.getId();
    }

    getAccountNumber(): string {
        return this.wrappedAccount.getAccountNumber();
    }

    getBalance(): number {
        return this.wrappedAccount.getBalance();
    }

    getType(): string {
        return this.wrappedAccount.getType();
    }

    deposit(amount: number): void {
        this.wrappedAccount.deposit(amount);
    }

    withdraw(amount: number): void {
        this.wrappedAccount.withdraw(amount);
    }

    getChildren(): IAccountComponent[] {
        return this.wrappedAccount.getChildren?.() || [];
    }
}