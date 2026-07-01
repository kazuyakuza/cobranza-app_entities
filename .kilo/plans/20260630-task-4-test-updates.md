# Plan — Task 4: Test Updates for Broad DTOs & Raw-String Encrypted Fields

**Date**: 2026-06-30
**Task**: 4 — Update tests to validate broad DTOs (Task 1 reverts) and raw-string acceptance in encrypted fields (Task 2 changes).
**Workflow step**: 4.1 — Analysis & Planning (architect)
**Scope**: Test files only (`src/__tests__/dtos.test.ts` + `src/__tests__/entities/*.test.ts`). NO production source changes.

---

## 1. Goal Summary

Validate, through tests, two post-refactor behaviors:

1. **7 reverted DTOs now include previously-stripped fields** (Task 1, broad `Omit<Entity, BaseAuditFields>` pattern).
2. **18 encrypted fields accept raw `string`** alongside `EncryptedValue` (Task 2 widening to `EncryptedValue | string | null` / `EncryptedValue | string`).

Coverage spans two layers:
- **Type-level (compile-time)** assertions in `dtos.test.ts` (proves the type contract).
- **Runtime** assertions in `entities/*.test.ts` (proves objects satisfy the entity interface with raw strings).

---

## 2. Pre-Analysis — Verified Facts

### 2.1 Test infrastructure

- Runner: **Vitest** (`vitest run`); executed via `npm test`.
- Existing type-level helpers in `dtos.test.ts` (lines 29–40):
  - `HasKey<T, K>` → `true` when `K` is a key of `T`.
  - `OmitsKey<T, K>` → `true` when `K` is NOT a key of `T`.
  - `ExcludesAudit<T>` → `true` when `T` has NO BaseEntity audit key.
  - `Assert<T extends true>` — compile-time guard; failure = type error → test fails to compile.
- Pattern for runtime assertions: literal objects annotated `satisfies Entity` (or `: Entity`) with `expect(...)` on values.
- `max-lines-per-file` rule (≤200 lines) applies to test files (they live under `src/`). Current line counts:
  - `dtos.test.ts`: 84 lines
  - `company-and-client.test.ts`: 67 lines
  - `debt-and-payment.test.ts`: 69 lines
  - `bank-and-invoice.test.ts`: 51 lines
  - `notification-and-summary.test.ts`: 48 lines
  - All remain well under 200 after additions.

### 2.2 The 7 reverted DTOs and the fields they now include

All DTOs use `Omit<Entity, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'>`. The fields below were previously stripped and must now be provably present:

| DTO | Re-included field(s) | Optional? |
|---|---|---|
| `CreateBankStatementDto` | `totalTransactions` | optional |
| `CreatePaymentMatchDto` | `matchedAt` | **required** (Date) |
| `CreateUserDto` | `passwordHash`, `passwordUpdatedAt`, `lastLoginAt` | all optional |
| `CreateDebtScheduleDto` | `lastGeneratedDate` | optional |
| `CreatePaymentAttemptDto` | `reviewedBy`, `reviewedAt`, `amount`, `currency` | all optional |
| `CreateNotificationDto` | `sentAt` | optional |
| `CreateClientDebtSummaryDto` | `lastPaymentId`, `lastDebtId`, `lastPaymentDate`, `lastDebtDate` | all optional |

Assertion strategy: `Assert<HasKey<Dto, 'field'>>` → resolves to `Assert<true>` → compiles.

Field presence count: 1 + 1 + 3 + 1 + 4 + 1 + 4 = **15 distinct re-included fields** across the 7 DTOs.

### 2.3 The 18 encrypted fields (Task 2 widening)

| Entity | Field(s) | Type |
|---|---|---|
| `Company` | `businessName`, `taxId`, `contact`, `phone` | `EncryptedValue \| string \| null` |
| `Client` | `fullName`, `email`, `phone`, `taxId` | `EncryptedValue \| string \| null` |
| `User` | `fullName`, `phone` | `EncryptedValue \| string \| null` |
| `BankTransaction` | `description` (required), `reference` (optional) | `EncryptedValue \| string` (+ `null` for `reference`) |
| `BankStatement` | `notes` | `EncryptedValue \| string \| null` |
| `PaymentProof` | `notes` | `EncryptedValue \| string \| null` |
| `Notification` | `to`, `subject`, `body` (required); `from` (optional) | `EncryptedValue \| string` (+ `null` for `from`) |

Total: 4 + 4 + 2 + 2 + 1 + 1 + 4 = **18 fields**.

