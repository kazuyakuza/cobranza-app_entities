# Global Plan: Entity Base Refactor & Audit Fields Unification

**Date**: 2026-06-25
**TODO Source**: `.agent/todos/20260625/20260625-todo-0.md`
**Branch**: `feat/entity-base-refactor`

---

## Global Pre-Analysis

### Context
The Cobranza App Entities Library (`@cobranza-apps/entities`) currently has a split audit model:
- `BaseEntity` defines `id`, `createdAt`, `updatedAt`, `createdBy?`, `updatedBy?`
- `SoftDeletable` mixin defines `deletedAt?`, `deletedBy?`
- Only ~10 of 21 entities extend `BaseEntity`; the rest define audit fields inline or omit them entirely
- `SoftDeletable` is only used by `DebtSchedule`, `InvoiceTemplate`, and `ReceiptTemplate`

### Technical Decisions

1. **Unified BaseEntity**: Merge `SoftDeletable` into `BaseEntity`. The new shape:
   - `id: UUID` (required) — kept
   - `createdAt: Date` (required) — kept
   - `createdBy: UUID` (required) — **breaking: was optional**
   - `updatedAt?: Date` (optional) — **breaking: was required**
   - `updatedBy?: UUID` (optional) — kept
   - `deletedAt?: Date` (optional) — migrated from `SoftDeletable`
   - `deletedBy?: UUID` (optional) — migrated from `SoftDeletable`

2. **Remove SoftDeletable**: The standalone `SoftDeletable` interface and all `extends SoftDeletable` declarations are removed. Every entity now implicitly supports soft-delete via `BaseEntity`.

3. **Universal BaseEntity Extension**: All 21 entities must extend `BaseEntity`. Entities that previously defined `id`, `createdAt`, `updatedAt`, etc. inline must remove those definitions and import `BaseEntity`.

4. **Breaking Changes**:
   - `createdBy` is now required on every entity (consumers must supply it)
   - `updatedAt` is now optional (was required)
   - `deletedAt`/`deletedBy` appear on entities that never had them before
   - `SoftDeletable` export is removed
   - `Company.contact`, `Client.fullName`, `Debt.description` become optional

5. **Version Bump**: `0.3.4` → `0.4.0` (breaking changes, pre-1.0 major-ish bump per semver policy in workflow).

6. **Files to Modify** (high-level):
   - `src/interfaces/base-entity.interface.ts`
   - `src/interfaces/index.ts`
   - 21 entity `.entity.ts` files
   - 22 `.dto.ts` files
   - 22 `.schema.json` files
   - 4 `.test.ts` files
   - `README.md`, `CONTRIBUTING.md`, `docs/json-schema-usage.md`
   - `.agent/project-info/architecture.md`, `.agent/project-info/tech.md`
   - `.agent/project-info/entities-definition.csv`
   - `CHANGELOG.md`

---

## Execution Overview

