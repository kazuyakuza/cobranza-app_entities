import type { BankTransaction } from './bank-transaction.entity';

/**
 * Fields required to create a BankTransaction.
 *
 * Note: This DTO represents the canonical entity shape after encryption.
 * Consuming microservices should define their own API-level input DTOs
 * that accept plain strings for fields that will be encrypted at the
 * service layer.
 */
export type CreateBankTransactionDto = Omit<
  BankTransaction,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

/**
 * Fields allowed when updating a BankTransaction.
 * All fields inherit the encryption conventions from CreateBankTransactionDto.
 */
export type UpdateBankTransactionDto = Partial<CreateBankTransactionDto>;

/**
 * Full BankTransaction shape returned by the API.
 * Microservices may extend or remap this for decrypted responses.
 */
export type BankTransactionResponse = BankTransaction;
