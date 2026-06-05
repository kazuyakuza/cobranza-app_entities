import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';

/**
 * For SaaS billing.
 */
export interface CompanyMonthlySummary {
  /** Primary key identifier. */
  id: UUID;

  /** Reference to the company. */
  companyId: UUID;

  /** Year. */
  year: number;

  /** Month (1-12). */
  month: number;

  /** Total amount of generated debts. */
  totalDebtsGenerated: Decimal;

  /** Total amount of confirmed payments. */
  totalPaymentsReceived: Decimal;

  /** Commission earned by the platform. */
  commissionEarned: Decimal;

  /** `'ARS'` or `'USD'`. */
  currency: Currency;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** Timestamp when the entity was last updated. */
  updatedAt: Date;
}