### 2.4 Enum import style

Enums are string-valued `enum`s (e.g., `NotificationType.PAYMENT_UPLOADED === 'PAYMENT_UPLOADED'`). Tests import enum members directly. Required new imports for `dtos.test.ts`:
- `Bank`, `BankStatementFormat`, `BankStatementStatus` (`CreateBankStatementDto` raw-string compile check)
- `NotificationType`, `NotificationChannel`, `NotificationStatus` (`CreateNotificationDto` raw-string compile check)

(`Currency`, `BankTransactionStatus` already imported.) `MatchMethod` is NOT needed — `CreatePaymentMatchDto` has no encrypted fields and is not used in raw-string checks.

### 2.5 Rules compliance

- `max-depth` (≤2): existing tests use flat objects; raw-string tests stay flat.
- `max-lines-per-method` (≤50): each `it(...)` stays short.
- `single-section-boolean-conditions`: only single `Assert<...>` / `expect(...)` calls; no compound conditions.
- `no-commented-code`: no commented-out code will be added.
- `self-documenting-code`: descriptive test names.
- No production files modified → no `src/entities/**` changes → no risk to barrel exports.

---

## 3. High-Level Approach

Two-phase edit, no git work in this step (4.1 is plan-only):

**Phase A — `dtos.test.ts` additions (type-level):**
- A1: Add the 15 `HasKey` assertions for the 7 reverted DTOs.
- A2: Add 4 compile-time raw-string acceptance checks (representative DTOs).

**Phase B — `entities/*.test.ts` additions (runtime):**
- B1: Company + Client raw-string tests (`company-and-client.test.ts`).
- B2: User raw-string test added to `company-and-client.test.ts`.
- B3: BankStatement + new BankTransaction describe with raw strings (`bank-and-invoice.test.ts`).
- B4: Notification raw-string test (`notification-and-summary.test.ts`).
- B5: New PaymentProof describe with raw strings (`debt-and-payment.test.ts`).

**Phase C — Verification (executed in step 4.2/4.5, recorded here):**
- `npm run typecheck` + `npm test` must pass.

This covers all 18 encrypted fields across 7 entities in runtime tests and 4 representative DTOs in compile-time tests (exceeds the "at least 3-4" minimum).

---

## 4. Detailed Per-File Checklist

### 4.1 File: `src/__tests__/dtos.test.ts`

**Edit 1 — Imports (top of file):** Add 6 missing enum imports.
```ts
import { Bank } from '../enums/bank.enum';
import { BankStatementFormat } from '../enums/bank-statement-format.enum';
import { BankStatementStatus } from '../enums/bank-statement-status.enum';
import { NotificationType } from '../enums/notification-type.enum';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationStatus } from '../enums/notification-status.enum';
```

**Edit 2 — New `describe` block for reverted-DTO field inclusion.** Append after the existing closing `});` of the current `describe(...)` (line 84). Use `HasKey` + `Assert` pattern.
```ts
describe('Reverted broad DTOs include previously-stripped fields (Task 1)', () => {
  it('CreateBankStatementDto keeps totalTransactions', () => {
    type _a = Assert<HasKey<CreateBankStatementDto, 'totalTransactions'>>;
    expect(true).toBe(true);
  });

  it('CreatePaymentMatchDto keeps matchedAt (required)', () => {
    type _a = Assert<HasKey<CreatePaymentMatchDto, 'matchedAt'>>;
    expect(true).toBe(true);
  });

  it('CreateUserDto keeps passwordHash, passwordUpdatedAt, lastLoginAt', () => {
    type _a = Assert<HasKey<CreateUserDto, 'passwordHash'>>;
    type _b = Assert<HasKey<CreateUserDto, 'passwordUpdatedAt'>>;
    type _c = Assert<HasKey<CreateUserDto, 'lastLoginAt'>>;
    expect(true).toBe(true);
  });

  it('CreateDebtScheduleDto keeps lastGeneratedDate', () => {
    type _a = Assert<HasKey<CreateDebtScheduleDto, 'lastGeneratedDate'>>;
    expect(true).toBe(true);
  });

  it('CreatePaymentAttemptDto keeps reviewedBy, reviewedAt, amount, currency', () => {
    type _a = Assert<HasKey<CreatePaymentAttemptDto, 'reviewedBy'>>;
    type _b = Assert<HasKey<CreatePaymentAttemptDto, 'reviewedAt'>>;
    type _c = Assert<HasKey<CreatePaymentAttemptDto, 'amount'>>;
    type _d = Assert<HasKey<CreatePaymentAttemptDto, 'currency'>>;
    expect(true).toBe(true);
  });

  it('CreateNotificationDto keeps sentAt', () => {
    type _a = Assert<HasKey<CreateNotificationDto, 'sentAt'>>;
    expect(true).toBe(true);
  });

  it('CreateClientDebtSummaryDto keeps lastPaymentId, lastDebtId, lastPaymentDate, lastDebtDate', () => {
    type _a = Assert<HasKey<CreateClientDebtSummaryDto, 'lastPaymentId'>>;
    type _b = Assert<HasKey<CreateClientDebtSummaryDto, 'lastDebtId'>>;
    type _c = Assert<HasKey<CreateClientDebtSummaryDto, 'lastPaymentDate'>>;
    type _d = Assert<HasKey<CreateClientDebtSummaryDto, 'lastDebtDate'>>;
    expect(true).toBe(true);
  });
});
```

