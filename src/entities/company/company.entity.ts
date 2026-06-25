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

  /** Legal business name. */
  businessName?: EncryptedValue | null;

  /** Tax ID (e.g., CUIT, RUC, etc.). */
  taxId?: EncryptedValue | null;

  /** Hash of taxId for indexed search/lookup. */
  taxIdHash?: string | null;

  /** Email or contact information to be displayed to the end client. */
  contact: EncryptedValue;

  /** Hash of contact for indexed search/lookup. */
  contactHash?: string | null;

  /** Contact phone. */
  phone?: EncryptedValue | null;

  /** Physical location of the company. */
  location?: Location;

  /** Logo URL. */
  logoUrl?: string;

  /** Whether the company is active. Default: true. */
  active: boolean;

  /** General company settings. */
  settings?: JsonData;
}
