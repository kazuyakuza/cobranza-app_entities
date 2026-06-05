# Task 2: Core Types & Base Interfaces — Implementation Plan

## Objective

Enhance `src/types/common.ts`, `src/interfaces/base-entity.interface.ts`, and the barrel/export infrastructure to provide a complete, JSDoc-documented type foundation for all domain entities.

## Current State Summary

| File | Status |
|------|--------|
| `src/types/common.ts` | Exists; only defines `UUID` and `Money` (no JSDoc) |
| `src/types/index.ts` | Exists; only re-exports `UUID` and `Money` |
| `src/interfaces/base-entity.interface.ts` | Exists; defines `BaseEntity` and `SoftDeletable` (no JSDoc) |
| `src/interfaces/index.ts` | Exists; correctly re-exports both interfaces |
| `src/enums/index.ts` | Exists; correctly re-exports 12 existing enum files |
| `src/enums/*.enum.ts` | 12 files exist; no JSDoc on any enum |
| `src/index.ts` | Empty (`export {}`) — does not expose the public API |

## Gap Analysis (from CSV)

### Type aliases missing from `common.ts`

| CSV Type | TypeScript Alias | Pattern |
|----------|-----------------|---------|
| `UUID` | `UUID` | Already exists ✓ |
| `Decimal(5,4)`, `Decimal(12,2)`, `Decimal(14,2)` | `Decimal` | Missing — must be `string` (precision-safe) |
| `JSONB` | `JsonData` | Missing — `Record<string, unknown>` |
| `Date` | `DateString` | Missing — semantic alias for ISO date strings |
| `Money` | `Money` | Already exists ✓ |

### Missing enum files (from CSV)

| CSV Property | Enum Name | Values (from CSV) |
|--------------|-----------|-------------------|
| `BankStatement.bank` | `Bank` | `GALICIA`, `BBVA`, `SANTANDER`, `BRUBANK`, `MERCADOPAGO`, etc. |
| `BankStatement.format` | `BankStatementFormat` | `PDF_TEXT`, `PDF_TABLA`, `EXCEL`, `CSV`, `API` |
| `Notification.status` | `NotificationStatus` | `PENDING`, `SENT`, `FAILED`, `CANCELLED` |
| `ClientDebtSummary.status` | `ClientDebtSummaryStatus` | `NORMAL`, `OVERDUE`, `INACTIVE` |

### BaseEntity audit

| Field | CSV Evidence | Decision |
|-------|------------|----------|
| `id` | Every entity has `id: UUID, Yes` | **Required** ✓ |
| `createdAt` | All entities have `created_at: Timestamp` except `PaymentMatch`/`ClientDebtSummary` | **Required** in `BaseEntity` (most common case) |
| `updatedAt` | Most entities have `updated_at: Timestamp` | **Required** in `BaseEntity` (15/20 entities) |
| `createdBy` | Many entities have `created_by: UUID, No` | **Optional** ✓ |
| `updatedBy` | Many entities have `updated_by: UUID, No` | **Optional** ✓ |
| `deletedAt` | Some entities have `deleted_at: Timestamp, No` | **Optional** in `SoftDeletable` ✓ |
| `deletedBy` | Some entities have `deleted_by: UUID, No` | **Optional** in `SoftDeletable` ✓ |

**Note:** Entities that do not have both `createdAt` and `updatedAt` (e.g., `PaymentProof`, `Notification`, `Role`, `PaymentMatch`, `ClientDebtSummary`) will define their own interfaces or use `Omit<BaseEntity, …>` when they are created in later tasks.

## Step-by-Step Implementation

### Step 1: Enhance `src/types/common.ts`

Replace the file with the following content (all types must have JSDoc):

```typescript
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
```

### Step 2: Update `src/types/index.ts`

Replace with:

```typescript
export { UUID, Money, Decimal, JsonData, DateString } from './common';
```

### Step 3: Add JSDoc to `src/interfaces/base-entity.interface.ts`

Replace with:

```typescript
import { UUID } from '../types/common';

/**
 * Base entity interface that defines common fields shared by most domain entities.
 */
export interface BaseEntity {
  /** Primary key identifier. */
  id: UUID;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** Timestamp when the entity was last updated. */
  updatedAt: Date;

  /** UUID of the user who created this entity. */
  createdBy?: UUID;

  /** UUID of the user who last updated this entity. */
  updatedBy?: UUID;
}

/**
 * Mixin interface for entities that support soft deletion.
 */
export interface SoftDeletable {
  /** Timestamp when the entity was soft-deleted. */
  deletedAt?: Date;

  /** UUID of the user who performed the soft deletion. */
  deletedBy?: UUID;
}
```

