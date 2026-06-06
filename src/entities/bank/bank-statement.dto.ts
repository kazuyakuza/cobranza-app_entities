import type { BankStatement } from './bank-statement.entity';

/**
 * Fields required to create a BankStatement.
 * Omits audit and derived fields.
 */
export type CreateBankStatementDto = Omit<BankStatement,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'totalTransactions'
>;

/**
 * Fields allowed when updating a BankStatement.
 */
export type UpdateBankStatementDto = Partial<CreateBankStatementDto>;

/**
 * Full BankStatement shape returned by the API.
 */
export interface BankStatementResponse extends BankStatement {}