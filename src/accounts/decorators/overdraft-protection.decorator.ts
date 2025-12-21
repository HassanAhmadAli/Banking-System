import { AccountDecorator } from "./account-decorator.abstract";
import { IAccountComponent } from "../interfaces/account-component.interface";

export class OverdraftProtectionDecorator extends AccountDecorator {
    private overdraftLimit = 1000;
    private overdraftFee = 0.5;
    constructor(account: IAccountComponent) {
        super(account);
        console.log(`Overdraft Protection added to ${account.getAccountNumber()}`);
        console.log(`Limit: $${this.overdraftLimit}`);
    }

    override withdraw(amount: number): void {
        const currentBalance = this.wrappedAccount.getBalance();
        const availableBalance = currentBalance + this.overdraftLimit;

        if (amount <= 0) {
            throw new Error('Withdrawal amount must be positive');
        }

        if (amount > availableBalance) {
            throw new Error(
                `Exceeds overdraft limit. Available: $${availableBalance}, Requested: $${amount}`
            );
        }

        if (amount > currentBalance) {
            const overdraftAmount = amount - currentBalance;
            const fee = overdraftAmount * this.overdraftFee;

            console.log(`Using overdraft protection:`);
            console.log(`Overdraft amount: $${overdraftAmount}`);
            console.log(`Overdraft fee (5%): $${fee.toFixed(2)}`);
            console.log(`Total charged: $${(amount + fee).toFixed(2)}`);

            this.wrappedAccount.withdraw(amount + fee);
        } else {
            this.wrappedAccount.withdraw(amount);
        }
    }

    getAvailableBalance(): number {
        return this.wrappedAccount.getBalance() + this.overdraftLimit;
    }

    override getType(): string {
        return `${this.wrappedAccount.getType()} (Overdraft Protected)`;
    }
}