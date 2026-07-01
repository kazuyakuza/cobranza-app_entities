import type { ClientDebtSummary } from './client-debt-summary.entity';

/**
 * Broad DTO: omits only the BaseEntity audit fields.
 */
export type CreateClientDebtSummaryDto = Omit<
  ClientDebtSummary,
  | 'id'
  | 'createdAt'
  | 'createdBy'
  | 'updatedAt'
  | 'updatedBy'
  | 'deletedAt'
  | 'deletedBy'
>;

/**
 * Fields allowed when updating a ClientDebtSummary.
 */
export type UpdateClientDebtSummaryDto = Partial<CreateClientDebtSummaryDto>;

/**
 * Full ClientDebtSummary shape returned by the API.
 */
export type ClientDebtSummaryResponse = ClientDebtSummary;