### Step 4: Verify `src/interfaces/index.ts`

File is already correct:

```typescript
export { BaseEntity, SoftDeletable } from './base-entity.interface';
```

No changes needed.

### Step 5: Create missing enum files

#### `src/enums/bank.enum.ts`

```typescript
/**
 * Supported banks for bank statement uploads.
 */
export enum Bank {
  GALICIA = 'GALICIA',
  BBVA = 'BBVA',
  SANTANDER = 'SANTANDER',
  BRUBANK = 'BRUBANK',
  MERCADOPAGO = 'MERCADOPAGO',
}
```

#### `src/enums/bank-statement-format.enum.ts`

```typescript
/**
 * Supported bank statement file formats.
 * Determines which parser to use for processing.
 */
export enum BankStatementFormat {
  PDF_TEXT = 'PDF_TEXT',
  PDF_TABLA = 'PDF_TABLA',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  API = 'API',
}
```

#### `src/enums/notification-status.enum.ts`

```typescript
/**
 * Notification delivery status.
 */
export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}
```

#### `src/enums/client-debt-summary-status.enum.ts`

```typescript
/**
 * Client debt summary status.
 */
export enum ClientDebtSummaryStatus {
  NORMAL = 'NORMAL',
  OVERDUE = 'OVERDUE',
  INACTIVE = 'INACTIVE',
}
```

### Step 6: Add JSDoc to existing enum files

For each of the 12 existing enum files, add a JSDoc block above the `enum` declaration describing its purpose.

#### `src/enums/debt-status.enum.ts`

```typescript
/**
 * Status of an individual debt.
 */
export enum DebtStatus {
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}
```

#### `src/enums/payment-status.enum.ts`

```typescript
/**
 * Status of a confirmed payment.
 */
export enum PaymentStatus {
  CONFIRMED = 'CONFIRMED',
  REFUNDED = 'REFUNDED',
}
```

#### `src/enums/payment-attempt-status.enum.ts`

```typescript
/**
 * Status of a payment proof upload attempt.
 */
export enum PaymentAttemptStatus {
  UPLOADED = 'UPLOADED',
  PARSE_FAILED = 'PARSE_FAILED',
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  MATCHED = 'MATCHED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
```

#### `src/enums/bank-statement-status.enum.ts`

```typescript
/**
 * Status of a bank statement upload and processing.
 */
export enum BankStatementStatus {
  UPLOADED = 'UPLOADED',
  PARSING = 'PARSING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
  MANUALLY_REVIEWED = 'MANUALLY_REVIEWED',
}
```

#### `src/enums/bank-transaction-status.enum.ts`

```typescript
/**
 * Status of a parsed bank transaction.
 */
export enum BankTransactionStatus {
  UNMATCHED = 'UNMATCHED',
  MATCHED = 'MATCHED',
  IGNORED = 'IGNORED',
}
```

#### `src/enums/notification-type.enum.ts`

```typescript
/**
 * Type of notification sent to a user or client.
 */
export enum NotificationType {
  PAYMENT_UPLOADED = 'PAYMENT_UPLOADED',
  PAYMENT_APPROVED = 'PAYMENT_APPROVED',
  PAYMENT_REJECTED = 'PAYMENT_REJECTED',
  DEBT_OVERDUE = 'DEBT_OVERDUE',
}
```

#### `src/enums/notification-channel.enum.ts`

```typescript
/**
 * Delivery channel for notifications.
 */
export enum NotificationChannel {
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
}
```

#### `src/enums/currency.enum.ts`

```typescript
/**
 * Supported currencies for monetary values.
 */
export enum Currency {
  ARS = 'ARS',
  USD = 'USD',
}
```

#### `src/enums/debt-schedule-frequency.enum.ts`

```typescript
/**
 * Frequency of a recurring debt schedule.
 */
export enum DebtScheduleFrequency {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  BIMONTHLY = 'BIMONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}
```

#### `src/enums/calculation-type.enum.ts`

```typescript
/**
 * Type of calculation used for a debt schedule amount.
 */
export enum CalculationType {
  FIXED = 'FIXED',
  FORMULA = 'FORMULA',
}
```