**Edit 3 — New `describe` block for raw-string acceptance in encrypted fields (compile-time).** Append after the block above. 4 representative DTOs: `CreateCompanyDto`, `CreateClientDto`, `CreateNotificationDto`, `CreateBankStatementDto`.
```ts
describe('Encrypted fields accept raw strings at compile time (Task 2)', () => {
  it('CreateCompanyDto accepts raw strings for businessName, contact, phone', () => {
    const dto = {
      friendlyUrl: 'acme-slug',
      name: 'Acme',
      active: true,
      businessName: 'Acme Legal S.A.',
      contact: 'no-reply@acme.com',
      phone: '+541112345678',
    } satisfies CreateCompanyDto;
    expect(dto.businessName).toBe('Acme Legal S.A.');
    expect(dto.contact).toBe('no-reply@acme.com');
  });

  it('CreateClientDto accepts raw strings for fullName, email, phone, taxId', () => {
    const dto = {
      companyId: 'comp-uuid',
      clientCode: 'CLI-00042',
      active: true,
      fullName: 'Juan Perez',
      email: 'juan@example.com',
      phone: '+541112345678',
      taxId: '20-12345678-9',
    } satisfies CreateClientDto;
    expect(dto.fullName).toBe('Juan Perez');
    expect(dto.email).toBe('juan@example.com');
  });

  it('CreateNotificationDto accepts raw strings for to, from, subject, body', () => {
    const dto = {
      companyId: 'comp-uuid',
      to: 'client@example.com',
      from: 'no-reply@cobranza.app',
      type: NotificationType.PAYMENT_UPLOADED,
      subject: 'Your payment was uploaded',
      body: 'We received your payment proof',
      channel: NotificationChannel.EMAIL,
      status: NotificationStatus.SENT,
    } satisfies CreateNotificationDto;
    expect(dto.to).toBe('client@example.com');
    expect(dto.subject).toBe('Your payment was uploaded');
  });

  it('CreateBankStatementDto accepts raw string for notes', () => {
    const dto = {
      companyId: 'comp-uuid',
      bank: Bank.GALICIA,
      format: BankStatementFormat.CSV,
      fileUrl: 'https://example.com/stmt.csv',
      fileName: 'stmt.csv',
      status: BankStatementStatus.UPLOADED,
      notes: 'parser warning on line 42',
    } satisfies CreateBankStatementDto;
    expect(dto.notes).toBe('parser warning on line 42');
  });
});
```

**Edit 4 — eslint:** file-top `/* eslint-disable @typescript-eslint/no-unused-vars */` already present (line 1). The `type _a = ...` aliases are unused by design; existing disable covers this. No change needed.

**Verification:** `npm run typecheck` must pass (proves all `Assert<HasKey<...>>` and `satisfies Create...Dto` compile).

---

### 4.2 File: `src/__tests__/entities/company-and-client.test.ts`

**Edit 1 — Add User import**:
```ts
import type { User } from '../../entities/company/user.entity';
```

**Edit 2 — Add `it(...)` inside existing `describe('Company entity', ...)`**:
```ts
  it('accepts raw strings in encrypted businessName, contact, phone', () => {
    const company = {
      id: 'comp-uuid-3',
      friendlyUrl: 'acme-legal',
      name: 'Acme Legal',
      businessName: 'Acme Servicios Legales S.A.',
      contact: 'no-reply@acme-legal.com',
      phone: '+541112345678',
      active: true,
      createdAt: new Date(),
      createdBy: 'user-uuid',
      updatedAt: new Date(),
    } satisfies Company;

    expect(company.businessName).toBe('Acme Servicios Legales S.A.');
    expect(company.contact).toBe('no-reply@acme-legal.com');
    expect(company.phone).toBe('+541112345678');
  });
```

