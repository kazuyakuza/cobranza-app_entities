import type { UUID } from '../../types/common';

/**
 * Any person with an account in the system (Company users + future End Users with login).
 */
export interface User {
  /** Primary key identifier. */
  id: UUID;

  /** Globally unique email. */
  email: string;

  /** Hashed password. */
  passwordHash?: string;

  /** Date of last password change. */
  passwordUpdatedAt?: Date;

  /** Optional full name (can be completed later). */
  fullName?: string;

  /** Phone number. */
  phone?: string;

  /** Whether the user is active. Default: true. */
  active: boolean;

  /** Whether the email is verified. Default: false. */
  emailVerified: boolean;

  /** Timestamp of the last login. */
  lastLoginAt?: Date;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** Timestamp when the entity was last updated. */
  updatedAt: Date;
}