| Step | Description | Sub-agent |
|------|-------------|-----------|
| 2 | Git Feature Branch Setup | implementer |
| 3 | Version Bump | implementer |
| Task 1 4.1 | Analyze BaseEntity refactor | architect |
| Task 1 4.2 | Implement BaseEntity merge + remove SoftDeletable | implementer |
| Task 1 4.3 | Review BaseEntity changes | code-reviewer |
| Task 1 4.4 | Update interface docs | docs-specialist |
| Task 1 4.5 | Verify BaseEntity changes | architect |
| Task 1 4.6 | Mark Task 1 done | implementer |
| Task 2 4.1 | Plan entity migration to BaseEntity | architect |
| Task 2 4.2 | Update all 21 entities to extend BaseEntity | implementer |
| Task 2 4.3 | Review entity migration | code-reviewer |
| Task 2 4.4 | Update entity-related docs | docs-specialist |
| Task 2 4.5 | Verify entity migration | architect |
| Task 2 4.6 | Mark Task 2 done | implementer |
| Task 5 4.1 | Plan optional fields change | architect |
| Task 5 4.2 | Make contact/fullName/description optional | implementer |
| Task 5 4.3 | Review optional fields | code-reviewer |
| Task 5 4.4 | Update optional fields docs | docs-specialist |
| Task 5 4.5 | Verify optional fields | architect |
| Task 5 4.6 | Mark Task 5 done | implementer |
| Task 4 4.1 | Plan DTO/test/schema updates | architect |
| Task 4 4.2 | Update DTOs, tests, and schemas | implementer |
| Task 4 4.3 | Review DTO/test/schema updates | code-reviewer |
| Task 4 4.4 | Update DTO/test/schema docs | docs-specialist |
| Task 4 4.5 | Verify DTO/test/schema updates | architect |
| Task 4 4.6 | Mark Task 4 done | implementer |
| Task 3 4.1 | Plan CSV and documentation updates | architect |
| Task 3 4.2 | Update entities-definition.csv and docs | implementer |
| Task 3 4.3 | Review CSV/docs updates | code-reviewer |
| Task 3 4.4 | Finalize documentation | docs-specialist |
| Task 3 4.5 | Verify CSV/docs updates | architect |
| Task 3 4.6 | Mark Task 3 done | implementer |
| Task 6 4.1 | Plan changelog entry | architect |
| Task 6 4.2 | Write CHANGELOG.md entry | implementer |
| Task 6 4.3 | Review changelog | code-reviewer |
| Task 6 4.4 | Finalize changelog | docs-specialist |
| Task 6 4.5 | Verify changelog | architect |
| Task 6 4.6 | Mark Task 6 done | implementer |
| 5 | TODO File Completion & Merge | implementer |

---

## Step 2: Git Feature Branch Setup

**Sub-agent**: `implementer`

- Run `git status`. Commit any unstaged changes with meaningful message.
- Switch to `main` branch.
- Create and switch to `feat/entity-base-refactor`.
- Return branch name.

---

## Step 3: Version Update

**Sub-agent**: `implementer`

- Read `package.json` (current: `0.3.4`).
- Bump to `0.4.0` (breaking changes: required `createdBy`, optional `updatedAt`, removed `SoftDeletable`, optional fields).
- Commit: `chore: bump version to 0.4.0`.

---

## Task 1: Merge SoftDeletable into BaseEntity

### 4.1 Analysis and Planning
**Sub-agent**: `architect`

- Analyze current `BaseEntity` and `SoftDeletable` usage across codebase.
- Identify all imports and references to `SoftDeletable`.
- Produce detailed plan:
  1. Modify `src/interfaces/base-entity.interface.ts` to merge `SoftDeletable` fields into `BaseEntity` with correct optionality.
  2. Remove `SoftDeletable` export from `src/interfaces/index.ts`.
  3. Update `src/__tests__/interfaces.test.ts` to remove `SoftDeletable` test and update `BaseEntity` test (add required `createdBy`, make `updatedAt` optional).
  4. List all files referencing `SoftDeletable` for Task 2 cleanup.
- Save task plan in `.kilo/plans/20260625-task-1-baseentity.md`.

### 4.2 Implementation
**Sub-agent**: `implementer`

- Modify `src/interfaces/base-entity.interface.ts`:
  ```typescript
  export interface BaseEntity {
    id: UUID;
    createdAt: Date;
    createdBy: UUID;
    updatedAt?: Date;
    updatedBy?: UUID;
    deletedAt?: Date;
    deletedBy?: UUID;
  }
  ```
  Remove `SoftDeletable` interface.
- Modify `src/interfaces/index.ts` to remove `SoftDeletable` from re-export.
- Update `src/__tests__/interfaces.test.ts`:
  - `BaseEntity` test: include required `createdBy`, remove `updatedBy` from required test if testing minimal object.
  - Remove entire `SoftDeletable` describe block.
- Commit: `refactor: merge SoftDeletable into BaseEntity, make createdBy required, updatedAt optional`.

### 4.3 Code Review
**Sub-agent**: `code-reviewer`

