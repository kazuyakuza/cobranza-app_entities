import type { PaymentAttempt } from './payment-attempt.entity';

/**
 * Fields required to create a PaymentAttempt.
 * Omits audit and auto-filled fields managed by the system.
 */
export type CreatePaymentAttemptDto = Omit<
  PaymentAttempt,
  'id' | 'createdAt' | 'updatedAt' | 'reviewedBy' | 'reviewedAt' | 'amount' | 'currency'
>;

/**
 * Fields allowed when updating a PaymentAttempt.
 */
export type UpdatePaymentAttemptDto = Partial<CreatePaymentAttemptDto>;

/**
 * Full PaymentAttempt shape returned by the API.
 */
export interface PaymentAttemptResponse extends PaymentAttempt {}
