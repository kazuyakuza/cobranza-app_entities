import type { Company } from './company.entity';

/**
 * Fields required to create a new Company.
 * Omits system-generated `id`, `createdAt`, and `updatedAt`.
 */
export type CreateCompanyDto = Omit<Company, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Fields allowed when updating a Company.
 * All creation fields are optional.
 */
export type UpdateCompanyDto = Partial<CreateCompanyDto>;

/**
 * Full Company shape returned by the API.
 */
export interface CompanyResponse extends Company {}