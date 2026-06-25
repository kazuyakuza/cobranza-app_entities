import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * Roles (company_admin, company_operator, end_user, super_admin, etc.).
 */
export interface Role extends BaseEntity {

  /** E.g., `company_admin`, `company_operator`, `end_user`, `super_admin`. */
  name: string;

  /** Role description. */
  description?: string;
}
