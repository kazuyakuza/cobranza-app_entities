# Contributing to @cobranza-apps/entities

This document provides precise, step-by-step instructions for adding or modifying entities, enums, types, and interfaces in this library. It is designed to be consumed by both human developers and AI coding agents.

**Prerequisite**: Read [`AGENTS.md`](AGENTS.md) and follow the Critical Workflow defined in `.agent/WORKFLOWS.md` before making any changes.

---

## Table of Contents

1. [Project Constraints](#project-constraints)
2. [How to Add a New Entity](#how-to-add-a-new-entity)
3. [How to Add a New Enum](#how-to-add-a-new-enum)
4. [How to Modify an Existing Entity or Enum](#how-to-modify-an-existing-entity-or-enum)
5. [Barrel Export Rules](#barrel-export-rules)
6. [JSDoc Requirements](#jsdoc-requirements)
7. [Naming Conventions](#naming-conventions)
8. [Build and Validation Workflow](#build-and-validation-workflow)
9. [Code Quality Checks](#code-quality-checks)

---

## Project Constraints

Before changing any file, verify that your change respects these hard constraints. If a change violates a constraint, stop and ask for clarification.

| Constraint | Rule |
|------------|------|
| **No runtime logic** | This library exports only interfaces, types, and enums. Do not add classes, functions, services, side effects, or network calls. |
| **Zero runtime dependencies** | Do not add packages to `dependencies` in `package.json`. All tooling belongs in `devDependencies`. |
| **Strict TypeScript** | `strict: true` is enabled. Do not use `any`. |
| **String enums only** | All enums must be string enums (`export enum X { FOO = 'FOO' }`). Numeric enums are forbidden. |
| **Multi-tenancy** | Every major entity must include `companyId: string`. |
| **Audit fields** | All entities extend `BaseEntity`, which includes `id`, `createdAt`, `createdBy` (required), `updatedAt?`, `updatedBy?`, `deletedAt?`, `deletedBy?`. |
| **Soft delete** | Soft-delete fields (`deletedAt?`, `deletedBy?`) are part of `BaseEntity` and available on all entities. |
| **Max file size** | Source files must not exceed 200 lines (excluding blanks and comments), ideally under 125 active lines. |
| **Max method size** | Function/method bodies must not exceed 50 lines. |
| **Max arguments** | Methods must have at most 2 parameters; use object types for more. |
| **Max nesting depth** | Maximum 2 levels of nesting; extract logic beyond that. |
| **Private by default** | Class members should be `private` unless public access is necessary. |
| **No commented code** | Never leave commented-out code in the codebase. Use version control history instead. |

---

## How to Add a New Entity

Follow these steps in exact order. Do not skip steps.

### Step 1: Choose the correct domain folder

Determine which domain the entity belongs to. Use the existing folder structure under `src/entities/`:

| Domain | Folder |
|--------|--------|
| Core & Multi-Tenancy | `src/entities/company/` |
| Clients | `src/entities/client/` |
| Debts | `src/entities/debt/` |
| Payments | `src/entities/payment/` |
| Banking | `src/entities/bank/` |
| Invoicing | `src/entities/invoice/` |
| Receipts | `src/entities/receipt/` |
| Notifications | `src/entities/notification/` |
| Summaries | `src/entities/summary/` |

If none of the above domains fit, create a new folder under `src/entities/` and update `.agent/project-structure.md`.

### Step 2: Name the file

Use kebab-case and the `.entity.ts` suffix:

```
new-entity-name.entity.ts
```

Example: `debt-payment-plan.entity.ts`

### Step 3: Define the interface

Create the file with this exact structure:

```typescript
import type { UUID } from '../../types/common';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * One-sentence description of what this entity represents.
 */
export interface NewEntityName extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** Property description. */
  someProperty: string;
}
```

Rules:

- Import types using `import type` when the import is used only as a type.
- Extend `BaseEntity` (all entities do — it provides `id`, `createdAt`, `createdBy`, `updatedAt?`, `updatedBy?`, `deletedAt?`, `deletedBy?`).
- Use shared types from `src/types/common.ts` (`UUID`, `Money`, `Decimal`, `JsonData`, `DateString`) instead of raw primitives when applicable.
- Use shared enums from `src/enums/` for enumerated fields.
- Every property must have a JSDoc comment (see [JSDoc Requirements](#jsdoc-requirements)).

### Step 4: Export from the domain barrel

Open `src/entities/<domain>/index.ts` and add:

```typescript
export * from './new-entity-name.entity';
```

If the domain barrel does not exist, create it with that single line.

### Step 5: Verify the root barrel

Open `src/entities/index.ts`. Ensure it re-exports the domain barrel:

```typescript
export * from './<domain>';
```

If the domain is new, add this line. Do not add individual entity files to the root barrel; only domain barrels are allowed.

### Step 6: Run validation

Execute the commands in [Build and Validation Workflow](#build-and-validation-workflow). Fix any errors before committing.

---

## How to Add a New Enum

### Step 1: Name the file

Place the file in `src/enums/` using kebab-case and the `.enum.ts` suffix:

```
new-status.enum.ts
```

### Step 2: Define the enum

Use string values only. Numeric enums are forbidden.

```typescript
/**
 * Description of what this enum represents.
 */
export enum NewStatus {
  VALUE_ONE = 'VALUE_ONE',
  VALUE_TWO = 'VALUE_TWO',
}
```

### Step 3: Export from the enum barrel

Open `src/enums/index.ts` and add:

```typescript
export * from './new-status.enum';
```

### Step 4: Run validation

Execute the commands in [Build and Validation Workflow](#build-and-validation-workflow).

---

## How to Modify an Existing Entity or Enum

1. Open the relevant file under `src/entities/` or `src/enums/`.
2. Make the minimal required change.
3. If you add a new property, add a JSDoc comment.
4. If you add a new enum value, append it to the enum; do not reorder existing values unless breaking changes are explicitly approved.
5. Run validation.
6. Update `CHANGELOG.md` under the `[Unreleased]` section with a description of the change.

---

## Barrel Export Rules

- Every folder under `src/` must contain an `index.ts` barrel file that re-exports all public symbols in that folder.
- Root barrels (`src/entities/index.ts`, `src/enums/index.ts`, `src/types/index.ts`, `src/interfaces/index.ts`) must re-export only their immediate child barrels, never individual files directly.
- `src/index.ts` re-exports the four root barrels.
- Consumer import path:

```typescript
import { Client, Debt, DebtStatus } from '@cobranza-apps/entities';
```

---

## JSDoc Requirements

Every exported symbol must have a JSDoc block comment. Follow these exact rules:

| Symbol | JSDoc Rule |
|--------|------------|
| **Entity interface** | One-line description of what the entity represents. |
| **Enum** | One-line description of what the enum represents. |
| **Property** | One-line description starting with a capital letter and ending with a period. If the property is optional, the description must not say "optional" — the `?` in the type already conveys that. |
| **Type alias** | One-line description of the type's purpose. |

Example:

```typescript
/**
 * Status of an individual debt.
 */
export enum DebtStatus {
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE',
}

/**
 * Individual debt.
 */
export interface Debt extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** Daily interest rate after due date (e.g., 0.0050 = 0.5% daily). Null = no interest. */
  dailyInterestRate?: Decimal;
}
```

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Entity files | kebab-case, `.entity.ts` | `payment-attempt.entity.ts` |
| Enum files | kebab-case, `.enum.ts` | `debt-status.enum.ts` |
| Type files | kebab-case, `.ts` | `common.ts` |
| Interface files | kebab-case, `.interface.ts` or `.entity.ts` | `base-entity.interface.ts` |
| Barrel files | `index.ts` | `entities/index.ts` |
| Entity names | PascalCase, singular | `PaymentAttempt` |
| Property names | camelCase | `companyId`, `totalAmount` |
| Enum values | UPPER_SNAKE_CASE | `PARTIALLY_PAID` |
| Primary keys | `id` (UUID) | `id: string` |
| Foreign keys | camelCase with `Id` suffix | `companyId`, `clientId` |

---

## Build and Validation Workflow

Run these commands in order after any code change. All must pass.

```bash
# 1. Type-check without emitting
npm run typecheck

# 2. Lint
npm run lint

# 3. Check formatting
npm run format:check

# 4. Build
npm run build
```

If any command fails, fix the issue before committing.

---

## Code Quality Checks

- **Self-documenting code**: Use clear and descriptive names. Avoid comments that merely restate the code.
- **No magic numbers**: Replace hardcoded values with named constants.
- **Single-section boolean conditions**: Keep conditions in `if` / `while` to a single section. If more than one section is required, extract it into a descriptively named method.
- **Prefer private members**: Define class members as `private` by default. Make them `public` only when external access is required.
- **Assertions**: Include assertions wherever possible to validate assumptions and catch potential errors early.
