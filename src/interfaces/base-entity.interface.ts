import { UUID } from '../types/common';

/**
 * Base entity interface that defines common fields shared by most domain entities.
 */
export interface BaseEntity {
  /** Primary key identifier. */
  id: UUID;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** Timestamp when the entity was last updated. */
  updatedAt: Date;

  /** UUID of the user who created this entity. */
  createdBy?: UUID;

  /** UUID of the user who last updated this entity. */
  updatedBy?: UUID;
}

/**
 * Mixin interface for entities that support soft deletion.
 */
export interface SoftDeletable {
  /** Timestamp when the entity was soft-deleted. */
  deletedAt?: Date;

  /** UUID of the user who performed the soft deletion. */
  deletedBy?: UUID;
}
