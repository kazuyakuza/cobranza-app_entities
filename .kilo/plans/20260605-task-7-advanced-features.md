# Global Plan — Advanced Features for Cobranza App Entities Library

**TODO File**: `.agent/todos/20260605/20260605-todo-0.md`
**Date**: 2026-06-05

## Pre-Analysis

### Scope Overview

The TODO defines 3 tasks (Pattern B: `# Title` → `## Heading`):

1. **Helper Types / DTOs** — Create DTO files (`*.dto.ts`) for all 20 entities
2. **JSON Schema Generation** — Create JSON Schema files (`*.schema.json`) for all 20 entities
3. **Documentation** — Create `JSON-SCHEMA-USAGE.md`

### Entities to Cover (20 total, 9 domains)

| Domain | Entities | Count |
|--------|----------|-------|
| company | Company, CompanyPlan, User, Role, CompanyUser | 5 |
| client | Client | 1 |
| debt | Debt, DebtSchedule | 2 |
| invoice | Invoice, InvoiceTemplate | 2 |
| receipt | Receipt, ReceiptTemplate | 2 |
| payment | PaymentProof, PaymentAttempt, Payment | 3 |
| bank | BankStatement, BankTransaction, PaymentMatch | 3 |
| notification | Notification, NotificationTemplate | 2 |
| summary | ClientDebtSummary, CompanyMonthlySummary | 2 |

### Task 1: DTO Design Pattern

Each entity gets one DTO file (e.g., `debt.dto.ts`) containing:
- `CreateXxxDto` — required fields for creation (omit `id`, audit fields)
- `UpdateXxxDto` — `Partial<>` of create fields, all optional
- `XxxResponse` — full entity shape (mirrors interface)

Using TypeScript utility types:
- `extends` for response DTOs
- `Omit<>` to exclude `id`, audit fields
- `Pick<>` for subset responses
- `Partial<>` for update DTOs

Files go alongside existing entity files (e.g., `src/entities/debt/debt.dto.ts`).
Domain barrel exports updated to include DTOs.

### Task 2: JSON Schema Design

Each entity gets one JSON schema file in `src/schemas/`:
- Format: JSON Schema Draft-07
- Properties: all entity fields with proper types (`string`, `number`, `integer`, `boolean`)
- `format` annotations: `uuid`, `date`, `date-time`, `email`
- `enum` for enum-typed fields
- `required` array listing non-optional fields
- `$schema`, `title`, `type`, `properties`, `required`
- Barrel: `src/schemas/index.ts` with domain-grouped exports
- `src/index.ts` updated to export schemas

### Task 3: Documentation

Single file `JSON-SCHEMA-USAGE.md` in project root covering:
- Schema sync strategy with entities
- Angular usage (dynamic forms, validation)
- NestJS usage (Swagger, Postman, AI agents)
- Generation tools/methods

---

## Global Plan Steps

### Step 2: Git Feature Branch Setup → implementer
- Commit any pending changes
- Switch to `main`
- Create branch `feat/advanced-features`
- Switch to new branch

### Step 3: Version Update → implementer
- Bump version from `0.1.0` to `0.2.0` (minor: new features — DTOs + schemas)
- Commit: `chore: bump version to 0.2.0`

---

### Task 1: Helper Types / DTOs

#### 4.1 Analysis & Planning → architect
- Analyze all 20 entity interfaces for properties, required fields, inheritance patterns
- Define precise DTO structure for each entity (Create/Update/Response types)
- Determine which TypeScript utility types to apply (`Omit`, `Pick`, `Partial`, `extends`)
- Identify special cases (e.g., Receipt uses InvoiceStatus enum, Debt extends BaseEntity, etc.)
- Save detailed plan to `.kilo/plans/20260605-task-7-dtos.md`

#### 4.2 Implementation → implementer
- Execute the DTO implementation plan
- Create DTO files for all 20 entities across 9 domains
- Update barrel exports
- Run `npm run typecheck` to verify
- Commit incrementally with meaningful messages

#### 4.3 Code Review → code-reviewer
- Review all DTO files for correctness, consistency, plan adherence
- Generate fix plan if needed
- Max 3 cycles

#### 4.4 Documentation → docs-specialist
- Add JSDoc to all DTO types
- Update README if needed to document DTO availability

#### 4.5 Verification → implementer
- Verify all files created, barrel exports working
- Run `npm run typecheck` and `npm run lint`
- Commit any remaining changes

#### 4.6 Task Completion → implementer
- Mark Task 1 checkboxes as `[x]` in TODO file
- Commit

---

### Task 2: JSON Schema Generation

#### 4.1 Analysis & Planning → architect
- Define schema generation strategy (manual, consistent with TS interfaces)
- Map TypeScript types to JSON Schema types
- Define required fields per entity
- Plan barrel export structure
- Save detailed plan to `.kilo/plans/20260605-task-7-schemas.md`

#### 4.2 Implementation → implementer
- Create `src/schemas/` directory and barrel export
- Generate schema JSON files for all 20 entities
- Update `src/index.ts` to export schemas
- Run `npm run typecheck` to verify TypeScript still compiles

#### 4.3 Code Review → code-reviewer
- Review all schema files for correctness and consistency
- Check required fields match entity interfaces
- Generate fix plan if needed

#### 4.4 Documentation → docs-specialist
- Ensure schema files include proper `$schema` and `title`
- Update barrel exports documentation

#### 4.5 Verification → implementer
- Verify all 20 schema files created
- Verify barrel exports resolve correctly
- Commit

#### 4.6 Task Completion → implementer
- Mark Task 2 checkboxes as `[x]` in TODO file
- Commit

---

### Task 3: Documentation

#### 4.1 Analysis & Planning → architect
- Research JSON Schema usage patterns in Angular and NestJS
- Define document structure for `JSON-SCHEMA-USAGE.md`
- Save detailed plan to `.kilo/plans/20260605-task-7-docs.md`

#### 4.2 Implementation → implementer
- Create `JSON-SCHEMA-USAGE.md` with full usage documentation

#### 4.3 Code Review → code-reviewer
- Review documentation for accuracy and completeness

#### 4.4 Documentation → docs-specialist
- Final polish of all documentation

#### 4.5 Verification → implementer
- Verify documentation file exists and is well-formed
- Commit

#### 4.6 Task Completion → implementer
- Mark Task 3 checkbox as `[x]` in TODO file
- Commit

---

### Step 5: TODO File Completion → implementer
- Rename TODO file to `20260605-todo-0-DONE.md`
- Switch to `main`, merge `feat/advanced-features`
- Delete feature branch
- Push `main` to `origin`

### Step 6: Continuation
- Check for remaining TODO files
- Propose next steps if any
