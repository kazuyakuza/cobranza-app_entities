import type { User } from './user.entity';

/**
 * Fields required to create a User.
 * Omits system-managed identity and audit fields.
 *
 * Note: This DTO represents the canonical entity shape after encryption.
 * Consuming microservices should define their own API-level input DTOs
 * that accept plain strings for fields that will be encrypted at the
 * service layer.
 */
export type CreateUserDto = Omit<
  User,
  | 'id'
  | 'createdAt'
  | 'createdBy'
  | 'updatedAt'
  | 'updatedBy'
  | 'deletedAt'
  | 'deletedBy'
  | 'passwordHash'
  | 'passwordUpdatedAt'
  | 'lastLoginAt'
>;

/**
 * Fields allowed when updating a User.
 * All fields inherit the encryption conventions from CreateUserDto.
 */
export type UpdateUserDto = Partial<CreateUserDto>;

/**
 * Full User shape returned by the API.
 * Microservices may extend or remap this for decrypted responses.
 */
export type UserResponse = User;