- Verify `BaseEntity` shape matches requirements.
- Verify `SoftDeletable` is fully removed.
- Verify tests compile and pass.
- Generate fix plan if needed; save to `.kilo/plans/20260625-task-1-fix.md`.

### 4.4 Documentation
**Sub-agent**: `docs-specialist`

- Update `README.md`: replace `BaseEntity` description, remove `SoftDeletable` row from interfaces table.
- Update `CONTRIBUTING.md`: replace audit/soft-delete constraint descriptions.
- Update `docs/json-schema-usage.md`: remove `SoftDeletable` references.
- Update `.agent/project-info/architecture.md`: update BaseEntity and SoftDeletable sections.
- Update `.agent/project-info/tech.md`: update audit fields description.
- Commit: `docs: update interface documentation for unified BaseEntity`.

### 4.5 Verification
**Sub-agent**: `architect`

- Run `npm run typecheck` and `npm run test`.
- Verify no `SoftDeletable` references remain in `src/`.
- Verify `BaseEntity` is exported correctly.

### 4.6 Task Completion
**Sub-agent**: `implementer`

- Append `[DONE]` to Task 1 line in TODO file.
- Commit: `chore: mark task 1 complete`.

---

## Task 2: Make All Entities Extend BaseEntity

### 4.1 Analysis and Planning
**Sub-agent**: `architect`

- Inventory all 21 entities and their current audit field status.
- Categorize:
  - **Already extends BaseEntity**: Debt, DebtSchedule, Invoice, InvoiceTemplate, Receipt, ReceiptTemplate, Payment, BankStatement, NotificationTemplate
  - **Has inline audit fields (migrate to BaseEntity)**: Company, CompanyPlan, User, Role, CompanyUser, Client, PaymentProof, PaymentAttempt, BankTransaction, Notification, ClientDebtSummary, CompanyMonthlySummary
  - **Missing audit fields entirely**: PaymentMatch
- Plan exact changes per entity (remove inline fields, add `extends BaseEntity`, add import).
- Note: `PaymentMatch` currently has no `createdAt`/`updatedAt`; it will gain them via `BaseEntity`. The `matchedAt` field remains as-is.
- Note: `Role` currently only has `createdAt`; it will gain optional `updatedAt`, `createdBy`, etc.
- Save task plan in `.kilo/plans/20260625-task-2-entities.md`.

### 4.2 Implementation
**Sub-agent**: `implementer`