**Edit 3 — Add `it(...)` inside existing `describe('Client entity', ...)`**:
```ts
  it('accepts raw strings in encrypted fullName, email, phone, taxId', () => {
    const client = {
      id: 'client-uuid-3',
      companyId: 'comp-uuid',
      clientCode: 'CLI-00044',
      fullName: 'Maria Lopez',
      email: 'maria@example.com',
      phone: '+541187654321',
      taxId: '27-12345678-3',
      active: true,
      createdAt: new Date(),
      createdBy: 'user-uuid',
      updatedAt: new Date(),
    } satisfies Client;

    expect(client.fullName).toBe('Maria Lopez');
    expect(client.email).toBe('maria@example.com');
    expect(client.taxId).toBe('27-12345678-3');
  });
```

**Edit 4 — Add new `describe('User entity', ...)`** at end:
```ts
describe('User entity', () => {
  it('accepts raw strings in encrypted fullName, phone', () => {
    const user = {
      id: 'user-uuid-raw',
      email: 'user@example.com',
      fullName: 'Pedro Ruiz',
      phone: '+541112223344',
      active: true,
      emailVerified: true,
      createdAt: new Date(),
      createdBy: 'admin-uuid',
      updatedAt: new Date(),
    } satisfies User;

    expect(user.fullName).toBe('Pedro Ruiz');
    expect(user.phone).toBe('+541112223344');
  });
});
```

**Verification:** `npm test` + `npm run typecheck`.

---

### 4.3 File: `src/__tests__/entities/bank-and-invoice.test.ts`

**Edit 1 — Add imports**:
```ts
import type { BankTransaction } from '../../entities/bank/bank-transaction.entity';
import { BankTransactionStatus } from '../../enums/bank-transaction-status.enum';
```

**Edit 2 — Add `it(...)` inside existing `describe('BankStatement entity', ...)`** for raw `notes`:
```ts
  it('accepts raw string in encrypted notes', () => {
    const statement = {
      id: 'stmt-uuid-2',
      companyId: 'comp-uuid',
      bank: Bank.GALICIA,
      format: BankStatementFormat.CSV,
      fileUrl: 'https://example.com/stmt2.csv',
      fileName: 'stmt2.csv',
      status: BankStatementStatus.UPLOADED,
      notes: 'partial parse warning',
      createdAt: new Date(),
      createdBy: 'user-uuid',
      updatedAt: new Date(),
    } satisfies BankStatement;

    expect(statement.notes).toBe('partial parse warning');
  });
```

**Edit 3 — Add new `describe('BankTransaction entity', ...)`** at end:
```ts
describe('BankTransaction entity', () => {
  it('accepts raw strings in encrypted description and reference', () => {
    const transaction = {
      id: 'txn-uuid',
      bankStatementId: 'stmt-uuid',
      companyId: 'comp-uuid',
      transactionDate: new Date(),
      amount: '100.00',
      currency: Currency.ARS,
      description: 'TRANSFERENCIA RECIBIDA',
      reference: 'CBU 0001234567890123456789',
      status: BankTransactionStatus.UNMATCHED,
      createdAt: new Date(),
      createdBy: 'user-uuid',
      updatedAt: new Date(),
    } satisfies BankTransaction;

    expect(transaction.description).toBe('TRANSFERENCIA RECIBIDA');
    expect(transaction.reference).toBe('CBU 0001234567890123456789');
  });
});
```

> `Currency` already imported in this file. `BankTransactionStatus.UNMATCHED` confirmed present (used in `dtos.test.ts` line 80).

**Verification:** `npm test` + `npm run typecheck`.

---

### 4.4 File: `src/__tests__/entities/notification-and-summary.test.ts`

**Edit 1 — Add `it(...)` inside existing `describe('Notification entity', ...)`** for raw strings in `to`, `from`, `subject`, `body`:
```ts
  it('accepts raw strings in encrypted to, from, subject, body', () => {
    const notification = {
      id: 'notif-uuid-2',
      companyId: 'comp-uuid',
      to: 'cliente@example.com',
      from: 'no-reply@cobranza.app',
      type: NotificationType.PAYMENT_UPLOADED,
      subject: 'Comprobante de pago recibido',
      body: 'Hemos recibido su comprobante de pago',
      channel: NotificationChannel.EMAIL,
      status: NotificationStatus.SENT,
      createdAt: new Date(),
      createdBy: 'user-uuid',
    } satisfies Notification;

    expect(notification.to).toBe('cliente@example.com');
    expect(notification.from).toBe('no-reply@cobranza.app');
    expect(notification.subject).toBe('Comprobante de pago recibido');
    expect(notification.body).toBe('Hemos recibido su comprobante de pago');
  });
```

