# Plan — Task 2: Make All Entities Extend BaseEntity

## Context

- Library: `@cobranza-apps/entities` at `C:\projects\cobranza-app\entities`.
- Branch: `feat/entity-base-refactor`.
- `BaseEntity` (Task 1, completed) now defines:
  - `id: UUID` (required)
  - `createdAt: Date` (required)
  - `createdBy: UUID` (required)
  - `updatedAt?: Date` (optional)
  - `updatedBy?: UUID` (optional)
  - `deletedAt?: Date` (optional)
  - `deletedBy?: UUID` (optional)
- The `SoftDeletable` interface has been REMOVED from `src/interfaces/base-entity.interface.ts` (confirmed via grep — no longer exported). Three entity files still import it → they currently FAIL compilation and must be fixed here.

## Goal

Every entity interface in `src/entities/**/*.entity.ts` MUST `extends BaseEntity`. No entity may declare inline `id`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedAt`, or `deletedBy`. No entity may import `SoftDeletable`.

## Scope

Cover all 22 entity files under `src/entities/`:

1. `company/user.entity.ts`
2. `company/company.entity.ts`
3. `company/role.entity.ts`
4. `company/company-user.entity.ts`
5. `company/company-plan.entity.ts`
6. `client/client.entity.ts`
7. `debt/debt.entity.ts`
8. `debt/debt-schedule.entity.ts`
9. `invoice/invoice.entity.ts`
10. `invoice/invoice-template.entity.ts`
11. `receipt/receipt.entity.ts`
12. `receipt/receipt-template.entity.ts`
13. `payment/payment.entity.ts`
14. `payment/payment-attempt.entity.ts`
15. `payment/payment-proof.entity.ts`
16. `bank/bank-statement.entity.ts`
17. `bank/bank-transaction.entity.ts`
18. `bank/payment-match.entity.ts`
19. `notification/notification.entity.ts`
20. `notification/notification-template.entity.ts`
21. `summary/company-monthly-summary.entity.ts`
22. `summary/client-debt-summary.entity.ts`

DTO files (`*.dto.ts`) and `index.ts` barrel files are OUT OF SCOPE for this task.

Import path used throughout: `import type { BaseEntity } from '../../interfaces/base-entity.interface';`
(All entity files live at `src/entities/<module>/<name>.entity.ts`, so `../../interfaces/...` is correct.)

## Categorization

### Category A — Already extend BaseEntity cleanly (NO changes)

| # | File | Status |
|---|------|--------|
| 7 | `debt/debt.entity.ts` | `extends BaseEntity`, no inline audit, no SoftDeletable |
| 9 | `invoice/invoice.entity.ts` | `extends BaseEntity`, clean |
| 11 | `receipt/receipt.entity.ts` | `extends BaseEntity`, clean |
| 13 | `payment/payment.entity.ts` | `extends BaseEntity`, clean |
| 16 | `bank/bank-statement.entity.ts` | `extends BaseEntity`, clean |
| 20 | `notification/notification-template.entity.ts` | `extends BaseEntity`, clean |

**Action:** none. Verify only.

### Category B — Extend BaseEntity BUT still reference removed SoftDeletable (cleanup)

These 3 files currently fail to compile because `SoftDeletable` no longer exists.

| # | File | Current extends |
|---|------|-----------------|
| 8 | `debt/debt-schedule.entity.ts` | `extends BaseEntity, SoftDeletable` |
| 10 | `invoice/invoice-template.entity.ts` | `extends BaseEntity, SoftDeletable` |
| 12 | `receipt/receipt-template.entity.ts` | `extends BaseEntity, SoftDeletable` |

**Action per file:**
- Remove line `import type { SoftDeletable } from '../../interfaces/base-entity.interface';`
- Change `extends BaseEntity, SoftDeletable {` → `extends BaseEntity {`

### Category C — Have inline audit fields (migrate to BaseEntity)

These 13 files declare their own `id`/`createdAt`/`updatedAt`/etc. and must be migrated.

| # | File | Inline audit fields currently present | Other notes |
|---|------|----------------------------------------|-------------|
| 1 | `company/user.entity.ts` | `id`, `createdAt`, `updatedAt` | `UUID` import becomes unused after removing `id` |
| 2 | `company/company.entity.ts` | `id`, `createdAt`, `updatedAt` | `UUID` import becomes unused after removing `id` |
| 3 | `company/role.entity.ts` | `id`, `createdAt` | `UUID` import becomes unused after removing `id` |
| 4 | `company/company-user.entity.ts` | `id`, `createdAt`, `updatedAt` | `UUID` import retained (companyId/userId/roleId) |
| 5 | `company/company-plan.entity.ts` | `id`, `createdAt`, `updatedAt` | `UUID` import retained (companyId) |
| 6 | `client/client.entity.ts` | `id`, `createdAt`, `updatedAt`, `updatedBy` | `UUID` import retained (companyId) |
| 14 | `payment/payment-attempt.entity.ts` | `id`, `createdAt`, `updatedAt` | `UUID` import retained (many FKs) |
| 15 | `payment/payment-proof.entity.ts` | `id`, `createdAt`, `createdBy?` | `createdBy` becomes REQUIRED (behavior change); `UUID` retained (companyId, clientId) |
| 17 | `bank/bank-transaction.entity.ts` | `id`, `createdAt`, `updatedAt` | `UUID` import retained |
| 18 | `bank/payment-match.entity.ts` | `id` only (no createdAt/updatedAt) | `createdAt` + `createdBy` become REQUIRED (behavior change); `UUID` retained |
| 19 | `notification/notification.entity.ts` | `id`, `createdAt` | `UUID` import retained |
| 21 | `summary/company-monthly-summary.entity.ts` | `id`, `createdAt`, `updatedAt` | `UUID` retained (companyId) |
| 22 | `summary/client-debt-summary.entity.ts` | `id`, `updatedAt` (no createdAt) | `createdAt` + `createdBy` become REQUIRED (behavior change); `UUID` retained |

## Behavior Changes (flag for caller / downstream tasks)

BaseEntity widens some previously-required audit fields to optional, and introduces required fields where some entities had none. The implementer MUST apply the migration as-is per the task goal (all entities extend BaseEntity uniformly), but these semantic shifts are recorded for awareness:

1. `updatedAt: Date` (required) → `updatedAt?: Date` (optional) for entities:
   - `User`, `Company`, `CompanyUser`, `CompanyPlan`, `Client`, `PaymentAttempt`, `BankTransaction`, `CompanyMonthlySummary`.
   - Effect: any consumer/DTO/factory that assumed `updatedAt` was always present must now handle `undefined`.
2. `createdBy?: UUID` (optional on `PaymentProof`) → `createdBy: UUID` (required). PaymentProof producers must now supply `createdBy`.
3. Entities previously lacking `createdAt` (`PaymentMatch`, `ClientDebtSummary`) now REQUIRE `createdAt`.
4. Entities previously lacking `createdBy` (`Role`, `PaymentMatch`, `ClientDebtSummary`, `User`, `Company`, `CompanyUser`, `CompanyPlan`, `BankTransaction`, `Notification`, `CompanyMonthlySummary`) now REQUIRE `createdBy`.
5. All entities gain optional `updatedBy`, `deletedAt`, `deletedBy` (previously absent from non-SoftDeletable entities).

These changes are consistent with the Task 1 redesign and the stated goal of uniform `extends BaseEntity`. No deviation required; flagged only for traceability.

## High-Level Approach

For each file in Category B and C:

1. Add / fix the `BaseEntity` import (only if not already present).
2. Remove the `SoftDeletable` import (Category B only).
3. Change `export interface X {` → `export interface X extends BaseEntity {`.
4. Delete inline declarations of `id`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedAt`, `deletedBy` (and their JSDoc comments, since they duplicate BaseEntity JSDoc).
5. If `UUID` is no longer referenced anywhere in the file, remove its import line.

## Detailed Steps

### Step 1 — Category A verification (no edits)

- Re-open and confirm no changes needed for: `debt.entity.ts`, `invoice.entity.ts`, `receipt.entity.ts`, `payment.entity.ts`, `bank-statement.entity.ts`, `notification-template.entity.ts`.

### Step 2 — Category B cleanup (3 files)

#### 2.1 `src/entities/debt/debt-schedule.entity.ts`

- Remove line 7: `import type { SoftDeletable } from '../../interfaces/base-entity.interface';`
- Keep line 6: `import type { BaseEntity } from '../../interfaces/base-entity.interface';`
- Change line 12: `export interface DebtSchedule extends BaseEntity, SoftDeletable {` → `export interface DebtSchedule extends BaseEntity {`

#### 2.2 `src/entities/invoice/invoice-template.entity.ts`

- Remove line 3: `import type { SoftDeletable } from '../../interfaces/base-entity.interface';`
- Keep line 2: `import type { BaseEntity } from '../../interfaces/base-entity.interface';`
- Change line 8: `export interface InvoiceTemplate extends BaseEntity, SoftDeletable {` → `export interface InvoiceTemplate extends BaseEntity {`

#### 2.3 `src/entities/receipt/receipt-template.entity.ts`

- Remove line 3: `import type { SoftDeletable } from '../../interfaces/base-entity.interface';`
- Keep line 2: `import type { BaseEntity } from '../../interfaces/base-entity.interface';`
- Change line 8: `export interface ReceiptTemplate extends BaseEntity, SoftDeletable {` → `export interface ReceiptTemplate extends BaseEntity {`

### Step 3 — Category C migration (13 files)

For each file below, the standard edit pattern is:

1. After existing type imports, add:
   ```ts
   import type { BaseEntity } from '../../interfaces/base-entity.interface';
   ```
   (place it in the import group, keeping alphabetical/visual order with other `../../` imports).
2. Change `export interface X {` → `export interface X extends BaseEntity {`.
3. Delete the inline audit fields and their `/** ... */` JSDoc blocks.
4. Remove the `UUID` import line IF `UUID` is no longer used in the file.

#### 3.1 `src/entities/company/user.entity.ts`

- Add `BaseEntity` import.
- `export interface User {` → `export interface User extends BaseEntity {`
- Remove inline: `id` (+ JSDoc), `createdAt` (+ JSDoc), `updatedAt` (+ JSDoc) — lines ~8–10 and ~35–39.
- Remove `import type { UUID } from '../../types/common';` (line 1) — `UUID` no longer used.

#### 3.2 `src/entities/company/company.entity.ts`

- Add `BaseEntity` import.
- `export interface Company {` → `export interface Company extends BaseEntity {`
- Remove inline: `id`, `createdAt`, `updatedAt` (+ JSDocs) — lines ~10–11 and ~49–53.
- Remove `import type { UUID } from '../../types/common';` (line 1) — `UUID` no longer used. Keep `JsonData`, `EncryptedValue`, `Location` imports.

#### 3.3 `src/entities/company/role.entity.ts`

- Add `BaseEntity` import.
- `export interface Role {` → `export interface Role extends BaseEntity {`
- Remove inline: `id`, `createdAt` (+ JSDocs) — lines ~8–9 and ~16–17.
- Remove `import type { UUID } from '../../types/common';` (line 1) — `UUID` no longer used.

#### 3.4 `src/entities/company/company-user.entity.ts`

- Add `BaseEntity` import.
- `export interface CompanyUser {` → `export interface CompanyUser extends BaseEntity {`
- Remove inline: `id`, `createdAt`, `updatedAt` (+ JSDocs) — lines ~7–8 and ~22–26.
- KEEP `import type { UUID }` (used by `companyId`, `userId`, `roleId`).

#### 3.5 `src/entities/company/company-plan.entity.ts`

- Add `BaseEntity` import.
- `export interface CompanyPlan {` → `export interface CompanyPlan extends BaseEntity {`
- Remove inline: `id`, `createdAt`, `updatedAt` (+ JSDocs) — lines ~9–10 and ~39–43.
- KEEP `import type { UUID }` (used by `companyId`). Keep `Decimal` and `Currency` imports.

#### 3.6 `src/entities/client/client.entity.ts`

- Add `BaseEntity` import.
- `export interface Client {` → `export interface Client extends BaseEntity {`
- Remove inline: `id`, `createdAt`, `updatedAt`, `updatedBy` (+ JSDocs) — lines ~10–11 and ~49–56.
- KEEP `import type { UUID }` (used by `companyId`). Keep other type imports.

#### 3.7 `src/entities/payment/payment-attempt.entity.ts`

- Add `BaseEntity` import.
- `export interface PaymentAttempt {` → `export interface PaymentAttempt extends BaseEntity {`
- Remove inline: `id`, `createdAt`, `updatedAt` (+ JSDocs) — lines ~10–11 and ~43–47.
- KEEP `import type { UUID }` (many FKs). Keep `Decimal`, `Currency`, `PaymentAttemptStatus`.

#### 3.8 `src/entities/payment/payment-proof.entity.ts`

- Add `BaseEntity` import.
- `export interface PaymentProof {` → `export interface PaymentProof extends BaseEntity {`
- Remove inline: `id`, `createdAt`, `createdBy` (+ JSDocs) — lines ~8–9 and ~29–33.
- NOTE: `createdBy` becomes REQUIRED (BaseEntity). Flagged in Behavior Changes.
- KEEP `import type { UUID }` (used by `companyId`, `clientId`). Keep `EncryptedValue`.

#### 3.9 `src/entities/bank/bank-transaction.entity.ts`

- Add `BaseEntity` import.
- `export interface BankTransaction {` → `export interface BankTransaction extends BaseEntity {`
- Remove inline: `id`, `createdAt`, `updatedAt` (+ JSDocs) — lines ~11–12 and ~47–51.
- KEEP `import type { UUID }`. Keep other imports.

#### 3.10 `src/entities/bank/payment-match.entity.ts`

- Add `BaseEntity` import.
- `export interface PaymentMatch {` → `export interface PaymentMatch extends BaseEntity {`
- Remove inline: `id` (+ JSDoc) — lines ~9–10.
- KEEP `import type { UUID }` (used by `paymentAttemptId`, `bankTransactionId`, `companyId`).
- NOTE: entity now REQUIRES `createdAt` and `createdBy` (previously absent). Flagged.
- Keep domain field `matchedAt` (this is NOT an audit field — do not remove).

#### 3.11 `src/entities/notification/notification.entity.ts`

- Add `BaseEntity` import.
- `export interface Notification {` → `export interface Notification extends BaseEntity {`
- Remove inline: `id`, `createdAt` (+ JSDocs) — lines ~11–12 and ~50–51.
- KEEP `import type { UUID }`. Keep enum imports and `EncryptedValue`.
- Keep domain field `sentAt` (NOT audit — do not remove).

#### 3.12 `src/entities/summary/company-monthly-summary.entity.ts`

- Add `BaseEntity` import.
- `export interface CompanyMonthlySummary {` → `export interface CompanyMonthlySummary extends BaseEntity {`
- Remove inline: `id`, `createdAt`, `updatedAt` (+ JSDocs) — lines ~9–10 and ~33–37.
- KEEP `import type { UUID }` (used by `companyId`). Keep `Decimal`, `Currency`.

#### 3.13 `src/entities/summary/client-debt-summary.entity.ts`

- Add `BaseEntity` import.
- `export interface ClientDebtSummary {` → `export interface ClientDebtSummary extends BaseEntity {`
- Remove inline: `id`, `updatedAt` (+ JSDocs) — lines ~10–11 and ~46–47.
- NOTE: entity now REQUIRES `createdAt` and `createdBy` (previously absent). Flagged.
- KEEP `import type { UUID }` (used by `companyId`, `clientId`, `lastPaymentId?`, `lastDebtId?`). Keep `Decimal`, `Currency`, `ClientDebtSummaryStatus`.

### Step 4 — Build verification (console command)

Run from `C:\projects\cobranza-app\entities`:

```powershell
npm run build
```

(Adjust to the project's actual build script — confirm via `package.json` `scripts.build`. Typical for this TS library: `tsc -p tsconfig.json` or similar.)

Expected: clean build, 0 errors. The 3 prior `SoftDeletable` compile errors (debt-schedule, invoice-template, receipt-template) are resolved, and no new type errors appear.

### Step 5 — Grep assertions (console commands)

Run from `C:\projects\cobranza-app\entities`:

```powershell
rg -n "SoftDeletable" src
```
Expected: zero matches inside `src/entities/**/*.entity.ts`. (DTO files may still mention `SoftDeletable` in comments — out of scope for this task.)

```powershell
rg -n "^export interface .* \{$" src/entities
```
Expected: zero matches (every entity interface now `extends BaseEntity`).

```powershell
rg -n "extends BaseEntity" src/entities
```
Expected: 22 matches (one per entity file).

### Step 6 — Code review (deferred to Task 4.3)

Hand off to code-reviewer sub-agent to verify adherence to this plan. Acceptance criteria:

- All 22 entity files declare `extends BaseEntity`.
- No inline `id`/`createdAt`/`updatedAt`/`createdBy`/`updatedBy`/`deletedAt`/`deletedBy` in any entity file.
- No `SoftDeletable` import in any `*.entity.ts`.
- No unused `UUID` imports in `user.entity.ts`, `company.entity.ts`, `role.entity.ts`.
- `npm run build` succeeds.

### Step 7 — Commit

Implementer commits with message (single commit for the whole task):

```
refactor(entities): make all entities extend BaseEntity

- Migrate 13 entities with inline audit fields to extend BaseEntity
- Remove SoftDeletable import/extends from debt-schedule, invoice-template, receipt-template
- Drop now-unused UUID imports from user, company, role entities
```

## Git Actions

- Branch already created in Step 2 of Critical Workflow: `feat/entity-base-refactor`.
- No branch switch required for this task.
- Single commit at end (Step 7), after build passes.
- Do NOT push in this sub-task (push handled by Plan Agent at end of TODO file).

## Files NOT Modified

- `src/interfaces/base-entity.interface.ts` (already done in Task 1).
- `src/interfaces/index.ts` (no change needed; `SoftDeletable` was never exported from barrel).
- All `*.dto.ts` files (out of scope; may reference SoftDeletable in comments — handled in a later task if needed).
- All `index.ts` barrel files.
- `README.md`, docs, configs.

## Verification Checklist (for Step 4.5)

- [ ] 22 entity interfaces extend BaseEntity.
- [ ] 0 inline audit-field declarations remain in `src/entities/**/*.entity.ts`.
- [ ] 0 `SoftDeletable` references in `src/entities/**/*.entity.ts`.
- [ ] `npm run build` exits 0.
- [ ] `user.entity.ts`, `company.entity.ts`, `role.entity.ts` no longer import `UUID`.
- [ ] Entities still using `UUID` for foreign keys retain their `UUID` import.
- [ ] Single commit on `feat/entity-base-refactor`.

## Risk / Notes

- The behavior changes (optionality shifts, newly-required `createdAt`/`createdBy`) are intentional per the Task 1 BaseEntity redesign. This task does NOT add default-fill logic or migrations; those concerns belong to downstream consumers (persistence/services layers), not this entities-only library.
- If the build fails due to DTO files referencing removed `SoftDeletable`, that is OUT OF SCOPE here — escalate to Plan Agent (may require a follow-up task for DTO adjustments). The task scope explicitly targets entity files only.