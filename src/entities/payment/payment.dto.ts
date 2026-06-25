import type { Payment } from './payment.entity';

/**
 * Fields required to create a Payment.
 */
export type CreatePaymentDto = Omit<
  Payment,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

/**
 * Fields allowed when updating a Payment.
 */
export type UpdatePaymentDto = Partial<CreatePaymentDto>;

/**
 * Full Payment shape returned by the API.
 */
export type PaymentResponse = Payment;
