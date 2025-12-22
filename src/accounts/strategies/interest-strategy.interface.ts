export interface IInterestStrategy {

    calculateInterest(balance: number, days?: number): number;

    getAnnualRate(): number;

    getStrategyName(): string;
}