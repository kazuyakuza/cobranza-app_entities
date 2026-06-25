import type { ClientDebtSummary } from './client-debt-summary.entity';

/**
 * Fields required to create a ClientDebtSummary.
 * Omits derived and audit fields.
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
  | 'lastPaymentId'
  | 'lastDebtId'
  | 'lastPaymentDate'
  | 'lastDebtDate'
>;

/**
 * Fields allowed when updating a ClientDebtSummary.
 */
export type UpdateClientDebtSummaryDto = Partial<CreateClientDebtSummaryDto>;

/**
 * Full ClientDebtSummary shape returned by the API.
 */
export type ClientDebtSummaryResponse = ClientDebtSummary;
