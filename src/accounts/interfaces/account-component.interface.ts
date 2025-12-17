export interface IAccountComponent {
    getId(): number;
    getAccountNumber(): string;
    getBalance(): number;
    getType(): string;
    deposit(amount: number): void;
    withdraw(amount: number): void;
    getChildren?(): IAccountComponent[];
}