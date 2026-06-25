import { UUID } from '../types/common';

/**
 * Base entity interface that defines common fields shared by all domain entities.
 * Every entity supports soft deletion via `deletedAt` / `deletedBy`.
 */
export interface BaseEntity {
  /** Primary key identifier. */
  id: UUID;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** UUID of the user who created this entity. */
  createdBy: UUID;

  /** Timestamp when the entity was last updated. */
  updatedAt?: Date;

  /** UUID of the user who last updated this entity. */
  updatedBy?: UUID;

  /** Timestamp when the entity was soft-deleted. */
  deletedAt?: Date;

  /** UUID of the user who performed the soft deletion. */
  deletedBy?: UUID;
}