> Enum imports (`NotificationType`, `NotificationChannel`, `NotificationStatus`) already present (lines 4–6). No new imports needed.

**Verification:** `npm test` + `npm run typecheck`.

---

### 4.5 File: `src/__tests__/entities/debt-and-payment.test.ts`

**Edit 1 — Add import**:
```ts
import type { PaymentProof } from '../../entities/payment/payment-proof.entity';
```

**Edit 2 — Add new `describe('PaymentProof entity', ...)`** at end:
```ts
describe('PaymentProof entity', () => {
  it('accepts raw string in encrypted notes', () => {
    const proof = {
      id: 'proof-uuid',
      companyId: 'comp-uuid',
      clientId: 'client-uuid',
      fileUrl: 'https://example.com/proof.jpg',
      fileName: 'proof.jpg',
      notes: 'pago parcial del mes',
      createdAt: new Date(),
      createdBy: 'client-uuid',
      updatedAt: new Date(),
    } satisfies PaymentProof;

    expect(proof.notes).toBe('pago parcial del mes');
  });
});
```

**Verification:** `npm test` + `npm run typecheck`.

---

## 5. Execution Sequence (for step 4.2 implementer)

1. **Step 4.1 (THIS STEP)**: plan saved, presented for approval.
2. **4.2 Implementation** (implementer): apply edits per file above IN THIS ORDER:
   1. `dtos.test.ts` (imports → reverted-DTO block → raw-string block)
   2. `company-and-client.test.ts`
   3. `bank-and-invoice.test.ts`
   4. `notification-and-summary.test.ts`
   5. `debt-and-payment.test.ts`
3. After all edits: run console commands (use `bash` tool, separate calls, no `&&` chaining):
   - `npm run typecheck`
   - `npm test`
4. If both pass → commit with message: `test: validate broad DTO inclusion and raw-string encrypted fields`
5. If either fails → diagnose, fix, re-run (max 3); on persistent failure escalate to plan agent.

---

## 6. Verification Criteria (step 4.5 architect)

- [ ] `dtos.test.ts` contains 15 `Assert<HasKey<...>>` type lines covering all 15 re-included fields across the 7 reverted DTOs.
- [ ] `dtos.test.ts` contains 4 compile-time `satisfies Create...Dto` blocks with raw-string encrypted fields.
- [ ] Runtime raw-string tests exist for **all 18 encrypted fields** across Company (4), Client (4), User (2), BankTransaction (2), BankStatement (1), PaymentProof (1), Notification (4).
- [ ] `npm run typecheck` exits 0.
- [ ] `npm test` exits 0 (all suites pass).
- [ ] No production (`src/entities/**`, `src/types/**`, etc.) files modified.
- [ ] No file exceeds 200 lines.
- [ ] No commented-out code added.

---

## 7. Risks & Notes

- **Risk**: A reverted DTO's re-included field is typed as `Date` and the test only checks `HasKey` (not assignability). This is intentional — the contract under test is presence/re-inclusion, not value shape. Runtime Date handling is covered by entity tests.
- **Risk**: `BankTransactionStatus.UNMATCHED` — confirmed present (used in `dtos.test.ts` line 80).
- **Risk**: `max-lines-per-file` for `company-and-client.test.ts` after additions — projected ~150 lines (current 67 + ~83). Within 200 limit.
- **Note**: `CreatePaymentMatchDto` has no encrypted fields → not used in raw-string compile-time checks; only `HasKey` check for `matchedAt`.
- **Note**: All raw-string runtime objects use full audit fields (`id`, `createdAt`, `createdBy`) because the **entity** (not DTO) is the `satisfies` target, and `id`/`createdAt`/`createdBy` are required on `BaseEntity`. This matches existing entity-test conventions.

---

## 8. Out of Scope

- No DTO/source changes (Task 1 & Task 2 already done).
- No schema (`src/schemas/**`) changes.
- No documentation updates (handled in step 4.4).
- No git branch operations (handled in steps 2 / 4.6 / 5).