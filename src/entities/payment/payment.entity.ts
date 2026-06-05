import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * Confirmed payment (final record).
 */
export interface Payment extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** Reference to the client. */
  clientId: UUID;

  /** Debt to which the payment is applied. */
  debtId: UUID;

  /** Payment origin (if it comes from a proof). */
  paymentAttemptId?: UUID;

  /** Amount paid. */
  amount: Decimal;

  /** `'ARS'` or `'USD'`. */
  currency: Currency;

  /** Effective payment date. */
  paymentDate: Date;

  /** Status of the payment. */
  status: PaymentStatus;

  /** Additional notes. */
  notes?: string;
}
