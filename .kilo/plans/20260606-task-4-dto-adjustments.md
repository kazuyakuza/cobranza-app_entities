# Task 4: DTO & Schema Adjustments — Implementation Plan

**Date**: 2026-06-06
**Plan File**: `.kilo/plans/20260606-task-4-dto-adjustments.md`
**Global Plan**: `.kilo/plans/20260606-encryption-data-model-improvements.md`

---

## 1. Findings Summary

### 1.1 DTO Type Chain Compilation
- `npm run build` (uses `tsconfig.build.json`) **passes**.
- `npm run typecheck` (uses `tsconfig.json`, includes tests) **fails** in 2 test files that assign plain `string` values to fields now typed as `EncryptedValue`.
- The 7 DTO files themselves compile correctly; `Omit<Entity, ...>` and `Partial<CreateXxxDto>` correctly propagate the new `EncryptedValue` and `Location` types.

### 1.2 JSON Schema Verification
All 7 JSON schemas correctly reflect the updated entity types:

| Schema | EncryptedValue Fields | Hash Fields | Location Fields | Required Array |
|---|---|---|---|---|
| `company.schema.json` | `businessName`, `taxId`, `contact`, `phone` | `taxIdHash`, `contactHash` | `location` | Matches entity |
| `user.schema.json` | `fullName`, `phone` | — | — | Matches entity |
| `client.schema.json` | `fullName`, `email`, `phone`, `taxId` | `emailHash`, `taxIdHash` | `location` | Matches entity |
| `bank-transaction.schema.json` | `description`, `reference` | `referenceHash` | — | Matches entity |
| `bank-statement.schema.json` | `notes` | — | — | Matches entity |
| `notification.schema.json` | `to`, `from`, `subject`, `body` | — | — | Matches entity |
| `payment-proof.schema.json` | `notes` | — | — | Matches entity |

**No schema-entity mismatches found.**

### 1.3 Design Decision — Create DTOs and EncryptedValue

**Question**: `CreateXxxDto` inherits `EncryptedValue` types from `Omit<Entity, ...>`, but API callers send plain strings; encryption happens in the service layer.

**Evaluated Options**:
1. **Leave as-is**: Microservices handle the type mismatch at their own API layers.
2. **Create separate input types**: Adds `CreateXxxInputDto` with plain `string` for encrypted fields. Couples the entities library to a specific service architecture and duplicates type definitions.
3. **Document the convention**: Keep `CreateXxxDto` as the canonical entity shape. Add JSDoc explaining that consuming microservices define their own wire-level DTOs.

**Decision**: **Option 3 adopted.**

**Rationale**:
- This is an entities-only library; its job is to define canonical data shapes, not wire-level API contracts.
- Encryption/decryption happens in consuming microservices. Each microservice has its own framework (NestJS, Fastify, etc.) and validation layer (class-validator, Zod, etc.). The library should not prescribe API input shapes.
- Adding input-specific DTOs here would couple the library to a particular service architecture and increase maintenance surface.
- The `XxxResponse` interfaces extending `Entity` represent the full canonical shape (post-encryption for storage, or post-decryption if the microservice chooses to define its own response types).

---

## 2. Implementation Steps

### Step 2.1 — Add JSDoc to `company.dto.ts`

Update the JSDoc blocks to document the convention.

**File**: `src/entities/company/company.dto.ts`

```typescript
import type { Company } from './company.entity';

/**
 * Fields required to create a new Company.
 * Omits system-generated `id`, `createdAt`, and `updatedAt`.
 *
 * Note: This DTO represents the canonical entity shape after encryption.
 * Consuming microservices should define their own API-level input DTOs
 * that accept plain strings for fields that will be encrypted at the
 * service layer.
 */
export type CreateCompanyDto = Omit<Company, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Fields allowed when updating a Company.
 * All creation fields are optional.
 */
export type UpdateCompanyDto = Partial<CreateCompanyDto>;

/**
 * Full Company shape returned by the API.
 * Microservices may extend or remap this for decrypted responses.
 */
export interface CompanyResponse extends Company {}
```

### Step 2.2 — Add JSDoc to `user.dto.ts`

**File**: `src/entities/company/user.dto.ts`

