import type { CompanyUser } from './company-user.entity';

/**
 * Fields required to create a CompanyUser relationship.
 */
export type CreateCompanyUserDto = Omit<CompanyUser, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Fields allowed when updating a CompanyUser relationship.
 */
export type UpdateCompanyUserDto = Partial<CreateCompanyUserDto>;

/**
 * Full CompanyUser shape returned by the API.
 */
export interface CompanyUserResponse extends CompanyUser {}
