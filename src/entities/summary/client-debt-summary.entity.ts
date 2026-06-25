import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';
import { ClientDebtSummaryStatus } from '../../enums/client-debt-summary-status.enum';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * Current balance, total debt, etc. (can be a materialized view).
 */
export interface ClientDebtSummary extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** Reference to the client. */
  clientId: UUID;

  /** Total debt amount. */
  totalDebt: Decimal;

  /** Total paid amount. */
  totalPaid: Decimal;

  /** Balance. */
  balance: Decimal;

  /** `'ARS'` or `'USD'`. */
  currency: Currency;

  /** Reference to the last confirmed payment. */
  lastPaymentId?: UUID;

  /** Reference to the last generated debt. */
  lastDebtId?: UUID;

  /** Date of the last payment. */
  lastPaymentDate?: Date;

  /** Date of the last debt. */
  lastDebtDate?: Date;

  /** Status of the summary. */
  status: ClientDebtSummaryStatus;
}
