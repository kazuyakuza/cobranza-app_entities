import { describe, it, expect } from 'vitest';
import type { BaseEntity } from '../interfaces/base-entity.interface';

describe('BaseEntity interface', () => {
  it('accepts a minimal entity with required audit fields only', () => {
    const entity = {
      id: 'entity-uuid',
      createdAt: new Date('2026-01-01'),
      createdBy: 'user-uuid',
    } satisfies BaseEntity;

    expect(entity.id).toBe('entity-uuid');
    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.createdBy).toBe('user-uuid');
  });

  it('accepts an entity with optional updated and soft-delete fields', () => {
    const entity = {
      id: 'entity-uuid',
      createdAt: new Date('2026-01-01'),
      createdBy: 'user-uuid',
      updatedAt: new Date('2026-01-02'),
      updatedBy: 'admin-uuid',
      deletedAt: new Date('2026-01-03'),
      deletedBy: 'admin-uuid',
    } satisfies BaseEntity;

    expect(entity.updatedAt).toBeInstanceOf(Date);
    expect(entity.deletedAt).toBeInstanceOf(Date);
    expect(entity.deletedBy).toBe('admin-uuid');
  });
});
