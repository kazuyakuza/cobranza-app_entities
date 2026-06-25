import type { Company } from './company.entity';

/**
 * Fields required to create a new Company.
 * Omits the system-managed BaseEntity audit fields (`id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `deletedAt`, `deletedBy`).
 *
 * Note: This DTO represents the canonical entity shape after encryption.
 * Consuming microservices should define their own API-level input DTOs
 * that accept plain strings for fields that will be encrypted at the
 * service layer.
 */
export type CreateCompanyDto = Omit<
  Company,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

/**
 * Fields allowed when updating a Company.
 * All fields inherit the encryption conventions from CreateCompanyDto.
 */
export type UpdateCompanyDto = Partial<CreateCompanyDto>;

/**
 * Full Company shape returned by the API.
 * Microservices may extend or remap this for decrypted responses.
 */
export type CompanyResponse = Company;
