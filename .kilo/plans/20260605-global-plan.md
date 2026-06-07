# Global Plan — Cobranza App Entities Library

**TODO File**: `.agent/todos/20260604/20260604-todo-1.md`
**Date**: 2026-06-05
**Pattern**: C (`# Title` → `## Tasks` → `### Heading`)
**Tasks**: 8 (Tasks 1–8)

---

## Pre-Analysis: Current State

### Already Done (from TODO-0)

- `package.json` with name `@cobranza-apps/entities`, version `0.0.1`, private
- `tsconfig.json` with `strict: true`, `declaration: true`, `declarationMap: true`
- Folder structure created (all entity subdirectories, enums, types, interfaces)
- All 12 enum files exist with correct string values (debt-status, payment-status, payment-attempt-status, bank-statement-status, bank-transaction-status, notification-type, notification-channel, currency, debt-schedule-frequency, calculation-type, match-method, invoice-status)
- `src/types/common.ts`: UUID, Money types defined
- `src/interfaces/base-entity.interface.ts`: BaseEntity, SoftDeletable defined
- Barrel `index.ts` files exist in all subdirectories (mostly empty exports)
- `README.md` rewritten with project-specific content
- Git branch: `main`, clean (only TODO file modified)

### Gaps (Needs Work)

1. **Missing enum**: `NotificationStatus` (PENDING, SENT, FAILED, CANCELLED) — referenced in TODO but not created
2. **Missing types in common.ts**: `Decimal`, `JsonData` type for JSONB fields
3. **All entity interface files**: None of the 20 entity `.entity.ts` files exist — only barrel `index.ts` stubs
4. **Barrel exports**: All entity barrel files export `{}` — need to be populated
5. **Root barrel** (`src/index.ts`): Exports `{}` — needs full re-export chain
6. **ESLint + Prettier**: Not configured
7. **No test framework**: No jest/vitest setup
8. **Missing docs**: CHANGELOG.md, CONTRIBUTING.md
9. **No JSDoc** on existing types/interfaces/enums

### Constraints (from project rules)

- Max 200 lines/file (ideally 125 non-blank/non-comment), max 50 lines/method, max 2 params/method, max 2 nesting levels
- String enums only (not numeric)
- Plain interfaces only (no decorators, no runtime logic)
- Zero runtime dependencies
- camelCase properties, PascalCase entity names, UPPER_SNAKE_CASE enum values

---

## Global Plan Steps

### Step 2: Git Feature Branch Setup

- **Sub-agent**: implementer
- **Actions**:
  1. Commit unstaged `.agent/todos/20260604/20260604-todo-1.md` with message `"chore: start TODO-1 — entities library implementation"`
  2. Create feature branch `feat/implement-entities` from `main`
  3. Switch to `feat/implement-entities`

### Step 3: Version Update

- **Sub-agent**: implementer
- **Actions**:
  1. Bump version in `package.json` from `0.0.1` to `0.1.0` (minor — adding all entity definitions)
  2. Commit as `"chore: bump version to 0.1.0"`

---

### Task 1: Project Setup (ESLint + Prettier)

#### 4.1 Analysis & Planning → architect

- Scope: Install ESLint + Prettier, create configs, add lint scripts to package.json
- Generate detailed plan at `.kilo/plans/20260605-task-1-setup.md`

#### 4.2 Implementation → implementer

#### 4.3 Code Review → code-reviewer (+ implementer fix cycles)

#### 4.4 Documentation → docs-specialist

#### 4.5 Verification → implementer

#### 4.6 Task Completion → implementer

---

### Task 2: Core Types & Base Interfaces (Enhance Existing)

#### 4.1 Analysis & Planning → architect

- Scope: Enhance `src/types/common.ts`, `src/interfaces/base-entity.interface.ts`, ensure `src/enums/index.ts` barrel is complete. Add JSDoc.
- Generate detailed plan at `.kilo/plans/20260605-task-2-core-types.md`

#### 4.2 Implementation → implementer

#### 4.3 Code Review → code-reviewer (+ implementer fix cycles)

#### 4.4 Documentation → docs-specialist

#### 4.5 Verification → implementer

#### 4.6 Task Completion → implementer

---

### Task 3: Enums Definition (Complete Missing)

#### 4.1 Analysis & Planning → architect

- Scope: Create `NotificationStatus` enum (PENDING, SENT, FAILED, CANCELLED). Verify all TODOs enum list is complete. Add JSDoc to all enums.
- Generate detailed plan at `.kilo/plans/20260605-task-3-enums.md`

#### 4.2 Implementation → implementer

#### 4.3 Code Review → code-reviewer (+ implementer fix cycles)

#### 4.4 Documentation → docs-specialist

#### 4.5 Verification → implementer

#### 4.6 Task Completion → implementer

---

### Task 4: Entities Implementation (All 20 Entities)

#### 4.1 Analysis & Planning → architect

