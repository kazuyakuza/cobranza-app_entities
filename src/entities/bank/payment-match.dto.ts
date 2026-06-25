import type { PaymentMatch } from './payment-match.entity';

/**
 * Fields required to create a PaymentMatch.
 * Omits system-generated `matchedAt`.
 */
export type CreatePaymentMatchDto = Omit<
  PaymentMatch,
  | 'id'
  | 'createdAt'
  | 'createdBy'
  | 'updatedAt'
  | 'updatedBy'
  | 'deletedAt'
  | 'deletedBy'
  | 'matchedAt'
>;

/**
 * Fields allowed when updating a PaymentMatch.
 */
export type UpdatePaymentMatchDto = Partial<CreatePaymentMatchDto>;

/**
 * Full PaymentMatch shape returned by the API.
 */
export type PaymentMatchResponse = PaymentMatch;
