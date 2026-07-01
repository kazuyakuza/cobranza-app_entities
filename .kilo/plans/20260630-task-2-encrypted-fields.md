# Plan — Task 2, Step 4.1: Update Encrypted Fields to Accept `EncryptedValue | string`

> **Scope**: Single discrete step (4.1 Analysis & Planning) of the Critical Workflow for TODO Task 2.
> This plan covers ONLY identifying and planning type changes for encrypted fields across entity interfaces.
> It does NOT implement code changes (that is step 4.2) and does NOT touch other TODO tasks.

## 1. Task Recap

Update every encrypted field in entity interfaces so it accepts `EncryptedValue | string | null`
(nullable cases) or `EncryptedValue | string` (required non-nullable cases). This supports
read paths returning plaintext (decrypted by the microservice) as well as encrypted-container values.

## 2. Source of Truth — `EncryptedValue`

File: `src/types/encrypted.ts`

```ts
export interface EncryptedValue {
  encryptedData: string;
  keyName: string;
  algorithm?: string;
  version?: number;
}
```

No change required to this type.

## 3. File Path Discrepancy (Resolved)

The task prompt lists files as `src/entities/<area>/<name>.interface.ts`. No such files exist.
The entity interfaces actually live in `src/entities/<area>/<name>.entity.ts`. The fields named
in the task (businessName, taxId, contact, phone, fullName, email, description, reference, notes,
to, from, subject, body) all exist in those `.entity.ts` files. Therefore this plan targets the
`.entity.ts` files. No other files are in scope.

## 4. Inventory of Encrypted Fields (Current State)

Legend:
- `?` = optional
- `| null` = nullable
- Import status = whether `EncryptedValue` is already imported.

### 4.1 `src/entities/company/company.entity.ts` — import: PRESENT (line 3)

| Field        | Current type                  | Required? | Nullable? |
|--------------|-------------------------------|-----------|-----------|
| businessName | `EncryptedValue \| null`      | optional  | yes       |
| taxId        | `EncryptedValue \| null`      | optional  | yes       |
| contact      | `EncryptedValue \| null`      | optional  | yes       |
| phone        | `EncryptedValue \| null`      | optional  | yes       |

### 4.2 `src/entities/company/user.entity.ts` — import: PRESENT (line 1)

| Field   | Current type              | Required? | Nullable? |
|---------|---------------------------|-----------|-----------|
| fullName| `EncryptedValue \| null`   | optional  | yes       |
| phone   | `EncryptedValue \| null`   | optional  | yes       |

### 4.3 `src/entities/client/client.entity.ts` — import: PRESENT (line 4)

| Field   | Current type              | Required? | Nullable? |
|---------|---------------------------|-----------|-----------|
| fullName| `EncryptedValue \| null`   | optional  | yes       |
| email   | `EncryptedValue \| null`   | optional  | yes       |
| phone   | `EncryptedValue \| null`   | optional  | yes       |
| taxId   | `EncryptedValue \| null`   | optional  | yes       |

### 4.4 `src/entities/bank/bank-transaction.entity.ts` — import: PRESENT (line 5)

| Field       | Current type              | Required? | Nullable? |
|-------------|---------------------------|-----------|-----------|
| description | `EncryptedValue`           | required  | no        |
| reference   | `EncryptedValue \| null`   | optional  | yes       |

### 4.5 `src/entities/bank/bank-statement.entity.ts` — import: PRESENT (line 6)

| Field | Current type              | Required? | Nullable? |
|-------|---------------------------|-----------|-----------|
| notes | `EncryptedValue \| null`   | optional  | yes       |

### 4.6 `src/entities/payment/payment-proof.entity.ts` — import: PRESENT (line 2)

| Field | Current type              | Required? | Nullable? |
|-------|---------------------------|-----------|-----------|
| notes | `EncryptedValue \| null`   | optional  | yes       |

### 4.7 `src/entities/notification/notification.entity.ts` — import: PRESENT (line 5)

| Field  | Current type              | Required? | Nullable? |
|--------|---------------------------|-----------|-----------|
| to     | `EncryptedValue`           | required  | no        |
| from   | `EncryptedValue \| null`   | optional  | yes       |
| subject| `EncryptedValue`           | required  | no        |
| body   | `EncryptedValue`           | required  | no        |

## 5. Type-Change Rules (Authoritative)

Apply per field, preserving optionality (`?:`) and nullability exactly:

- Nullable fields currently `EncryptedValue | null` → `EncryptedValue | string | null`
  (keep `?:` if currently optional).
- Required non-nullable fields currently `EncryptedValue` → `EncryptedValue | string`
  (no `?:`, no `| null`).
- Do NOT add `string` to hash fields (`taxIdHash`, `contactHash`, `emailHash`, `referenceHash`):
  they remain `string | null` and are out of scope.
- Do NOT change field names, JSDoc comments, ordering, or imports of `EncryptedValue`
  (all already present).

## 6. Per-File Change Checklist (Exact)

### 6.1 `src/entities/company/company.entity.ts`

- Line 17: `businessName?: EncryptedValue | null;` → `businessName?: EncryptedValue | string | null;`
- Line 20: `taxId?: EncryptedValue | null;` → `taxId?: EncryptedValue | string | null;`
- Line 26: `contact?: EncryptedValue | null;` → `contact?: EncryptedValue | string | null;`
- Line 32: `phone?: EncryptedValue | null;` → `phone?: EncryptedValue | string | null;`
- Confirm import line 3 unchanged.

