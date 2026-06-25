import type { CompanyPlan } from './company-plan.entity';

/**
 * Fields required to create a CompanyPlan.
 */
export type CreateCompanyPlanDto = Omit<
  CompanyPlan,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

/**
 * Fields allowed when updating a CompanyPlan.
 */
export type UpdateCompanyPlanDto = Partial<CreateCompanyPlanDto>;

/**
 * Full CompanyPlan shape returned by the API.
 */
export type CompanyPlanResponse = CompanyPlan;