```typescript
import type { User } from './user.entity';

/**
 * Fields required to create a User.
 * Omits system-managed identity and audit fields.
 *
 * Note: This DTO represents the canonical entity shape after encryption.
 * Consuming microservices should define their own API-level input DTOs
 * that accept plain strings for fields that will be encrypted at the
 * service layer.
 */
export type CreateUserDto = Omit<
  User,
  'id' | 'createdAt' | 'updatedAt' | 'passwordHash' | 'passwordUpdatedAt' | 'lastLoginAt'
>;

/**
 * Fields allowed when updating a User.
 */
export type UpdateUserDto = Partial<CreateUserDto>;

/**
 * Full User shape returned by the API.
 * Microservices may extend or remap this for decrypted responses.
 */
export interface UserResponse extends User {}
```

### Step 2.3 — Add JSDoc to `client.dto.ts`

**File**: `src/entities/client/client.dto.ts`

```typescript
import type { Client } from './client.entity';

/**
 * Fields required to create a Client.
 *
 * Note: This DTO represents the canonical entity shape after encryption.
 * Consuming microservices should define their own API-level input DTOs
 * that accept plain strings for fields that will be encrypted at the
 * service layer.
 */
export type CreateClientDto = Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>;

/**
 * Fields allowed when updating a Client.
 */
export type UpdateClientDto = Partial<CreateClientDto>;

/**
 * Full Client shape returned by the API.
 * Microservices may extend or remap this for decrypted responses.
 */
export interface ClientResponse extends Client {}
```

### Step 2.4 — Add JSDoc to `bank-transaction.dto.ts`

**File**: `src/entities/bank/bank-transaction.dto.ts`

```typescript
import type { BankTransaction } from './bank-transaction.entity';

/**
 * Fields required to create a BankTransaction.
 *
 * Note: This DTO represents the canonical entity shape after encryption.
 * Consuming microservices should define their own API-level input DTOs
 * that accept plain strings for fields that will be encrypted at the
 * service layer.
 */
export type CreateBankTransactionDto = Omit<BankTransaction, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Fields allowed when updating a BankTransaction.
 */
export type UpdateBankTransactionDto = Partial<CreateBankTransactionDto>;

/**
 * Full BankTransaction shape returned by the API.
 * Microservices may extend or remap this for decrypted responses.
 */
export interface BankTransactionResponse extends BankTransaction {}
```

### Step 2.5 — Add JSDoc to `bank-statement.dto.ts`

**File**: `src/entities/bank/bank-statement.dto.ts`

```typescript
import type { BankStatement } from './bank-statement.entity';

/**
 * Fields required to create a BankStatement.
 * Omits audit and derived fields.
 *
 * Note: This DTO represents the canonical entity shape after encryption.
 * Consuming microservices should define their own API-level input DTOs
 * that accept plain strings for fields that will be encrypted at the
 * service layer.
 */
export type CreateBankStatementDto = Omit<
  BankStatement,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'totalTransactions'
>;

/**
 * Fields allowed when updating a BankStatement.
 */
export type UpdateBankStatementDto = Partial<CreateBankStatementDto>;

/**
 * Full BankStatement shape returned by the API.
 * Microservices may extend or remap this for decrypted responses.
 */
export interface BankStatementResponse extends BankStatement {}
```

### Step 2.6 — Add JSDoc to `notification.dto.ts`

**File**: `src/entities/notification/notification.dto.ts`

```typescript
import type { Notification } from './notification.entity';

/**
 * Fields required to create a Notification.
 * Omits system-generated `sentAt`.
 *
 * Note: This DTO represents the canonical entity shape after encryption.
 * Consuming microservices should define their own API-level input DTOs
 * that accept plain strings for fields that will be encrypted at the
 * service layer.
 */
export type CreateNotificationDto = Omit<Notification, 'id' | 'createdAt' | 'sentAt'>;

/**
 * Fields allowed when updating a Notification.
 */
export type UpdateNotificationDto = Partial<CreateNotificationDto>;

/**
 * Full Notification shape returned by the API.
 * Microservices may extend or remap this for decrypted responses.
 */
export interface NotificationResponse extends Notification {}
```

### Step 2.7 — Add JSDoc to `payment-proof.dto.ts`

**File**: `src/entities/payment/payment-proof.dto.ts`

