import { AccountDecorator } from "./account-decorator.abstract";
import { IAccountComponent } from "../interfaces/account-component.interface";

export class InsuranceDecorator extends AccountDecorator {
    private monthlyFee = 5;
    private coverageLimit = 100000;
    constructor(account: IAccountComponent) {
        super(account);
        console.log(`Insurance added to ${account.getAccountNumber()}`);
        console.log(`Coverage: Up to $${this.coverageLimit}`);
        console.log(`Monthly fee: $${this.monthlyFee}`);
    }

    override withdraw(amount: number): void {
        if (amount > 10000) {
            console.log(`Large withdrawal detected: $${amount}`);
            console.log(`Insurance monitoring active`);
            console.log(`SMS verification required (simulated: approved)`);
        }

        this.wrappedAccount.withdraw(amount);
        console.log(`Transaction protected by insurance`);
    }

    chargeMonthlyFee(): void {
        console.log(`Charging insurance monthly fee: $${this.monthlyFee}`);
        this.wrappedAccount.withdraw(this.monthlyFee);
    }

    fileInsuranceClaim(amount: number, reason: string): boolean {
        if (amount > this.coverageLimit) {
            console.log(`Claim exceeds coverage limit of $${this.coverageLimit}`);
            return false;
        }

        console.log(`Insurance claim filed:`);
        console.log(`Amount: $${amount}`);
        console.log(`Reason: ${reason}`);
        console.log(`Status: Under review`);
        return true;
    }

    override getType(): string {
        return `${this.wrappedAccount.getType()} (Insured)`;
    }
}