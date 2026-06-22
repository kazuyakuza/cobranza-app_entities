import type { Role } from './role.entity';

/**
 * Fields required to create a Role.
 */
export type CreateRoleDto = Omit<Role, 'id' | 'createdAt'>;

/**
 * Fields allowed when updating a Role.
 */
export type UpdateRoleDto = Partial<CreateRoleDto>;

/**
 * Full Role shape returned by the API.
 */
export type RoleResponse = Role;
