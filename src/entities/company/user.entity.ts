import type { EncryptedValue } from '../../types/encrypted';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * Any person with an account in the system (Company users + future End Users with login).
 */
export interface User extends BaseEntity {
  /** Globally unique email. */
  email: string;

  /** Hashed password. */
  passwordHash?: string;

  /** Date of last password change. */
  passwordUpdatedAt?: Date;

  /** Optional full name (can be completed later). */
  fullName?: EncryptedValue | null;

  /** Phone number. */
  phone?: EncryptedValue | null;

  /** Whether the user is active. Default: true. */
  active: boolean;

  /** Whether the email is verified. Default: false. */
  emailVerified: boolean;

  /** Timestamp of the last login. */
  lastLoginAt?: Date;
}
