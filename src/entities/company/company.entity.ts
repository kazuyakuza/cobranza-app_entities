import type { JsonData } from '../../types/common';
import type { Location } from '../../types/location';
import type { EncryptedValue } from '../../types/encrypted';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * SaaS client company (the main tenant).
 */
export interface Company extends BaseEntity {
  /** Slug unique (`acme-servicios`, `lopez-contador`). Will be used in URLs. */
  friendlyUrl: string;

  /** Trade name / brand name. */
  name: string;

  /**
   * Legal business name.
   * Accepts `EncryptedValue | string | null`. Microservices may pass raw strings before encryption.
   */
  businessName?: EncryptedValue | string | null;

  /**
   * Tax ID (e.g., CUIT, RUC, etc.).
   * Accepts `EncryptedValue | string | null`. Microservices may pass raw strings before encryption.
   */
  taxId?: EncryptedValue | string | null;

  /** Hash of taxId for indexed search/lookup. */
  taxIdHash?: string | null;

  /**
   * Email or contact information to be displayed to the end client. Optional.
   * Accepts `EncryptedValue | string | null`. Microservices may pass raw strings before encryption.
   */
  contact?: EncryptedValue | string | null;

  /** Hash of contact for indexed search/lookup. */
  contactHash?: string | null;

  /**
   * Contact phone.
   * Accepts `EncryptedValue | string | null`. Microservices may pass raw strings before encryption.
   */
  phone?: EncryptedValue | string | null;

  /** Physical location of the company. */
  location?: Location;

  /** Logo URL. */
  logoUrl?: string;

  /** Whether the company is active. Default: true. */
  active: boolean;

  /** General company settings. */
  settings?: JsonData;
}
