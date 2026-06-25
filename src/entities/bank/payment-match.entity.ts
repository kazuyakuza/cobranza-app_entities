import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { MatchMethod } from '../../enums/match-method.enum';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * Record of successful matching.
 */
export interface PaymentMatch extends BaseEntity {
  /** Reference to the payment attempt. */
  paymentAttemptId: UUID;

  /** Reference to the bank transaction. */
  bankTransactionId: UUID;

  /** Reference to the company. */
  companyId: UUID;

  /** Amount used for the match (allows partial matches). */
  matchedAmount: Decimal;

  /** Automatic match score (0.00 - 100.00). */
  confidenceScore?: Decimal;

  /** `'AUTOMATIC'` or `'MANUAL'`. */
  matchedBy: MatchMethod;

  /** Timestamp when the match was made. */
  matchedAt: Date;

  /** Match notes (e.g., "match by amount + reference"). */
  notes?: string;
}
