# Plan — Task 1: Merge SoftDeletable into BaseEntity

- **Date**: 2026-06-25
- **Branch**: `feat/entity-base-refactor`
- **Package**: `@cobranza-apps/entities` (v0.4.0)
- **TODO**: `.agent/todos/20260625/20260625-todo-0.md`
- **Scope**: Task 1 only — modify `BaseEntity`, remove `SoftDeletable` interface, update the interfaces barrel and the `interfaces.test.ts` suite. Clean-up of `extends SoftDeletable` in the three entity files is deferred to Task 2 (see "Out of Scope").

---

## 1. Pre-Analysis

### 1.1 Current State

`src/interfaces/base-entity.interface.ts` declares two interfaces:

```ts
export interface BaseEntity {
  id: UUID;
  createdAt: Date;
  updatedAt: Date;       // required
  createdBy?: UUID;      // optional
  updatedBy?: UUID;
}

export interface SoftDeletable {
  deletedAt?: Date;
  deletedBy?: UUID;
}
```

Barrel `src/interfaces/index.ts`:

```ts
export { BaseEntity, SoftDeletable } from './base-entity.interface';
```

`src/__tests__/interfaces.test.ts` imports both `BaseEntity` and `SoftDeletable`; contains a `describe('BaseEntity interface')` block (lines 4–18) and a `describe('SoftDeletable interface')` block (lines 20–29).

### 1.2 Target State (per caller requirements)

The new `BaseEntity` shape:

| Field        | Type    | Optionality | Change vs current                |
|--------------|---------|-------------|----------------------------------|
| `id`         | `UUID`  | required    | unchanged                        |
| `createdAt`  | `Date`  | required    | unchanged                        |
| `createdBy`  | `UUID`  | required    | **was optional**                 |
| `updatedAt`  | `Date`  | optional    | **was required**                 |
| `updatedBy`  | `UUID`  | optional    | unchanged                        |
| `deletedAt`  | `Date`  | optional    | **migrated from SoftDeletable**  |
| `deletedBy`  | `UUID`  | optional    | **migrated from SoftDeletable**  |

`SoftDeletable` is removed entirely; its export is dropped from the barrel; the tests no longer cover it.

### 1.3 Impacts / Risks

- **Build will break temporarily** until Task 2 cleans up consumers. The following files still import and `extends SoftDeletable` and are **out of scope** for Task 1 (Task 2 removes the imports and the `extends` clauses):
  - `src/entities/receipt/receipt-template.entity.ts` (lines 3, 8)
  - `src/entities/invoice/invoice-template.entity.ts` (lines 3, 8)
  - `src/entities/debt/debt-schedule.entity.ts` (lines 7, 12)
- Stale *comment* references to `SoftDeletable` (not imports) exist in:
  - `src/entities/receipt/receipt-template.dto.ts` (line 5)
  - `src/entities/invoice/invoice-template.dto.ts` (line 5)
  - `src/entities/debt/debt-schedule.dto.ts` (line 5)
  These are doc comments only and are also deferred to Task 2 / Docs.
- Task 1 therefore cannot pass `npm run typecheck`/`npm run build` by itself. The verification step runs the interfaces test in isolation and records the expected type errors in the three entity files (documented in §5).

### 1.4 Rules Compliance

- Field order: `id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `deletedAt`, `deletedBy` (identity → created → updated → deleted).
- Each audit field retains its existing JSDoc; `deletedAt`/`deletedBy` JSDoc is migrated verbatim from `SoftDeletable`.
- File stays well under the 200-line / 125-effective-line limits.

---

## 2. High-Level Approach

1. Rewrite `src/interfaces/base-entity.interface.ts`: new `BaseEntity` order/optionality; delete the `SoftDeletable` interface block (lines 23–32).
2. Update `src/interfaces/index.ts`: remove `SoftDeletable` from the re-export.
3. Rewrite `src/__tests__/interfaces.test.ts`: drop the `SoftDeletable` import and `describe` block; update the `BaseEntity` fixture so `createdBy` is present (now required) and `updatedAt` is absent (to verify it is optional); add a second case asserting all optional audit + soft-delete fields are accepted.
4. Commit with a single meaningful message.
5. Verify: run the targeted test; record expected type errors in the 3 entity files for Task 2.

No git branch/merge work in this sub-step — already on `feat/entity-base-refactor`.

---

## 3. Detailed Steps

### Step 3.1 — Rewrite `src/interfaces/base-entity.interface.ts`

Replace the entire file content with:

```ts
import { UUID } from '../types/common';

