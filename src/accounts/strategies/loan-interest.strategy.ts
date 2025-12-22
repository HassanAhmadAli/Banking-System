import { Injectable } from '@nestjs/common';
import { IInterestStrategy } from './interest-strategy.interface';
import { logger } from '@/utils';

@Injectable()
export class LoanInterestStrategy implements IInterestStrategy {
    private annualRate = 0.05; // 5% per year

    calculateInterest(balance: number, days: number = 30): number {

        const debt = Math.abs(balance);

        if (debt <= 0) {
            return 0;
        }

        const monthlyRate = this.annualRate / 12;
        const interest = debt * monthlyRate * (days / 30);

        logger.info(`Loan Interest Calculation:`);
        logger.info(`Debt: $${debt.toFixed(2)}`);
        logger.info(`Annual Rate: ${(this.annualRate * 100).toFixed(2)}%`);
        logger.info(`Days: ${days}`);
        logger.info(`Interest CHARGED: $${interest.toFixed(2)}`);

        // Return negative to indicate it's a charge
        return -interest;
    }

    getAnnualRate(): number {
        return this.annualRate;
    }

    getStrategyName(): string {
        return 'Loan Interest Strategy (5% APR - Charged)';
    }
}