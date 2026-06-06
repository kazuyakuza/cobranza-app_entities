import type { PaymentProof } from './payment-proof.entity';

/**
 * Fields required to create a PaymentProof.
 * Omits audit fields managed by the system.
 */
export type CreatePaymentProofDto = Omit<PaymentProof, 'id' | 'createdAt' | 'createdBy'>;

/**
 * Fields allowed when updating a PaymentProof.
 */
export type UpdatePaymentProofDto = Partial<CreatePaymentProofDto>;

/**
 * Full PaymentProof shape returned by the API.
 */
export interface PaymentProofResponse extends PaymentProof {}