- Scope: Implement all 20 entity interface files across 9 domain directories. Include JSDoc on every property.
- Entities by domain:
  - **company/**: Company, CompanyPlan, User, Role, CompanyUser
  - **client/**: Client
  - **debt/**: Debt, DebtSchedule
  - **invoice/**: Invoice, InvoiceTemplate
  - **receipt/**: Receipt, ReceiptTemplate
  - **payment/**: PaymentProof, PaymentAttempt, Payment
  - **bank/**: BankStatement, BankTransaction, PaymentMatch
  - **notification/**: Notification, NotificationTemplate
  - **summary/**: ClientDebtSummary, CompanyMonthlySummary
- Generate detailed plan at `.kilo/plans/20260605-task-4-entities.md`

#### 4.2 Implementation → implementer

#### 4.3 Code Review → code-reviewer (+ implementer fix cycles)

#### 4.4 Documentation → docs-specialist

#### 4.5 Verification → implementer

#### 4.6 Task Completion → implementer

---

### Task 5: Organization & Exports (Populate Barrels)

#### 4.1 Analysis & Planning → architect

- Scope: Populate all barrel index.ts files (domain-level and entity-subfolder-level). Update root `src/index.ts` to re-export everything. Ensure clean import paths.
- Generate detailed plan at `.kilo/plans/20260605-task-5-exports.md`

#### 4.2 Implementation → implementer

#### 4.3 Code Review → code-reviewer (+ implementer fix cycles)

#### 4.4 Documentation → docs-specialist

#### 4.5 Verification → implementer

#### 4.6 Task Completion → implementer

---

### Task 6: Documentation (README, CHANGELOG, CONTRIBUTING)

#### 4.1 Analysis & Planning → architect

- Scope: Update README.md with usage examples, create CHANGELOG.md, create CONTRIBUTING.md (AI-agent-usable). Add JSDoc to all entities/properties.
- Generate detailed plan at `.kilo/plans/20260605-task-6-docs.md`

#### 4.2 Implementation → implementer

#### 4.3 Code Review → code-reviewer (+ implementer fix cycles)

#### 4.4 Documentation → docs-specialist

#### 4.5 Verification → implementer

#### 4.6 Task Completion → implementer

---

### Task 7: Quality & Testing

#### 4.1 Analysis & Planning → architect

- Scope: Configure Jest/Vitest with ts-jest, write enum value tests, write type compatibility tests, run `tsc --noEmit`, verify no circular deps.
- Generate detailed plan at `.kilo/plans/20260605-task-7-quality.md`

#### 4.2 Implementation → implementer

#### 4.3 Code Review → code-reviewer (+ implementer fix cycles)

#### 4.4 Documentation → docs-specialist

#### 4.5 Verification → implementer

#### 4.6 Task Completion → implementer

---

### Task 8: Extra (NestJS/Angular Examples + OpenAPI)

#### 4.1 Analysis & Planning → architect

- Scope: Create `docs/usage-nestjs.md`, `docs/usage-angular.md` with real code examples. Create `docs/openapi-examples.md` with Swagger decorator examples.
- Generate detailed plan at `.kilo/plans/20260605-task-8-extra.md`

#### 4.2 Implementation → implementer

#### 4.3 Code Review → code-reviewer (+ implementer fix cycles)

#### 4.4 Documentation → docs-specialist

#### 4.5 Verification → implementer

#### 4.6 Task Completion → implementer

---

### Step 5: TODO File Completion

- **Sub-agent**: implementer
- **Actions**:
  1. Rename `.agent/todos/20260604/20260604-todo-1.md` → `.agent/todos/20260604/20260604-todo-1-DONE.md`
  2. Merge `feat/implement-entities` into `main`
  3. Delete feature branch
  4. Push `main` to `origin` if remote is set

---

## Summary

| Step | Description | Sub-agent | Status |
|------|-------------|-----------|--------|
| 2 | Git Feature Branch Setup | implementer | pending |
| 3 | Version Update (0.0.1 → 0.1.0) | implementer | pending |
| Task 1 — 4.1 | Analysis: ESLint + Prettier | architect | pending |
| Task 1 — 4.2–4.6 | Impl, Review, Docs, Verify, Done | various | pending |
| Task 2 — 4.1 | Analysis: Core Types Enhancement | architect | pending |
| Task 2 — 4.2–4.6 | Impl, Review, Docs, Verify, Done | various | pending |
| Task 3 — 4.1 | Analysis: Missing Enums | architect | pending |
| Task 3 — 4.2–4.6 | Impl, Review, Docs, Verify, Done | various | pending |
| Task 4 — 4.1 | Analysis: 20 Entities | architect | pending |
| Task 4 — 4.2–4.6 | Impl, Review, Docs, Verify, Done | various | pending |
| Task 5 — 4.1 | Analysis: Barrel Exports | architect | pending |
| Task 5 — 4.2–4.6 | Impl, Review, Docs, Verify, Done | various | pending |
| Task 6 — 4.1 | Analysis: Documentation | architect | pending |
| Task 6 — 4.2–4.6 | Impl, Review, Docs, Verify, Done | various | pending |
| Task 7 — 4.1 | Analysis: Quality & Testing | architect | pending |
| Task 7 — 4.2–4.6 | Impl, Review, Docs, Verify, Done | various | pending |
| Task 8 — 4.1 | Analysis: Extra Examples | architect | pending |
| Task 8 — 4.2–4.6 | Impl, Review, Docs, Verify, Done | various | pending |
| 5 | TODO File Completion & Merge | implementer | pending |
