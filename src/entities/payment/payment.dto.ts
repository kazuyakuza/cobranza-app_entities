import type { Payment } from './payment.entity';

/**
 * Fields required to create a Payment.
 */
export type CreatePaymentDto = Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>;

/**
 * Fields allowed when updating a Payment.
 */
export type UpdatePaymentDto = Partial<CreatePaymentDto>;

/**
 * Full Payment shape returned by the API.
 */
export interface PaymentResponse extends Payment {}