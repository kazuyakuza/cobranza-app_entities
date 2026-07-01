import type { BankStatement } from './bank-statement.entity';

/**
 * Broad DTO: omits only the BaseEntity audit fields.
 *
 * Note: This DTO represents the canonical entity shape after encryption.
 * Consuming microservices should define their own API-level input DTOs
 * that accept plain strings for fields that will be encrypted at the
 * service layer.
 */
export type CreateBankStatementDto = Omit<
  BankStatement,
  | 'id'
  | 'createdAt'
  | 'createdBy'
  | 'updatedAt'
  | 'updatedBy'
  | 'deletedAt'
  | 'deletedBy'
>;

/**
 * Fields allowed when updating a BankStatement.
 * All fields inherit the encryption conventions from CreateBankStatementDto.
 */
export type UpdateBankStatementDto = Partial<CreateBankStatementDto>;

/**
 * Full BankStatement shape returned by the API.
 * Microservices may extend or remap this for decrypted responses.
 */
export type BankStatementResponse = BankStatement;
