# Global Plan — DTO/Entity Field Origin Review

## Source

`.agent/todos/20260630/20260630-todo-0.md`

## Overview

Revert library `Create*Dto` type aliases to the **broad** inter-service contract pattern (`Omit<Entity, BaseAuditFields>` only), update encrypted field types to accept `EncryptedValue | rawType | null`, sync JSON schemas, update tests, and document the narrowing pattern for consuming microservices.

## Pre-Analysis

### Current State

- **22 entities** across 9 domains.
- `BaseEntity` interface exists in `src/interfaces/base-entity.interface.ts` but **no `BaseAuditFields` type alias** exists.
- `EncryptedValue` type lives in `src/types/encrypted.ts`.
- **7 DTOs** currently omit extra fields beyond the 7 BaseEntity audit fields, violating the broad-DTO philosophy:
  1. `CreateBankStatementDto` — omits `totalTransactions`
  2. `CreatePaymentMatchDto` — omits `matchedAt`
  3. `CreateUserDto` — omits `passwordHash`, `passwordUpdatedAt`, `lastLoginAt`
  4. `CreateDebtScheduleDto` — omits `lastGeneratedDate`
  5. `CreatePaymentAttemptDto` — omits `reviewedBy`, `reviewedAt`, `amount`, `currency`
  6. `CreateNotificationDto` — omits `sentAt`
  7. `CreateClientDebtSummaryDto` — omits `lastPaymentId`, `lastDebtId`, `lastPaymentDate`, `lastDebtDate`
- **Encrypted fields** currently typed as `EncryptedValue | null` (or `EncryptedValue` for required fields) — no raw-type union.
- **JSON Schemas** model encrypted fields as strict `object` without `string` alternative.
- **Tests** (`dtos.test.ts`, `entities/*.test.ts`) do not exercise raw-string payloads in encrypted fields.
- **`docs/usage-nestjs.md`** §2 and §3 demonstrate hand-rolled DTOs that contradict the library aliases; §3 class does not `implements` the lib type.
- **Version**: `0.4.0` in `package.json`. This is a **minor** bump (`0.5.0`) because it introduces new capabilities (broader DTOs, union types) without breaking existing valid usage.

### Technical Decisions

1. **Create `BaseAuditFields`** as `Pick<BaseEntity, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'>` in `src/interfaces/base-entity.interface.ts`. This centralizes the audit field list and lets every DTO use `Omit<Entity, keyof BaseAuditFields>` consistently.
2. **Encrypted union type**: `EncryptedValue | string | null` for optional encrypted fields; `EncryptedValue | string` for required encrypted fields. The `null` case is when the field is nullable in the DB.
3. **Schema update**: For each encrypted property, add `"type": ["object", "string", "null"]` (or `["object", "string"]` for non-nullables) so schemas match the union.
4. **Test strategy**: Add compile-time assertions in `dtos.test.ts` that the reverted DTOs **include** the previously stripped fields. Add runtime tests in `entities/*.test.ts` that pass raw strings into encrypted fields.
5. **Documentation strategy**: Rewrite `docs/usage-nestjs.md` §2 and §3 to show the `Omit<CreateDebtDto, 'debtCode' | 'status'>` narrowing pattern. Add a new introductory paragraph explaining the event-driven microservice philosophy.

---

## Step 2 — Git Feature Branch Setup

**Agent**: `implementer`

1. Run `git status`. Commit any unstaged files with a meaningful message if needed.
2. Ensure we are on `main`. If not, ask the user.
3. Create and checkout feature branch: `feat/dto-field-origin-review`.

---

## Step 3 — Version Update

**Agent**: `implementer`

1. Bump version in `package.json` from `0.4.0` to `0.5.0`.
2. Commit: `chore: bump version to 0.5.0`.

---

## Task 1 — Audit & Revert DTOs

**Goal**: Revert every `Create*Dto` that omits more than audit fields back to `Omit<Entity, keyof BaseAuditFields>` only. Verify `Update*Dto = Partial<Create*Dto>`.

### 4.1 Analysis & Planning
**Agent**: `architect`

1. Confirm the 7 DTOs that need reverting by diffing each `.dto.ts` against the TODO tables.
2. Plan the `BaseAuditFields` introduction in `src/interfaces/base-entity.interface.ts`.
3. Generate a detailed per-file checklist.
4. Save the per-task plan to `.kilo/plans/20260630-task-1-audit-revert-dtos.md`.

### 4.2 Implementation
**Agent**: `implementer`

1. Add `BaseAuditFields` type alias to `src/interfaces/base-entity.interface.ts`:
   ```ts
   export type BaseAuditFields = Pick<
     BaseEntity,
     'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
   >;
   ```
