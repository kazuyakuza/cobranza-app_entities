/**
 * Structured postal address.
 */
export interface Address {
  /** Primary street address line. */
  addressLine1: string;

  /** Secondary street address line (apartment, suite, floor, etc.). */
  addressLine2?: string;
}

/**
 * Location represents a physical place associated with an entity.
 * Contains a structured address plus optional geographic/administrative fields.
 */
export interface Location {
  /** Structured postal address. */
  address: Address;

  /** City or locality name. */
  city?: string;

  /** State, province, or region. */
  state?: string;

  /** Postal or ZIP code. */
  zipCode?: string;

  /** ISO country name or code. */
  country?: string;
}