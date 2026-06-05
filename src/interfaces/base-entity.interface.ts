import { UUID } from '../types/common';

export interface BaseEntity {
  id: UUID;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: UUID;
  updatedBy?: UUID;
}

export interface SoftDeletable {
  deletedAt?: Date;
  deletedBy?: UUID;
}
