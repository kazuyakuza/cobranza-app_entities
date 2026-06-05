import type { UUID } from '../../types/common';

/**
 * Roles (company_admin, company_operator, end_user, super_admin, etc.).
 */
export interface Role {
  /** Primary key identifier. */
  id: UUID;

  /** E.g., `company_admin`, `company_operator`, `end_user`, `super_admin`. */
  name: string;

  /** Role description. */
  description?: string;

  /** Timestamp when the entity was created. */
  createdAt: Date;
}
