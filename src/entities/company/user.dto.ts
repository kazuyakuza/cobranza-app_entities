import type { User } from './user.entity';

/**
 * Fields required to create a User.
 * Omits system-managed identity and audit fields.
 */
export type CreateUserDto = Omit<
  User,
  'id' | 'createdAt' | 'updatedAt' | 'passwordHash' | 'passwordUpdatedAt' | 'lastLoginAt'
>;

/**
 * Fields allowed when updating a User.
 */
export type UpdateUserDto = Partial<CreateUserDto>;

/**
 * Full User shape returned by the API.
 */
export interface UserResponse extends User {}
