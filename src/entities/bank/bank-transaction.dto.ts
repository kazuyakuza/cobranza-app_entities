import type { BankTransaction } from './bank-transaction.entity';

/**
 * Fields required to create a BankTransaction.
 */
export type CreateBankTransactionDto = Omit<BankTransaction, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Fields allowed when updating a BankTransaction.
 */
export type UpdateBankTransactionDto = Partial<CreateBankTransactionDto>;

/**
 * Full BankTransaction shape returned by the API.
 */
export interface BankTransactionResponse extends BankTransaction {}