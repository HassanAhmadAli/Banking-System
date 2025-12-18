import { IAccountComponent } from "../interfaces/account-component.interface";

export class CompositeAccount implements IAccountComponent {
    private children: IAccountComponent[] = [];
    constructor(private id: number, private accountNumber: string, private type: string = 'COMPOSITE',) {
        console.log(`Created Composite Account: ${accountNumber}`);
    }
    add(account: IAccountComponent): void {
        this.children.push(account);
        console.log(`Added ${account.getAccountNumber()} (Balance: $${account.getBalance()}) to composite ${this.accountNumber}`);
    }

    remove(account: IAccountComponent): void {
        const index = this.children.findIndex(c => c.getId() === account.getId());
        if (index !== -1) {
            const removed = this.children.splice(index, 1)[0];
            if (removed) {
                console.log(`Removed ${removed.getAccountNumber()} from composite ${this.accountNumber}`);
            }
        } else {
            console.log(`Account not found in composite`);
        }
    }

    getId(): number {
        return this.id;
    }

    getAccountNumber(): string {
        return this.accountNumber;
    }

    getBalance(): number {
        const total = this.children.reduce((sum, child) => {
            return sum + child.getBalance();
        }, 0);

        console.log(`Composite ${this.accountNumber} total balance: $${total}`);
        console.log(`From ${this.children.length} child account(s)`);

        return total;
    }

    getType(): string {
        return this.type;
    }

    deposit(amount: number): void {
        if (this.children.length === 0) {
            throw new Error('Cannot deposit: No child accounts in composite');
        }

        console.log(`Depositing $${amount} to composite ${this.accountNumber}`);

        //Deposit to first child
        const firstChild = this.children[0];
        if (firstChild) {
            firstChild.deposit(amount);
        }

        console.log(`Deposit complete. New composite balance: $${this.getBalance()}`);
    }

    withdraw(amount: number): void {
        if (this.children.length === 0) {
            throw new Error('Cannot withdraw: No child accounts in composite');
        }

        const totalBalance = this.getBalance();
        if (totalBalance < amount) {
            throw new Error(
                `Insufficient funds in composite. Available: $${totalBalance}, Requested: $${amount}`
            );
        }

        let remaining = amount;
        console.log(`Withdrawing $${amount} from composite ${this.accountNumber}`);

        for (const child of this.children) {
            if (remaining <= 0) break;

            const childBalance = child.getBalance();
            const toWithdraw = Math.min(remaining, childBalance);

            if (toWithdraw > 0) {
                console.log(`Withdrawing $${toWithdraw} from ${child.getAccountNumber()}`);
                child.withdraw(toWithdraw);
                remaining -= toWithdraw;
            }
        }

        if (remaining > 0) {
            throw new Error(`Failed to withdraw full amount. Still need: $${remaining}`);
        }

        console.log(`Withdrawal complete. New composite balance: $${this.getBalance()}`);
    }

    getChildren(): IAccountComponent[] {
        return this.children;
    }

    displayStructure(indent: string = ''): void {
        console.log(`${indent} : ${this.accountNumber} (Composite) - Total: $${this.getBalance()}`);

        for (const child of this.children) {
            if (child.getChildren) {
                // Child is also a composite
                (child as CompositeAccount).displayStructure(indent + '  ');
            } else {
                // Child is a leaf
                console.log(`${indent} : ${child.getAccountNumber()} (${child.getType()}) - $${child.getBalance()}`);
            }
        }
    }
} 