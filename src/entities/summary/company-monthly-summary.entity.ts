import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * For SaaS billing.
 */
export interface CompanyMonthlySummary extends BaseEntity {
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
}