2. Update `src/entities/index.ts` and `src/interfaces/index.ts` barrel exports if needed.
3. For each of the 7 DTO files, remove the extra fields from the `Omit<>` clause so only `keyof BaseAuditFields` remains:
   - `bank/bank-statement.dto.ts`
   - `bank/payment-match.dto.ts`
   - `company/user.dto.ts`
   - `debt/debt-schedule.dto.ts`
   - `payment/payment-attempt.dto.ts`
   - `notification/notification.dto.ts`
   - `summary/client-debt-summary.dto.ts`
4. Verify `Update*Dto = Partial<Create*Dto>` in all 22 entity DTO files.
5. Commit with meaningful message.

### 4.3 Code Review
**Agent**: `code-reviewer`

1. Review all 7 modified DTO files for correctness.
2. Check that no unintended extra fields were removed or kept.
3. Generate fix plan if needed; save to `.kilo/plans/20260630-task-1-fix.md`.

### 4.4 Documentation
**Agent**: `docs-specialist`

1. Add JSDoc to `BaseAuditFields` explaining its purpose.
2. Add inline comments in each reverted DTO noting that it follows the broad inter-service contract.

### 4.5 Verification
**Agent**: `architect`

1. Check implementation plan adherence.
2. Confirm every `Create*Dto` now uses `Omit<Entity, keyof BaseAuditFields>` (or explicit 7-field list for files not touched).
3. Report diffs.

### 4.6 Task Completion
**Agent**: `implementer`

1. Append `[DONE]` to Task 1 in the TODO file.
2. Commit.

---

## Task 2 — Encrypted Field Types

**Goal**: Update all entity interfaces so encrypted fields accept `EncryptedValue | string | null` (or `EncryptedValue | string` for required non-nullables).

### 4.1 Analysis & Planning
**Agent**: `architect`

1. Enumerate every encrypted field per the TODO tables and the explore findings.
2. Decide required-vs-optional vs nullable for each field.
3. Generate per-entity file checklist.
4. Save plan to `.kilo/plans/20260630-task-2-encrypted-fields.md`.

### 4.2 Implementation
**Agent**: `implementer`

1. Update entity interfaces in these files (add `| string` to encrypted field types):
   - `company/company.interface.ts` — `businessName`, `taxId`, `contact`, `phone`
   - `company/user.interface.ts` — `fullName`, `phone`
   - `client/client.interface.ts` — `fullName`, `email`, `phone`, `taxId`
   - `bank/bank-transaction.interface.ts` — `description`, `reference`
   - `bank/bank-statement.interface.ts` — `notes`
   - `payment/payment-proof.interface.ts` — `notes`
   - `notification/notification.interface.ts` — `to`, `from`, `subject`, `body`
2. Ensure `EncryptedValue` is imported from `src/types/encrypted` in each file.
3. Commit.

### 4.3 Code Review
**Agent**: `code-reviewer`

1. Review each modified interface for correct union syntax and imports.
2. Ensure no non-encrypted fields were accidentally changed.
3. Generate fix plan if needed.

### 4.4 Documentation
**Agent**: `docs-specialist`

1. Update JSDoc on encrypted fields to mention the union type.
2. Update `README.md` encryption section to explain the union.

### 4.5 Verification
**Agent**: `architect`

1. Confirm all encrypted fields now have the union type.
2. Confirm `npm run typecheck` passes (or will pass after test/schema tasks).

### 4.6 Task Completion
**Agent**: `implementer`

1. Append `[DONE]` to Task 2 in the TODO file.
2. Commit.

---

## Task 3 — Schema Sync

**Goal**: Sync `src/schemas/*.json` so encrypted fields allow `object | string | null` and `required` arrays match the broad DTO.

### 4.1 Analysis & Planning
**Agent**: `architect`

1. Diff each schema against its corresponding entity interface and DTO.
2. Identify schemas where encrypted fields are `type: "object"` only.
3. Save plan to `.kilo/plans/20260630-task-3-schema-sync.md`.

### 4.2 Implementation
**Agent**: `implementer`

1. For each schema with encrypted fields, update the property to:
   ```json
   "type": ["object", "string", "null"]
   ```
   (or `["object", "string"]` for non-nullables).
2. Verify `required` arrays still include all business fields (no extra removals).
3. Commit.

### 4.3 Code Review
**Agent**: `code-reviewer`

1. Review schema changes for correctness.
2. Ensure no non-encrypted fields were changed.

### 4.4 Documentation
**Agent**: `docs-specialist`

1. Update `docs/json-schema-usage.md` if it mentions encrypted field types.

### 4.5 Verification
**Agent**: `architect`

1. Confirm schemas match entity interfaces.
2. Run any available schema validation.

### 4.6 Task Completion
**Agent**: `implementer`

1. Append `[DONE]` to Task 3 in the TODO file.
2. Commit.

---

## Task 4 — Test Updates

**Goal**: Update tests to validate broad DTOs and raw-string acceptance in encrypted fields.

### 4.1 Analysis & Planning
**Agent**: `architect`

