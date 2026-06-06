import type { BankStatement } from './bank-statement.entity';

/**
 * Fields required to create a BankStatement.
 * Omits audit and derived fields.
 *
 * Note: This DTO represents the canonical entity shape after encryption.
 * Consuming microservices should define their own API-level input DTOs
 * that accept plain strings for fields that will be encrypted at the
 * service layer.
 */
export type CreateBankStatementDto = Omit<
  BankStatement,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'totalTransactions'
>;

/**
 * Fields allowed when updating a BankStatement.
 */
export type UpdateBankStatementDto = Partial<CreateBankStatementDto>;

/**
 * Full BankStatement shape returned by the API.
 * Microservices may extend or remap this for decrypted responses.
 */
export interface BankStatementResponse extends BankStatement {}
