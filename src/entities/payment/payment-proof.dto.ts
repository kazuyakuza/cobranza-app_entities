import type { PaymentProof } from './payment-proof.entity';

/**
 * Fields required to create a PaymentProof.
 * Omits audit fields managed by the system.
 *
 * Note: This DTO represents the canonical entity shape after encryption.
 * Consuming microservices should define their own API-level input DTOs
 * that accept plain strings for fields that will be encrypted at the
 * service layer.
 */
export type CreatePaymentProofDto = Omit<PaymentProof, 'id' | 'createdAt' | 'createdBy'>;

/**
 * Fields allowed when updating a PaymentProof.
 * All fields inherit the encryption conventions from CreatePaymentProofDto.
 */
export type UpdatePaymentProofDto = Partial<CreatePaymentProofDto>;

/**
 * Full PaymentProof shape returned by the API.
 * Microservices may extend or remap this for decrypted responses.
 */
export interface PaymentProofResponse extends PaymentProof {}
