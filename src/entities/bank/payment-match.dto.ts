import type { PaymentMatch } from './payment-match.entity';

/**
 * Broad DTO: omits only the BaseEntity audit fields.
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
>;

/**
 * Fields allowed when updating a PaymentMatch.
 */
export type UpdatePaymentMatchDto = Partial<CreatePaymentMatchDto>;

/**
 * Full PaymentMatch shape returned by the API.
 */
export type PaymentMatchResponse = PaymentMatch;
