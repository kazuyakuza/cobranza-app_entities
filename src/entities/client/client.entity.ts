import type { UUID } from '../../types/common';
import type { JsonData } from '../../types/common';
import type { Location } from '../../types/location';
import type { EncryptedValue } from '../../types/encrypted';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * End client / debtor of a Company.
 */
export interface Client extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** Unique code per Company (e.g., `CLI-00042`). */
  clientCode: string;

  /**
   * Full name of the debtor. Optional; may be completed later.
   * Accepts `EncryptedValue | string | null`. Microservices may pass raw strings before encryption.
   */
  fullName?: EncryptedValue | string | null;

  /**
   * Email. Highly recommended.
   * Accepts `EncryptedValue | string | null`. Microservices may pass raw strings before encryption.
   */
  email?: EncryptedValue | string | null;

  /** Hash of email for indexed search/lookup. */
  emailHash?: string | null;

  /**
   * Phone number.
   * Accepts `EncryptedValue | string | null`. Microservices may pass raw strings before encryption.
   */
  phone?: EncryptedValue | string | null;

  /** Physical location of the client. */
  location?: Location;

  /**
   * National ID / Tax ID of the end client (e.g., DNI, CUIT).
   * Accepts `EncryptedValue | string | null`. Microservices may pass raw strings before encryption.
   */
  taxId?: EncryptedValue | string | null;

  /** Hash of taxId for indexed search/lookup. */
  taxIdHash?: string | null;

  /** Custom fields (e.g., `{ "dni": "...", "category": "..." }`). */
  extraData?: JsonData;

  /** Whether the client is active. Default: true. */
  active: boolean;

  /** Internal notes. */
  notes?: string;
}
