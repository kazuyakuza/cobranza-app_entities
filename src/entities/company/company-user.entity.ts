import type { UUID } from '../../types/common';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * Many-to-many relationship between User and Company + specific role within the company.
 */
export interface CompanyUser extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** Reference to the user. */
  userId: UUID;

  /** Reference to the role. */
  roleId: UUID;

  /** Whether the relationship is active. Default: true. */
  active: boolean;
}
