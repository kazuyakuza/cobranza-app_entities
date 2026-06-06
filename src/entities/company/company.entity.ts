import type { UUID } from '../../types/common';
import type { JsonData } from '../../types/common';
import type { Location } from '../../types/location';

/**
 * SaaS client company (the main tenant).
 */
export interface Company {
  /** Primary key identifier. */
  id: UUID;

  /** Slug unique (`acme-servicios`, `lopez-contador`). Will be used in URLs. */
  friendlyUrl: string;

  /** Trade name / brand name. */
  name: string;

  /** Legal business name. */
  businessName?: string;

  /** Tax ID (e.g., CUIT, RUC, etc.). */
  taxId?: string;

  /** Email or contact information to be displayed to the end client. */
  contact: string;

  /** Contact phone. */
  phone?: string;

  /** Physical location of the company. */
  location?: Location;

  /** Logo URL. */
  logoUrl?: string;

  /** Whether the company is active. Default: true. */
  active: boolean;

  /** General company settings. */
  settings?: JsonData;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** Timestamp when the entity was last updated. */
  updatedAt: Date;
}
