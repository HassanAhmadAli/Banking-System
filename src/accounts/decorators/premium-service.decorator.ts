import { AccountDecorator } from "./account-decorator.abstract";
import { IAccountComponent } from "../interfaces/account-component.interface";

export class PremiumServiceDecorator extends AccountDecorator {
    private monthlyFee = 10;
    private interestBonus = 0.01;
    constructor(account: IAccountComponent) {
        super(account);
        console.log(`Premium Service added to ${account.getAccountNumber()}`);
        console.log(`Monthly fee: $${this.monthlyFee}`);
        console.log(`Benefits: No fees, +1% interest, Priority support`);
    }

    override deposit(amount: number): void {
        console.log(`Premium Deposit (no transaction fees)`);
        this.wrappedAccount.deposit(amount);

        const bonus = amount * this.interestBonus;
        console.log(`Interest bonus (+1%): $${bonus.toFixed(2)}`);
        this.wrappedAccount.deposit(bonus);
    }

    override withdraw(amount: number): void {
        console.log(`Premium Withdrawal (no transaction fees)`);
        this.wrappedAccount.withdraw(amount);
    }

    chargeMonthlyFee(): void {
        console.log(`Charging premium monthly fee: $${this.monthlyFee}`);
        this.wrappedAccount.withdraw(this.monthlyFee);
    }

    override getType(): string {
        return `${this.wrappedAccount.getType()} (Premium)`;
    }
}