/**
 * Base entity interface that defines common fields shared by all domain entities.
 * Every entity supports soft deletion via `deletedAt` / `deletedBy`.
 */
export interface BaseEntity {
  /** Primary key identifier. */
  id: UUID;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** UUID of the user who created this entity. */
  createdBy: UUID;

  /** Timestamp when the entity was last updated. */
  updatedAt?: Date;

  /** UUID of the user who last updated this entity. */
  updatedBy?: UUID;

  /** Timestamp when the entity was soft-deleted. */
  deletedAt?: Date;

  /** UUID of the user who performed the soft deletion. */
  deletedBy?: UUID;
}
```

Diff checklist vs current file:
- Line 14 `updatedAt: Date;` → `updatedAt?: Date;` and moves below `createdBy`.
- Lines 16–17 `createdBy?: UUID;` → `createdBy: UUID;` (required) and moved above `updatedAt`.
- Lines 23–32 (entire `SoftDeletable` interface block, including the `/** Mixin interface ... */` JSDoc): delete.
- Append `deletedAt?` / `deletedBy?` with their original JSDoc from `SoftDeletable`.

Resulting file: 23 lines (well within file/line rules).

### Step 3.2 — Update `src/interfaces/index.ts`

Replace line 1:

```ts
export { BaseEntity, SoftDeletable } from './base-entity.interface';
```

with:

```ts
export { BaseEntity } from './base-entity.interface';
```

### Step 3.3 — Rewrite `src/__tests__/interfaces.test.ts`

Replace the entire file content with:

```ts
import { describe, it, expect } from 'vitest';
import type { BaseEntity } from '../interfaces/base-entity.interface';

describe('BaseEntity interface', () => {
  it('accepts a minimal entity with required audit fields only', () => {
    const entity = {
      id: 'entity-uuid',
      createdAt: new Date('2026-01-01'),
      createdBy: 'user-uuid',
    } satisfies BaseEntity;

    expect(entity.id).toBe('entity-uuid');
    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.createdBy).toBe('user-uuid');
  });

  it('accepts an entity with optional updated and soft-delete fields', () => {
    const entity = {
      id: 'entity-uuid',
      createdAt: new Date('2026-01-01'),
      createdBy: 'user-uuid',
      updatedAt: new Date('2026-01-02'),
      updatedBy: 'admin-uuid',
      deletedAt: new Date('2026-01-03'),
      deletedBy: 'admin-uuid',
    } satisfies BaseEntity;

    expect(entity.updatedAt).toBeInstanceOf(Date);
    expect(entity.deletedAt).toBeInstanceOf(Date);
    expect(entity.deletedBy).toBe('admin-uuid');
  });
});
```

Test rationale:
- Case 1 proves optionality: `updatedAt?`, `updatedBy?`, `deletedAt?`, `deletedBy?` omitted; `createdBy` present (now required) — object compiles.
- Case 2 proves all optional audit + soft-delete fields are accepted when provided.

Removed:
- `SoftDeletable` from the `import type` (line 2).
- The whole `describe('SoftDeletable interface', ...)` block (lines 20–29).

Resulting file: 30 lines, 2 cases, no `SoftDeletable` references.

---

## 4. Git Actions

After the three edits:

```bash
git add src/interfaces/base-entity.interface.ts src/interfaces/index.ts src/__tests__/interfaces.test.ts
git status
git commit -m "refactor(interfaces): merge SoftDeletable into BaseEntity