For each entity in the "migrate" and "missing" categories:
1. Add `import type { BaseEntity } from '../../interfaces/base-entity.interface';`
2. Change `export interface X {` to `export interface X extends BaseEntity {`
3. Remove inline declarations of: `id`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedAt`, `deletedBy`
4. Keep all other fields exactly as-is

For entities already extending `BaseEntity`:
1. Remove any `import type { SoftDeletable }` lines
2. Remove `, SoftDeletable` from `extends` clauses
3. Remove inline `deletedAt`/`deletedBy` if any (they come from BaseEntity now)

Entities to modify:
- `src/entities/company/company.entity.ts`
- `src/entities/company/company-plan.entity.ts`
- `src/entities/company/user.entity.ts`
- `src/entities/company/role.entity.ts`
- `src/entities/company/company-user.entity.ts`
- `src/entities/client/client.entity.ts`
- `src/entities/debt/debt-schedule.entity.ts` (remove SoftDeletable)
- `src/entities/invoice/invoice-template.entity.ts` (remove SoftDeletable)
- `src/entities/receipt/receipt-template.entity.ts` (remove SoftDeletable)
- `src/entities/payment/payment-proof.entity.ts`
- `src/entities/payment/payment-attempt.entity.ts`
- `src/entities/bank/bank-transaction.entity.ts`
- `src/entities/bank/payment-match.entity.ts`
- `src/entities/notification/notification.entity.ts`
- `src/entities/summary/client-debt-summary.entity.ts`
- `src/entities/summary/company-monthly-summary.entity.ts`

Commit: `refactor: make all entities extend unified BaseEntity`.

### 4.3 Code Review
**Sub-agent**: `code-reviewer`

- Verify every entity extends `BaseEntity`.
- Verify no duplicate audit fields remain.
- Verify `SoftDeletable` imports are gone.
- Verify `npm run typecheck` passes.
- Generate fix plan if needed.

### 4.4 Documentation
**Sub-agent**: `docs-specialist`

- Update `README.md` "Available Entities" section if needed.
- Update `docs/json-schema-usage.md` entity notes (e.g., "Does not extend BaseEntity" → update).
- Commit: `docs: update entity documentation for BaseEntity migration`.

### 4.5 Verification
**Sub-agent**: `architect`

- Run `npm run typecheck` and `npm run test`.
- Verify all 21 entities compile.
- Spot-check a few entities for correct BaseEntity extension.

### 4.6 Task Completion
**Sub-agent**: `implementer`

- Append `[DONE]` to Task 2 line in TODO file.
- Commit: `chore: mark task 2 complete`.

---

## Task 5: Make Company.contact, Client.fullName, Debt.description Optional

### 4.1 Analysis and Planning
**Sub-agent**: `architect`

- Identify exact lines to change:
  - `src/entities/company/company.entity.ts`: `contact: EncryptedValue` → `contact?: EncryptedValue | null`
  - `src/entities/client/client.entity.ts`: `fullName: EncryptedValue` → `fullName?: EncryptedValue | null`
  - `src/entities/debt/debt.entity.ts`: `description: string` → `description?: string`
- Plan ripple effects: schemas, DTOs (Omit patterns), tests, CSV.
- Save plan to `.kilo/plans/20260625-task-5-optional.md`.

### 4.2 Implementation
**Sub-agent**: `implementer`

- Modify the three entity files.
- Update corresponding schemas: `company.schema.json`, `client.schema.json`, `debt.schema.json` (move fields from `required` to optional).
- Update tests in `company-and-client.test.ts` and `debt-and-payment.test.ts` to reflect optionality.
- Commit: `feat: make Company.contact, Client.fullName, Debt.description optional`.

### 4.3 Code Review
**Sub-agent**: `code-reviewer`

- Verify the three fields are optional in entities and schemas.
- Verify tests pass.
- Generate fix plan if needed.

### 4.4 Documentation
**Sub-agent**: `docs-specialist`

- Update entity JSDoc if any field descriptions incorrectly state "required".
- Commit: `docs: update field descriptions for optional contact/fullName/description`.

### 4.5 Verification
**Sub-agent**: `architect`

- Run `npm run typecheck` and `npm run test`.
- Verify optionality in all three layers (entity, schema, test).

### 4.6 Task Completion
**Sub-agent**: `implementer`

- Append `[DONE]` to Task 5 line in TODO file.
- Commit: `chore: mark task 5 complete`.

---

## Task 4: Update DTOs, Tests, and JSON Schemas

### 4.1 Analysis and Planning
**Sub-agent**: `architect`

- Analyze all 22 DTO files. Current patterns vary:
  - Some omit `id | createdAt | updatedAt`
  - Some omit `id | createdAt | updatedAt | createdBy | updatedBy`
  - Some omit `id | createdAt | createdBy`
  - Some omit custom sets
- **New standard**: All `Create*Dto` should omit: `id | createdAt | createdBy | updatedAt | updatedBy | deletedAt | deletedBy`
  - Exception: if an entity has system-managed fields not in BaseEntity (e.g., `lastGeneratedDate`, `sentAt`, `matchedAt`, `reviewedAt`, etc.), those should ALSO be omitted.
- Identify all DTOs that need updating due to BaseEntity migration or optional fields change.
- Identify all 22 JSON schemas that need BaseEntity field updates.
- Identify all test files that need `createdBy` added to test objects.
- Save plan to `.kilo/plans/20260625-task-4-dtos-tests-schemas.md`.

### 4.2 Implementation
**Sub-agent**: `implementer`

**DTOs** (update `Create*Dto` to consistently omit full BaseEntity set):
- `company/company.dto.ts`, `company-plan.dto.ts`, `user.dto.ts`, `role.dto.ts`, `company-user.dto.ts`
- `client/client.dto.ts`
- `debt/debt.dto.ts`, `debt-schedule.dto.ts`
- `invoice/invoice.dto.ts`, `invoice-template.dto.ts`
- `receipt/receipt.dto.ts`, `receipt-template.dto.ts`
- `payment/payment-proof.dto.ts`, `payment-attempt.dto.ts`, `payment.dto.ts`
- `bank/bank-statement.dto.ts`, `bank-transaction.dto.ts`, `payment-match.dto.ts`
- `notification/notification.dto.ts`, `notification-template.dto.ts`
- `summary/client-debt-summary.dto.ts`, `company-monthly-summary.dto.ts`

**Tests**:
- `src/__tests__/interfaces.test.ts` — already updated in Task 1
- `src/__tests__/entities/company-and-client.test.ts` — add `createdBy` to test objects
- `src/__tests__/entities/debt-and-payment.test.ts` — add `createdBy` to test objects
- `src/__tests__/entities/bank-and-invoice.test.ts` — add `createdBy` to test objects
- `src/__tests__/entities/notification-and-summary.test.ts` — add `createdBy` to test objects

**JSON Schemas** (all 22):
- Add `createdBy` (required) to all schemas
- Change `updatedAt` from required to optional in all schemas where it was required
- Add `deletedAt` and `deletedBy` (optional) to schemas that lacked them
- Update `required` arrays for all schemas
- Update `company.schema.json`, `client.schema.json`, `debt.schema.json` for optional field changes

Commit in logical batches:
- `refactor: update all DTOs for unified BaseEntity`
- `test: add required createdBy to all entity test objects`
- `refactor: update all JSON schemas for unified BaseEntity and optional fields`

### 4.3 Code Review
**Sub-agent**: `code-reviewer`

- Verify DTO Omit patterns are consistent.
- Verify tests pass (`npm run test`).
- Verify schemas have correct `required` arrays.
- Generate fix plan if needed.

### 4.4 Documentation
**Sub-agent**: `docs-specialist`

- Update `docs/json-schema-usage.md` schema notes (e.g., remove "Does not extend BaseEntity" notes).
- Update `CONTRIBUTING.md` DTO pattern examples if they show old BaseEntity shape.
- Commit: `docs: update DTO and schema documentation`.

### 4.5 Verification
**Sub-agent**: `architect`

- Run `npm run typecheck`, `npm run test`, `npm run build`.
- Verify all 22 schemas are syntactically valid JSON.
- Verify no compilation errors.

### 4.6 Task Completion
**Sub-agent**: `implementer`

- Append `[DONE]` to Task 4 line in TODO file.
- Commit: `chore: mark task 4 complete`.

---

## Task 3: Update entities-definition.csv and Related Documentation

### 4.1 Analysis and Planning
**Sub-agent**: `architect`

- Inventory all changes that affect `.agent/project-info/entities-definition.csv`:
  - All entities now have `created_by: UUID, Yes` (was No or missing)
  - All entities now have `updated_at: Timestamp, No` (was Yes for most)
  - All entities now have `deleted_at: Timestamp, No` and `deleted_by: UUID, No`
  - `Company.contact` is now optional
  - `Client.full_name` is now optional
  - `Debt.description` is now optional
  - `PaymentMatch` now has BaseEntity fields (was missing)
  - `Role` now has `updated_at` (was missing)
  - `ClientDebtSummary` now has `created_at`, `created_by`, etc. (was missing)
- Plan CSV update strategy.
- Plan updates to `data-model-brief.md` and `entities-relationship-diagram-overview.md` if they reference old field requirements.
- Save plan to `.kilo/plans/20260625-task-3-csv-docs.md`.

### 4.2 Implementation
**Sub-agent**: `implementer`

- Update `.agent/project-info/entities-definition.csv`:
  - For every entity, ensure BaseEntity fields are present with correct required/optional status
  - Update `contact`, `full_name`, `description` to `No`
  - Update `PaymentMatch` to include BaseEntity fields
  - Update `Role` to include `updated_at`, `updated_by`, etc.
  - Update `ClientDebtSummary` to include `created_at`, `created_by`, etc.
- Update `data-model-brief.md` if it references old required/optional status.
- Update `entities-relationship-diagram-overview.md` if needed.
- Commit: `docs: update entities-definition.csv for unified BaseEntity and optional fields`.

### 4.3 Code Review
**Sub-agent**: `code-reviewer`

- Verify CSV is syntactically valid.
- Verify all 21 entities are represented.
- Verify BaseEntity field optionality matches the new interface.
- Generate fix plan if needed.

### 4.4 Documentation
**Sub-agent**: `docs-specialist`

- Cross-reference CSV with entity files to ensure consistency.
- Update any other docs referencing old entity shapes.
- Commit: `docs: cross-reference entity documentation`.

### 4.5 Verification
**Sub-agent**: `architect`

- Spot-check 5 entities against CSV.
- Verify no stale references to `SoftDeletable` in docs.

### 4.6 Task Completion
**Sub-agent**: `implementer`

- Append `[DONE]` to Task 3 line in TODO file.
- Commit: `chore: mark task 3 complete`.

---

## Task 6: Write Detailed Changes in CHANGELOG

### 4.1 Analysis and Planning
**Sub-agent**: `architect`

- Determine version header: `## [0.4.0] - 2026-06-25`
- Categorize changes:
  - **Changed**: BaseEntity merged with SoftDeletable; createdBy now required; updatedAt now optional; all entities extend BaseEntity
  - **Changed**: Company.contact, Client.fullName, Debt.description are now optional
  - **Removed**: SoftDeletable interface
  - **Fixed/Updated**: DTOs, tests, schemas aligned with new BaseEntity