### 6.2 `src/entities/company/user.entity.ts`

- Line 18: `fullName?: EncryptedValue | null;` → `fullName?: EncryptedValue | string | null;`
- Line 21: `phone?: EncryptedValue | null;` → `phone?: EncryptedValue | string | null;`
- Confirm import line 1 unchanged.

### 6.3 `src/entities/client/client.entity.ts`

- Line 18: `fullName?: EncryptedValue | null;` → `fullName?: EncryptedValue | string | null;`
- Line 21: `email?: EncryptedValue | null;` → `email?: EncryptedValue | string | null;`
- Line 27: `phone?: EncryptedValue | null;` → `phone?: EncryptedValue | string | null;`
- Line 33: `taxId?: EncryptedValue | null;` → `taxId?: EncryptedValue | string | null;`
- Confirm import line 4 unchanged.

### 6.4 `src/entities/bank/bank-transaction.entity.ts`

- Line 31: `description: EncryptedValue;` → `description: EncryptedValue | string;`
- Line 34: `reference?: EncryptedValue | null;` → `reference?: EncryptedValue | string | null;`
- Confirm import line 5 unchanged.

### 6.5 `src/entities/bank/bank-statement.entity.ts`

- Line 40: `notes?: EncryptedValue | null;` → `notes?: EncryptedValue | string | null;`
- Confirm import line 6 unchanged.

### 6.6 `src/entities/payment/payment-proof.entity.ts`

- Line 25: `notes?: EncryptedValue | null;` → `notes?: EncryptedValue | string | null;`
- Confirm import line 2 unchanged.

### 6.7 `src/entities/notification/notification.entity.ts`

- Line 25: `to: EncryptedValue;` → `to: EncryptedValue | string;`
- Line 28: `from?: EncryptedValue | null;` → `from?: EncryptedValue | string | null;`
- Line 34: `subject: EncryptedValue;` → `subject: EncryptedValue | string;`
- Line 37: `body: EncryptedValue;` → `body: EncryptedValue | string;`
- Confirm import line 5 unchanged.

## 7. Summary of Total Edits

- 7 files modified.

Authoritative count (per section 6):

- Nullable → `EncryptedValue | string | null`: 14 fields
  - company: businessName, taxId, contact, phone (4)
  - user: fullName, phone (2)
  - client: fullName, email, phone, taxId (4)
  - bank-transaction: reference (1)
  - bank-statement: notes (1)
  - payment-proof: notes (1)
  - notification: from (1)
  - subtotal: 4 + 2 + 4 + 1 + 1 + 1 + 1 = 14
- Required → `EncryptedValue | string`: 4 fields
  - bank-transaction: description (1)
  - notification: to, subject, body (3)

**Total = 18 fields** (14 nullable-widened + 4 required-widened).
If any count discrepancy, rely on the per-field checklist in section 6.

## 8. Out of Scope (Explicitly NOT Changed)

- `src/types/encrypted.ts` (`EncryptedValue` definition).
- Hash fields: `taxIdHash`, `contactHash`, `emailHash`, `referenceHash` (stay `string | null`).
- DTO files (`*.dto.ts`), schema JSON files, enums, tests.
- Any non-encrypted field (e.g., `client.notes?: string`).
- Git branch operations (handled by step 4.2 implementer per Critical Workflow).

## 9. Verification (For 4.5 Verification Step)

After implementation (4.2), the architect-verifier should check:

1. Each of the 7 files still imports `EncryptedValue` from `../../types/encrypted`.
2. Each modified field's type exactly matches section 6's target.
3. Optionality (`?:`) preserved for previously-optional fields.
4. Nullability preserved (null kept where it was; not added where it wasn't).
5. No hash fields altered.
6. `npm run build` (or `tsc --noEmit` if no build script) passes.
7. Existing entity tests in `src/__tests__/entities/*.test.ts` still compile/pass.

## 10. Test / Build Step (For Implementer 4.2)

After edits, run from repo root:

```powershell
npm run build
```

If no build script exists, run:

```powershell
npx tsc --noEmit
```

Then run the test suite if present:

```powershell
npm test
```

Report any type errors tied to the changed fields (callers assigning `string` to previously
strict `EncryptedValue`-only fields should now succeed; callers relying on strict
`EncryptedValue` and pattern-matching on `.encryptedData` must handle the `string` branch).

## 11. Git Handling (For Implementer 4.2)

- This plan does not create or switch branches (step 2 of Critical Workflow handles that).
- 4.2 implementer should stage only the 7 modified `.entity.ts` files, commit with message:
  `refactor(types): allow string|EncryptedValue for encrypted entity fields`
- Follow `.kilo/rules/gitignore-compliance.md` before committing (`git status` + verify no
  gitignored files staged).

## 12. Risks / Notes

- Widening the type to include `string` may cause downstream consumers (microservices using
  this types package) to lose strict compile-time guarantees that a value is encrypted. This
  is the intended trade-off (read-path plaintext support). Callers consuming `.encryptedData`
  must type-narrow (`typeof x === 'string'`) before accessing container props.
- No breaking rename or removal; additive union member only.

## 13. Deliverable

This file: `.kilo/plans/20260630-task-2-encrypted-fields.md`