```typescript
import type { PaymentProof } from './payment-proof.entity';

/**
 * Fields required to create a PaymentProof.
 * Omits audit fields managed by the system.
 *
 * Note: This DTO represents the canonical entity shape after encryption.
 * Consuming microservices should define their own API-level input DTOs
 * that accept plain strings for fields that will be encrypted at the
 * service layer.
 */
export type CreatePaymentProofDto = Omit<PaymentProof, 'id' | 'createdAt' | 'createdBy'>;

/**
 * Fields allowed when updating a PaymentProof.
 */
export type UpdatePaymentProofDto = Partial<CreatePaymentProofDto>;

/**
 * Full PaymentProof shape returned by the API.
 * Microservices may extend or remap this for decrypted responses.
 */
export interface PaymentProofResponse extends PaymentProof {}
```

### Step 2.8 — Fix `company-and-client.test.ts`

**File**: `src/__tests__/entities/company-and-client.test.ts`

Update the test objects to provide valid `EncryptedValue` objects for required encrypted fields.

Replace:
```typescript
      contact: 'contact@acme.com',
```
With:
```typescript
      contact: { encryptedData: 'encrypted-contact', keyName: 'test-key' },
```

Replace:
```typescript
      fullName: 'Juan Perez',
```
With:
```typescript
      fullName: { encryptedData: 'encrypted-fullName', keyName: 'test-key' },
```

### Step 2.9 — Fix `notification-and-summary.test.ts`

**File**: `src/__tests__/entities/notification-and-summary.test.ts`

Update the test object to provide valid `EncryptedValue` objects for required encrypted fields.

Replace:
```typescript
      to: 'client@example.com',
      type: NotificationType.PAYMENT_UPLOADED,
      subject: 'Payment received',
      body: '<p>Thank you</p>',
```
With:
```typescript
      to: { encryptedData: 'encrypted-to', keyName: 'test-key' },
      type: NotificationType.PAYMENT_UPLOADED,
      subject: { encryptedData: 'encrypted-subject', keyName: 'test-key' },
      body: { encryptedData: 'encrypted-body', keyName: 'test-key' },
```

### Step 2.10 — Verify TypeScript Compilation

Run the following commands and confirm they exit with code 0:

```bash
npm run typecheck
npm run build
```

### Step 2.11 — Run Tests

```bash
npm run test
```

Ensure all tests pass after the test file updates.

### Step 2.12 — Commit Changes

```bash
git add src/entities/company/company.dto.ts
       src/entities/company/user.dto.ts
       src/entities/client/client.dto.ts
       src/entities/bank/bank-transaction.dto.ts
       src/entities/bank/bank-statement.dto.ts
       src/entities/notification/notification.dto.ts
       src/entities/payment/payment-proof.dto.ts
       src/__tests__/entities/company-and-client.test.ts
       src/__tests__/entities/notification-and-summary.test.ts
git commit -m "docs(dto): document wire-level DTO convention and fix test types for EncryptedValue fields"
```

---

## 3. Files Changed

| File | Change |
|---|---|
| `src/entities/company/company.dto.ts` | Add JSDoc documenting Option 3 convention |
| `src/entities/company/user.dto.ts` | Add JSDoc documenting Option 3 convention |
| `src/entities/client/client.dto.ts` | Add JSDoc documenting Option 3 convention |
| `src/entities/bank/bank-transaction.dto.ts` | Add JSDoc documenting Option 3 convention |
| `src/entities/bank/bank-statement.dto.ts` | Add JSDoc documenting Option 3 convention |
| `src/entities/notification/notification.dto.ts` | Add JSDoc documenting Option 3 convention |
| `src/entities/payment/payment-proof.dto.ts` | Add JSDoc documenting Option 3 convention |
| `src/__tests__/entities/company-and-client.test.ts` | Fix test data to use `EncryptedValue` objects |
| `src/__tests__/entities/notification-and-summary.test.ts` | Fix test data to use `EncryptedValue` objects |

---

## 4. Verification Checklist

- [ ] All 7 DTO files have updated JSDoc explaining the wire-level DTO convention.
- [ ] `npm run build` passes.
- [ ] `npm run typecheck` passes (no errors in DTOs or tests).
- [ ] `npm run test` passes.
- [ ] No JSON schema changes required (verified against entity types).
- [ ] Changes committed with meaningful message.
