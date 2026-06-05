import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';
import { PaymentAttemptStatus } from '../../enums/payment-attempt-status.enum';

/**
 * Payment attempt (intermediate state).
 */
export interface PaymentAttempt {
  /** Primary key identifier. */
  id: UUID;

  /** Reference to the company. */
  companyId: UUID;

  /** Reference to the client. */
  clientId: UUID;

  /** Reference to the payment proof. */
  paymentProofId: UUID;

  /** The client must indicate which debt the proof corresponds to. */
  debtId: UUID;

  /** Auto-filled if the proof parsing is successful. */
  amount?: Decimal;

  /** `'ARS'` or `'USD'` — Filled if parsing is successful. */
  currency?: Currency;

  /** Status of the payment attempt. */
  status: PaymentAttemptStatus;

  /** Rejection reason (used mainly by Company User when manually rejecting). */
  rejectionReason?: string;

  /** Company user who reviewed. */
  reviewedBy?: UUID;

  /** Timestamp when the attempt was reviewed. */
  reviewedAt?: Date;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** Timestamp when the entity was last updated. */
  updatedAt: Date;
}
