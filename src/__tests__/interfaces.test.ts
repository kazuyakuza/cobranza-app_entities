import { describe, it, expect } from 'vitest';
import type { BaseEntity, SoftDeletable } from '../interfaces/base-entity.interface';

describe('BaseEntity interface', () => {
  it('accepts a valid base entity object at compile time and runtime', () => {
    const entity = {
      id: 'entity-uuid',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
      createdBy: 'user-uuid',
      updatedBy: 'user-uuid',
    } satisfies BaseEntity;

    expect(entity.id).toBe('entity-uuid');
    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.updatedBy).toBe('user-uuid');
  });
});

describe('SoftDeletable interface', () => {
  it('accepts a valid soft-deletable object', () => {
    const deletable = {
      deletedAt: new Date('2026-01-03'),
      deletedBy: 'admin-uuid',
    } satisfies SoftDeletable;

    expect(deletable.deletedAt).toBeInstanceOf(Date);
    expect(deletable.deletedBy).toBe('admin-uuid');
  });
});
