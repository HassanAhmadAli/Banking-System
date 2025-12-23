import { logger } from "@/utils";
import { IAccountComponent } from "../interfaces/account-component.interface";
import { ConflictException } from "@nestjs/common";

export class CompositeAccount implements IAccountComponent {
  private children: IAccountComponent[] = [];
  constructor(
    private id: number,
    private accountNumber: string,
    private type: string = "COMPOSITE",
  ) {
    logger.info(`Created Composite Account: ${accountNumber}`);
  }
  add(account: IAccountComponent): void {
    this.children.push(account);
    logger.info(
      `Added ${account.getAccountNumber()} (Balance: $${account.getBalance()}) to composite ${this.accountNumber}`,
    );
  }

  remove(account: IAccountComponent): void {
    const index = this.children.findIndex((c) => c.getId() === account.getId());
    if (index !== -1) {
      const removed = this.children.splice(index, 1)[0];
      if (removed) {
        logger.info(`Removed ${removed.getAccountNumber()} from composite ${this.accountNumber}`);
      }
    } else {
      logger.info(`Account not found in composite`);
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

    logger.info(`Composite ${this.accountNumber} total balance: $${total}`);
    logger.info(`From ${this.children.length} child account(s)`);

    return total;
  }

  getType(): string {
    return this.type;
  }

  deposit(amount: number): void {
    if (this.children.length === 0) {
      throw new ConflictException("Cannot deposit: No child accounts in composite");
    }

    logger.info(`Depositing $${amount} to composite ${this.accountNumber}`);

    //Deposit to first child
    const firstChild = this.children[0];
    if (firstChild) {
      firstChild.deposit(amount);
    }

    logger.info(`Deposit complete. New composite balance: $${this.getBalance()}`);
  }

  withdraw(amount: number): void {
    if (this.children.length === 0) {
      throw new ConflictException("Cannot withdraw: No child accounts in composite");
    }

    const totalBalance = this.getBalance();
    if (totalBalance < amount) {
      throw new ConflictException(
        `Insufficient funds in composite. Available: $${totalBalance}, Requested: $${amount}`,
      );
    }

    let remaining = amount;
    logger.info(`Withdrawing $${amount} from composite ${this.accountNumber}`);

    for (const child of this.children) {
      if (remaining <= 0) break;

      const childBalance = child.getBalance();
      const toWithdraw = Math.min(remaining, childBalance);

      if (toWithdraw > 0) {
        logger.info(`Withdrawing $${toWithdraw} from ${child.getAccountNumber()}`);
        child.withdraw(toWithdraw);
        remaining -= toWithdraw;
      }
    }

    if (remaining > 0) {
      throw new ConflictException(`Failed to withdraw full amount. Still need: $${remaining}`);
    }

    logger.info(`Withdrawal complete. New composite balance: $${this.getBalance()}`);
  }

  getChildren(): IAccountComponent[] {
    return this.children;
  }

  displayStructure(indent: string = ""): void {
    logger.info(`${indent} : ${this.accountNumber} (Composite) - Total: $${this.getBalance()}`);

    for (const child of this.children) {
      if (child.getChildren) {
        // Child is also a composite
        (child as CompositeAccount).displayStructure(indent + "  ");
      } else {
        // Child is a leaf
        logger.info(`${indent} : ${child.getAccountNumber()} (${child.getType()}) - $${child.getBalance()}`);
      }
    }
  }
}