1. Review `src/__tests__/dtos.test.ts` and `src/__tests__/entities/*.test.ts`.
2. Plan new assertions:
   - Compile-time assertions that reverted DTOs include previously stripped fields.
   - Runtime tests passing raw strings into encrypted fields.
3. Save plan to `.kilo/plans/20260630-task-4-test-updates.md`.

### 4.2 Implementation
**Agent**: `implementer`

1. Update `dtos.test.ts`:
   - Add `HasKey<CreatePaymentAttemptDto, 'amount'>` etc. assertions.
   - Add encrypted union tests (e.g., `const dto: CreateClientDto = { ..., fullName: 'plain string', ... }`).
2. Update `entities/*.test.ts`:
   - Add tests that construct entities/DTOs with raw strings in encrypted fields.
3. Run `npm test` and fix any failures.
4. Commit.

### 4.3 Code Review
**Agent**: `code-reviewer`

1. Review new tests for coverage and correctness.
2. Ensure no stale tests contradict the new types.

### 4.4 Documentation
**Agent**: `docs-specialist`

1. Add comments in test files explaining what the new assertions verify.

### 4.5 Verification
**Agent**: `architect`

1. Confirm tests pass.
2. Confirm all reverted DTOs are covered by `HasKey` assertions.

### 4.6 Task Completion
**Agent**: `implementer`

1. Append `[DONE]` to Task 4 in the TODO file.
2. Commit.

---

## Task 5 — Documentation

**Goal**: Update `docs/usage-nestjs.md`, `README.md`, and `CHANGELOG.md`.

### 4.1 Analysis & Planning
**Agent**: `architect`

1. Plan exact edits for each document.
2. Save plan to `.kilo/plans/20260630-task-5-docs.md`.

### 4.2 Implementation
**Agent**: `implementer`

1. **`docs/usage-nestjs.md`**:
   - Add introductory paragraph (§0 or §1) explaining event-driven microservice DTO philosophy (broad inter-service contract, narrowing at API boundary).
   - Rewrite §2 to use `type ApiCreateDebtDto = Omit<CreateDebtDto, 'debtCode' | 'status'>` and `class CreateDebtRequest implements ApiCreateDebtDto`.
   - Rewrite §3 to show the `implements` narrowing pattern.
2. **`README.md`**:
   - Update DTO section to mention the broad-DTO philosophy and the narrowing pattern.
   - Update encryption section to mention `EncryptedValue | string | null`.
3. **`CHANGELOG.md`**:
   - Add `## [0.5.0] - 2026-06-30` entry describing:
     - Broad DTO revert
     - Encrypted field union types
     - New narrowing pattern for consumers
     - Migration note: "If your microservice previously relied on the library stripping fields like `status` or `debtCode`, define your own narrowed alias: `type ApiCreateDebtDto = Omit<CreateDebtDto, 'debtCode' | 'status'>`."
4. Commit.

### 4.3 Code Review
**Agent**: `code-reviewer`

1. Review docs for clarity, accuracy, and broken links.

### 4.4 Documentation
**Agent**: `docs-specialist`

1. Final polish of wording and JSDoc.

### 4.5 Verification
**Agent**: `architect`

1. Confirm docs accurately reflect the implemented code.
2. Ensure no contradictions between README, usage-nestjs, and code.

### 4.6 Task Completion
**Agent**: `implementer`

1. Append `[DONE]` to Task 5 in the TODO file.
2. Commit.

---

## Task 6 — Verification

**Goal**: Final build, test, and type-check confirmation.

### 4.1 Analysis & Planning
**Agent**: `architect`

1. Plan verification steps.
2. Save plan to `.kilo/plans/20260630-task-6-verification.md`.

### 4.2 Implementation
**Agent**: `implementer`

1. Run `npm run build`.
2. Run `npm run typecheck`.
3. Run `npm run test`.
4. Run `npm run test:circular`.
5. If any step fails, stop and report.
6. Commit (if any fixes were needed).

### 4.3 Code Review
**Agent**: `code-reviewer`

1. Review any fixes made during verification.

### 4.4 Documentation
**Agent**: `docs-specialist`

1. Add any final notes to CHANGELOG if verification revealed edge cases.

### 4.5 Verification
**Agent**: `architect`

1. Confirm all commands pass.
2. Confirm no deviations from the plan remain.

### 4.6 Task Completion
**Agent**: `implementer`

1. Append `[DONE]` to Task 6 in the TODO file.
2. Commit.

---

## Step 5 — TODO File Completion

**Agent**: `implementer`

1. Rename `.agent/todos/20260630/20260630-todo-0.md` to `.agent/todos/20260630/20260630-todo-0-DONE.md`.
2. Ensure all changes are committed in `feat/dto-field-origin-review`.
3. Switch to `main`.
4. Merge `feat/dto-field-origin-review` into `main`.
5. On success, delete the feature branch.
6. If `origin` remote is set, push `main` to `origin` only.

---

## Global Plan File

Path: `.kilo/plans/20260630-dto-field-origin-review.md`