- BaseEntity: createdBy now required, updatedAt now optional
- Migrate deletedAt/deletedBy from SoftDeletable into BaseEntity
- Remove SoftDeletable interface and its barrel export
- Update interfaces.test.ts: remove SoftDeletable suite, cover BaseEntity optionality

Refs .agent/todos/20260625/20260625-todo-0.md"
```

Pre-commit (Gitignore Compliance Rule): run `git status` and confirm no `dist/`, `node_modules/`, or other ignored paths are staged.

---

## 5. Verification Steps

Run from repo root (`C:\projects\cobranza-app\entities`):

1. **Targeted unit test** (interfaces suite in isolation):
   ```bash
   npm test -- src/__tests__/interfaces.test.ts
   ```
   Expect: 2 passed, 0 failed.

2. **Lint + format check on changed files**:
   ```bash
   npm run lint -- src/interfaces/base-entity.interface.ts src/interfaces/index.ts src/__tests__/interfaces.test.ts
   npm run format:check
   ```
   Expect: no errors. If `format:check` flags the changed files, run `npm run format` and re-stage.

3. **Full typecheck — EXPECTED PARTIAL FAILURE** (out-of-scope consumers still import the removed symbol):
   ```bash
   npm run typecheck
   ```
   Expected failures (document for Task 2, do NOT fix here):
   - `src/entities/receipt/receipt-template.entity.ts:3` — Module has no exported member `SoftDeletable`.
   - `src/entities/receipt/receipt-template.entity.ts:8` — `SoftDeletable` not found.
   - `src/entities/invoice/invoice-template.entity.ts:3` and `:8` — same.
   - `src/entities/debt/debt-schedule.entity.ts:7` and `:12` — same.
   No other failures expected. If unexpected failures appear, return to the Plan Agent before proceeding.

4. **Workspace diagnostics** (quick sanity, optional):
   `vscode-mcp-server_get_diagnostics_code` with `path: "src/interfaces/base-entity.interface.ts"` and `path: "src/__tests__/interfaces.test.ts"` to confirm the two in-scope files are error-free.

---

## 6. Out of Scope (deferred — do NOT touch in this step)

- `src/entities/receipt/receipt-template.entity.ts` — removing `import type { SoftDeletable }` and `extends …, SoftDeletable`. → **Task 2**
- `src/entities/invoice/invoice-template.entity.ts` — same. → **Task 2**
- `src/entities/debt/debt-schedule.entity.ts` — same. → **Task 2**
- Stale `SoftDeletable` references in doc comments of the three `*.dto.ts` files. → **Task 2 / Docs**
- `README.md` interface table row for `SoftDeletable`. → **Docs**
- `CHANGELOG.md` mention of `SoftDeletable`. → **Docs**
- `.agent/project-info/architecture.md` `SoftDeletable` section. → **Docs**
- Version bump (per global plan, applies with the breaking-change commit at task completion).

---

## 7. Acceptance Criteria

Task 1 is complete when **all** are true:
1. `src/interfaces/base-entity.interface.ts` contains exactly one interface (`BaseEntity`) with the exact field order & optionality from §1.2, no `SoftDeletable` declaration.
2. `src/interfaces/index.ts` exports only `BaseEntity`.
3. `src/__tests__/interfaces.test.ts` has no `SoftDeletable` reference and contains the two `BaseEntity` test cases described in §3.3.
4. `npm test -- src/__tests__/interfaces.test.ts` passes (2/2).
5. `git status` shows only the three in-scope files committed; no ignored files staged.
6. The only `npm run typecheck` errors are the 6 expected errors in the three deferred entity files (§5.3).

---

## 8. Summary

This change consolidates soft-delete semantics into `BaseEntity` and tightens creation audit (`createdBy` required) while relaxing `updatedAt` to optional. The interface file shrinks by the `SoftDeletable` block, the barrel drops one named export, and the interfaces test suite is rewritten to cover both the minimal and full shapes of the new `BaseEntity`. Downstream entity clean-up and documentation updates are intentionally separated into Task 2 / Docs.