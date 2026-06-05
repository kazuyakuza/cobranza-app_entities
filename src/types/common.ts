/**
 * Unique identifier type alias.
 * Used for all primary keys and foreign keys in the domain.
 */
export type UUID = string;

/**
 * Monetary amount type alias.
 * Stored as a string to preserve precision and avoid floating-point issues.
 */
export type Money = string;

/**
 * Decimal value type alias.
 * Used for all Decimal(precision, scale) columns (e.g., Decimal(12,2), Decimal(14,2), Decimal(5,4)).
 * Stored as a string to preserve precision.
 */
export type Decimal = string;

/**
 * JSONB data type alias.
 * Used for flexible JSON column storage.
 */
export type JsonData = Record<string, unknown>;

/**
 * ISO date string type alias.
 * Used for date-only fields when represented as a string (e.g., 'YYYY-MM-DD').
 */
export type DateString = string;