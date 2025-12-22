import { AccountDecorator } from "./account-decorator.abstract";
import { IAccountComponent } from "../interfaces/account-component.interface";

export class OverdraftProtectionDecorator extends AccountDecorator {
    private overdraftLimit = 1000;
    private overdraftFee = 0.05;
    constructor(account: IAccountComponent) {
        super(account);
        console.log(`Overdraft Protection added to ${account.getAccountNumber()}`);
        console.log(`Limit: $${this.overdraftLimit}`);
    }

    override withdraw(amount: number): void {
        const currentBalance = this.wrappedAccount.getBalance();
        const minAllowedBalance = -this.overdraftLimit;
        if (amount <= 0) {
            throw new Error('Withdrawal amount must be positive');
        }
        const balanceAfterWithdrawal = currentBalance - amount;
        if (balanceAfterWithdrawal < minAllowedBalance) {
            const availableToWithdraw = currentBalance + this.overdraftLimit;
            throw new Error(
                `Exceeds overdraft limit. You can withdraw up to $${availableToWithdraw.toFixed(2)}`
            );
        }

        if (amount > currentBalance) {
            const overdraftAmount = amount - currentBalance;
            const fee = overdraftAmount * this.overdraftFee;
            console.log(`Using overdraft protection:`);
            console.log(`Current balance: $${currentBalance.toFixed(2)}`);
            console.log(`Withdrawal amount: $${amount.toFixed(2)}`);
            console.log(`Overdraft used: $${overdraftAmount.toFixed(2)}`);
            console.log(`Overdraft fee (5%): $${fee.toFixed(2)}`);
            console.log(`Total deducted: $${(amount + fee).toFixed(2)}`);
            this.wrappedAccount.withdraw(amount + fee);
            const newBalance = this.wrappedAccount.getBalance();
            console.log(`New balance: $${newBalance.toFixed(2)}`);
            if (newBalance < 0) {
                console.log(`Account is overdrawn by $${Math.abs(newBalance).toFixed(2)}`)
            }
        } else {
            this.wrappedAccount.withdraw(amount);
            console.log(`Normal withdrawal: $${amount.toFixed(2)}`);
            console.log(`New balance: $${this.wrappedAccount.getBalance().toFixed(2)}`);
        }
    }

    getAvailableBalance(): number {
        return this.wrappedAccount.getBalance() + this.overdraftLimit;
    }

    override getBalance(): number {
        const balance = this.wrappedAccount.getBalance();
        console.log(`Balance: $${balance.toFixed(2)} (Available with overdraft: $${this.getAvailableBalance().toFixed(2)})`);
        return balance;
    }

    override getType(): string {
        return `${this.wrappedAccount.getType()} (Overdraft Protected)`;
    }  
}