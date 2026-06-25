import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * Pricing configuration (% commission, etc.).
 */
export interface CompanyPlan extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** E.g., 0.085 = 8.5% (total). */
  commissionRate: Decimal;

  /** Percentage retained by the platform. */
  saasPercentage: Decimal;

  /** If there is an intermediary. */
  intermediaryPercentage?: Decimal;

  /** `'ARS'` or `'USD'`. */
  currency: Currency;

  /** Whether the plan is active. Default: true. */
  active: boolean;

  /** Start of validity period. */
  validFrom: Date;

  /** End of validity period. Null = undefined (no end date). */
  validUntil?: Date;

  /** Additional notes. */
  notes?: string;
}
