import type { Company } from './company.entity';

/**
 * Fields required to create a new Company.
 * Omits system-generated `id`, `createdAt`, and `updatedAt`.
 *
 * Note: This DTO represents the canonical entity shape after encryption.
 * Consuming microservices should define their own API-level input DTOs
 * that accept plain strings for fields that will be encrypted at the
 * service layer.
 */
export type CreateCompanyDto = Omit<Company, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Fields allowed when updating a Company.
 * All creation fields are optional.
 */
export type UpdateCompanyDto = Partial<CreateCompanyDto>;

/**
 * Full Company shape returned by the API.
 * Microservices may extend or remap this for decrypted responses.
 */
export interface CompanyResponse extends Company {}
