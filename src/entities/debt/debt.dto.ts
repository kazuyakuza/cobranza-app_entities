import type { Debt } from './debt.entity';

/**
 * Fields required to create a Debt.
 * Omits `BaseEntity` audit fields.
 */
export type CreateDebtDto = Omit<
  Debt,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

/**
 * Fields allowed when updating a Debt.
 */
export type UpdateDebtDto = Partial<CreateDebtDto>;

/**
 * Full Debt shape returned by the API.
 */
export type DebtResponse = Debt;