#### `src/enums/match-method.enum.ts`

```typescript
/**
 * Method used to match a payment attempt with a bank transaction.
 */
export enum MatchMethod {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
}
```

#### `src/enums/invoice-status.enum.ts`

```typescript
/**
 * Status of an invoice or promissory note.
 */
export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}
```

### Step 7: Update `src/enums/index.ts`

Replace with:

```typescript
export { Bank } from './bank.enum';
export { BankStatementFormat } from './bank-statement-format.enum';
export { BankStatementStatus } from './bank-statement-status.enum';
export { BankTransactionStatus } from './bank-transaction-status.enum';
export { CalculationType } from './calculation-type.enum';
export { ClientDebtSummaryStatus } from './client-debt-summary-status.enum';
export { Currency } from './currency.enum';
export { DebtScheduleFrequency } from './debt-schedule-frequency.enum';
export { DebtStatus } from './debt-status.enum';
export { InvoiceStatus } from './invoice-status.enum';
export { MatchMethod } from './match-method.enum';
export { NotificationChannel } from './notification-channel.enum';
export { NotificationStatus } from './notification-status.enum';
export { NotificationType } from './notification-type.enum';
export { PaymentAttemptStatus } from './payment-attempt-status.enum';
export { PaymentStatus } from './payment-status.enum';
```

### Step 8: Update `src/index.ts`

Replace with:

```typescript
export * from './enums';
export * from './interfaces';
export * from './types';
```

### Step 9: Verify `src/entities/index.ts`

Keep as `export {};` for now — entity interfaces will be created in later tasks.

### Step 10: Build verification

Run `npm run build` (or `npx tsc --noEmit`) to verify that:

1. All new enum files compile without errors.
2. All updated type and interface files compile without errors.
3. The root barrel (`src/index.ts`) re-exports all public symbols correctly.
4. No duplicate export name conflicts exist.

## Files to Create

| # | Path |
|---|------|
| 1 | `src/enums/bank.enum.ts` |
| 2 | `src/enums/bank-statement-format.enum.ts` |
| 3 | `src/enums/notification-status.enum.ts` |
| 4 | `src/enums/client-debt-summary-status.enum.ts` |

## Files to Modify

| # | Path | Change |
|---|------|--------|
| 1 | `src/types/common.ts` | Add `Decimal`, `JsonData`, `DateString`; add JSDoc |
| 2 | `src/types/index.ts` | Export new types |
| 3 | `src/interfaces/base-entity.interface.ts` | Add JSDoc |
| 4 | `src/enums/index.ts` | Add 4 new enum exports; ensure alphabetical order |
| 5 | `src/enums/debt-status.enum.ts` | Add JSDoc |
| 6 | `src/enums/payment-status.enum.ts` | Add JSDoc |
| 7 | `src/enums/payment-attempt-status.enum.ts` | Add JSDoc |
| 8 | `src/enums/bank-statement-status.enum.ts` | Add JSDoc |
| 9 | `src/enums/bank-transaction-status.enum.ts` | Add JSDoc |
| 10 | `src/enums/notification-type.enum.ts` | Add JSDoc |
| 11 | `src/enums/notification-channel.enum.ts` | Add JSDoc |
| 12 | `src/enums/currency.enum.ts` | Add JSDoc |
| 13 | `src/enums/debt-schedule-frequency.enum.ts` | Add JSDoc |
| 14 | `src/enums/calculation-type.enum.ts` | Add JSDoc |
| 15 | `src/enums/match-method.enum.ts` | Add JSDoc |
| 16 | `src/enums/invoice-status.enum.ts` | Add JSDoc |
| 17 | `src/index.ts` | Re-export public API |

## Post-Implementation Verification Checklist

- [ ] `src/types/common.ts` exports `UUID`, `Money`, `Decimal`, `JsonData`, `DateString` — all with JSDoc
- [ ] `src/types/index.ts` barrel exports all 5 types
- [ ] `src/interfaces/base-entity.interface.ts` exports `BaseEntity` and `SoftDeletable` — both with JSDoc
- [ ] `src/interfaces/index.ts` barrel exports both interfaces
- [ ] `src/enums/index.ts` barrel exports all 16 enums (12 existing + 4 new)
- [ ] All 16 enum files have JSDoc above their enum declaration
- [ ] `src/index.ts` re-exports `enums`, `interfaces`, and `types`
- [ ] TypeScript compilation passes with no errors
