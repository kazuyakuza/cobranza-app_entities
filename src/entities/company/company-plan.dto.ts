import type { CompanyPlan } from './company-plan.entity';

/**
 * Fields required to create a CompanyPlan.
 */
export type CreateCompanyPlanDto = Omit<CompanyPlan, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Fields allowed when updating a CompanyPlan.
 */
export type UpdateCompanyPlanDto = Partial<CreateCompanyPlanDto>;

/**
 * Full CompanyPlan shape returned by the API.
 */
export interface CompanyPlanResponse extends CompanyPlan {}