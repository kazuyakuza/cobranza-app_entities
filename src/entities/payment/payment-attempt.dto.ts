import type { PaymentAttempt } from './payment-attempt.entity';

/**
 * Broad DTO: omits only the BaseEntity audit fields.
 */
export type CreatePaymentAttemptDto = Omit<
  PaymentAttempt,
  | 'id'
  | 'createdAt'
  | 'createdBy'
  | 'updatedAt'
  | 'updatedBy'
  | 'deletedAt'
  | 'deletedBy'
>;

/**
 * Fields allowed when updating a PaymentAttempt.
 */
export type UpdatePaymentAttemptDto = Partial<CreatePaymentAttemptDto>;

/**
 * Full PaymentAttempt shape returned by the API.
 */
export type PaymentAttemptResponse = PaymentAttempt;