- Save plan to `.kilo/plans/20260625-task-6-changelog.md`.

### 4.2 Implementation
**Sub-agent**: `implementer`

- Add new section to `CHANGELOG.md` above `[0.3.4]`:
  ```markdown
  ## [0.4.0] - 2026-06-25

  ### Changed

  - `BaseEntity` now includes all audit and soft-delete fields: `id`, `createdAt`, `createdBy`, `updatedAt?`, `updatedBy?`, `deletedAt?`, `deletedBy?`.
  - `createdBy` is now **required** on all entities.
  - `updatedAt` is now **optional** on all entities.
  - All 21 domain entities now extend `BaseEntity` consistently.
  - `Company.contact` is now optional (`contact?: EncryptedValue | null`).
  - `Client.fullName` is now optional (`fullName?: EncryptedValue | null`).
  - `Debt.description` is now optional (`description?: string`).
  - DTOs updated to consistently omit all BaseEntity fields.
  - JSON schemas updated to reflect new BaseEntity shape and optional fields.
  - Tests updated to include required `createdBy` in all test objects.

  ### Removed

  - `SoftDeletable` interface removed. Soft-delete fields are now part of `BaseEntity`.
  ```
- Add `[0.4.0]` link at bottom.
- Commit: `docs: add changelog entry for v0.4.0`.

### 4.3 Code Review
**Sub-agent**: `code-reviewer`

- Verify changelog follows Keep a Changelog format.
- Verify all changes from previous tasks are documented.

### 4.4 Documentation
**Sub-agent**: `docs-specialist`

- Final proofread.
- Commit if any tweaks needed.

### 4.5 Verification
**Sub-agent**: `architect`

- Verify changelog is complete and accurate.

### 4.6 Task Completion
**Sub-agent**: `implementer`

- Append `[DONE]` to Task 6 line in TODO file.
- Commit: `chore: mark task 6 complete`.

---

## Step 5: TODO File Completion & Merge

**Sub-agent**: `implementer`

- Rename TODO file to `20260625-todo-0-DONE.md`.
- Ensure all changes are committed on `feat/entity-base-refactor`.
- Switch to `main`.
- Merge `feat/entity-base-refactor`:
  - On success: delete feature branch.
  - On failure: notify user.
- If `origin` remote is set: push `main` to `origin` ONLY.
- Notify user of completion.
