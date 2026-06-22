import type { CompanyMonthlySummary } from './company-monthly-summary.entity';

/**
 * Fields required to create a CompanyMonthlySummary.
 */
export type CreateCompanyMonthlySummaryDto = Omit<
  CompanyMonthlySummary,
  'id' | 'createdAt' | 'updatedAt'
>;

/**
 * Fields allowed when updating a CompanyMonthlySummary.
 */
export type UpdateCompanyMonthlySummaryDto = Partial<CreateCompanyMonthlySummaryDto>;

/**
 * Full CompanyMonthlySummary shape returned by the API.
 */
export type CompanyMonthlySummaryResponse = CompanyMonthlySummary;
