import type { UUID } from '../../types/common';

/**
 * Many-to-many relationship between User and Company + specific role within the company.
 */
export interface CompanyUser {
  /** Primary key identifier. */
  id: UUID;

  /** Reference to the company. */
  companyId: UUID;

  /** Reference to the user. */
  userId: UUID;

  /** Reference to the role. */
  roleId: UUID;

  /** Whether the relationship is active. Default: true. */
  active: boolean;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** Timestamp when the entity was last updated. */
  updatedAt: Date;
}
