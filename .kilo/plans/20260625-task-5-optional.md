# Plan — Task 5: Make `contact`, `fullName`, `description` Optional

**Date**: 2026-06-25
**Branch**: `feat/entity-base-refactor`
**Scope**: Make three entity fields optional across entity interfaces, JSON schemas, and the canonical CSV definition.

## Goal

Allow the following fields to be omitted or `null`:

| Entity   | Field         | Current type             | New type                       |
|----------|---------------|--------------------------|--------------------------------|
| Company  | `contact`     | `EncryptedValue`         | `EncryptedValue \| null` (optional) |
| Client   | `fullName`    | `EncryptedValue`         | `EncryptedValue \| null` (optional) |
| Debt     | `description` | `string`                 | `string` (optional)            |

`contact` and `fullName` follow the same nullable convention already used by sibling encrypted fields (`businessName`, `taxId`, `email`, `phone`). `description` becomes a simple optional string matching `notes`/`extraData` pattern.

## High-Level Approach

1. Update the three entity interface declarations (annotation rule: keep JSDoc, update wording to reflect optional intent).
2. Update the three JSON schemas: (a) move `contact`/`fullName` to `["object", "null"]` shape; (b) remove the three field names from each schema's top-level `required` array.
3. Update `entities-definition.csv`: flip `required` column from `Yes` to `No` for the three rows.
4. DTOs need no edits — `CreateCompanyDto`, `CreateClientDto`, `CreateDebtDto` use `Omit<...audit fields>`; making a property optional in the entity automatically makes it optional in the DTO.
5. Existing tests still satisfy the interfaces (they supply the fields, allowed since optional ≠ prohibited). Add one small assertion case per entity confirming the field can be omitted — improves coverage for the new optional behavior.
6. Build + test verification; no git actions inside this step (sub-step 4.2 commits later).

## Pre-Analysis / Technical Decisions

- **Nullability choice**: For `contact` and `fullName`, use `EncryptedValue | null` (matches existing encrypted-optional pattern in same entities — see `businessName`, `taxId`, `email`, `phone`). The DB column must be `NULL`-able; that's a downstream concern flagged in CSV only.
- **`description` (Debt)**: Plain optional `string` — no `null` (string columns stay either present or absent; aligns with `notes?: string` already present in the same entity).
- **JSON Schema shape**: For nullable optional encrypted fields, switch property `type` from `"object"` to `["object", "null"]` so a `null` payload validates. The inner `required: ["encryptedData", "keyName"]` remains exactly as-is — it only applies when the object form is present.
- **Schema `required` array**: Remove the field name from the top-level `required` array. Do NOT remove the property definition itself.
- **DTOs**: No change. `Omit<Company, 'id' | 'createdAt' | 'updatedAt'>` does not strip `contact`; the optionality modifier `?` and `| null` propagate through `Omit`.
- **Tests**: Optional types still accept an object containing the field. The existing `satisfies Company/Client/Debt` literals continue to compile. Add focused cases asserting `contact`/`fullName`/`description` may be omitted.
- **CSV**: Single source of truth for required-ness for downstream DB schema generation — must be updated in lockstep.
- **Rules compliance**: All edits ≤200 lines per file, no method bodies (interfaces only), no commented code, single-section booleans N/A. Self-documenting JSDoc preserved/updated.

## Atomic Steps

### Step 1 — Company entity interface
**File**: `src/entities/company/company.entity.ts` (line 27)
- Replace:
  ```ts
  /** Email or contact information to be displayed to the end client. */
  contact: EncryptedValue;
  ```
- With:
  ```ts
  /** Email or contact information to be displayed to the end client. Optional. */
  contact?: EncryptedValue | null;
  ```
- Verification: file still compiles (no other refs inside this file to `contact` as required).

### Step 2 — Client entity interface
**File**: `src/entities/client/client.entity.ts` (line 17-18)
- Replace:
  ```ts
  /** Full name of the debtor. */
  fullName: EncryptedValue;
  ```
- With:
  ```ts
  /** Full name of the debtor. Optional; may be completed later. */
  fullName?: EncryptedValue | null;
  ```
- Verification: no compile errors; matches synthetic sibling `full_name` pattern on User entity (already optional).

### Step 3 — Debt entity interface
**File**: `src/entities/debt/debt.entity.ts` (line 24-25)
- Replace:
  ```ts
  /** Debt concept / description. */
  description: string;
  ```
- With:
  ```ts
  /** Debt concept / description. Optional. */
  description?: string;
  ```
- Verification: compile clean.

### Step 4 — Company JSON schema
**File**: `src/schemas/company.schema.json`
- Update property `contact` (lines 30-39): change `"type": "object"` to `"type": ["object", "null"]`.
- Remove `"contact"` (line 79) from the top-level `required` array (lines 75-83). Keep all other required entries: `id`, `friendlyUrl`, `name`, `active`, `createdAt`, `updatedAt`.
- Resulting `required` array:
  ```json
  "required": [
    "id",
    "friendlyUrl",
    "name",
    "active",
    "createdAt",
    "updatedAt"
  ]
  ```

### Step 5 — Client JSON schema
**File**: `src/schemas/client.schema.json`
- Update property `fullName` (lines 9-18): change `"type": "object"` to `"type": ["object", "null"]`.
- Remove `"fullName"` (line 80) from the top-level `required` array (lines 76-84).
- Resulting `required` array:
  ```json
  "required": [
    "id",
    "companyId",
    "clientCode",
    "active",
    "createdAt",
    "updatedAt"
  ]
  ```

### Step 6 — Debt JSON schema
**File**: `src/schemas/debt.schema.json`
- Remove `"description"` (line 31) from the top-level `required` array (lines 26-39). Property definition at line 11 remains unchanged (`"description": { "type": "string" }`).
- Resulting `required` array:
  ```json
  "required": [
    "id",
    "companyId",
    "clientId",
    "debtCode",
    "totalAmount",
    "currency",
    "dueDate",
    "issueDate",
    "status",
    "createdAt",
    "updatedAt"
  ]
  ```
- Note: do NOT add `"null"` to `description` type — Debt `description` is plain optional string, not nullable per entity interface.

### Step 7 — CSV definition update
**File**: `.agent/project-info/entities-definition.csv`
- Row currently (line 9):
  `,,contact,JSONB,Yes,Email or contact information...`
- Change required column `Yes` → `No`:
  `,,contact,JSONB,No,Email or contact information to be displayed to the end client. EncryptedValue: { encryptedData: string; keyName: string; algorithm?: string; version?: number; }`
- Row currently (line 65):
  `,,full_name,JSONB,Yes,Full name of the debtor. EncryptedValue...`
- Change `Yes` → `No`:
  `,,full_name,JSONB,No,Full name of the debtor. Optional; may be completed later. EncryptedValue: { encryptedData: string; keyName: string; algorithm?: string; version?: number; }`
- Row currently (line 85):
  `,,description,String,Yes,Debt concept / description`
- Change `Yes` → `No`:
  `,,description,String,No,Debt concept / description. Optional.`

### Step 8 — DTOs verification (no edits)
**Files**: `src/entities/company/company.dto.ts`, `src/entities/client/client.dto.ts`, `src/entities/debt/debt.dto.ts`
- Confirm `Create*Dto = Omit<Entity, ...audit fields>` does not reference `contact`/`fullName`/`description`.
- Confirm no other DTO files import these fields as required.
- No file edits. Only record in commit message that optionality propagates.

### Step 9 — Test additions (optional coverage)
**File**: `src/__tests__/entities/company-and-client.test.ts`
- Inside `describe('Company entity', ...)`, add a test:
  ```ts
  it('allows omitting optional contact field', () => {
    const company = {
      id: 'comp-uuid-2',
      friendlyUrl: 'no-contact-co',
      name: 'No Contact Co',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies Company;

    expect(company.contact).toBeUndefined();
  });
  ```
- Inside `describe('Client entity', ...)`, add a test:
  ```ts
  it('allows omitting optional fullName field', () => {
    const client = {
      id: 'client-uuid-2',
      companyId: 'comp-uuid',
      clientCode: 'CLI-00043',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies Client;

    expect(client.fullName).toBeUndefined();
  });
  ```
- Do NOT modify the existing tests (they keep supplying the optional fields; valid because optional allows presence).

**File**: `src/__tests__/entities/debt-and-payment.test.ts`
- Inside `describe('Debt entity', ...)`, add a test:
  ```ts
  it('allows omitting optional description field', () => {
    const debt = {
      id: 'debt-uuid-2',
      companyId: 'comp-uuid',
      clientId: 'client-uuid',
      debtCode: 'DEUD-2026-0043',
      totalAmount: '500.00',
      currency: Currency.ARS,
      dueDate: new Date('2026-12-31'),
      issueDate: new Date('2026-01-01'),
      status: DebtStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies Debt;

    expect(debt.description).toBeUndefined();
  });
  ```
- Do NOT modify existing debt test or the Payment test.

### Step 10 — Build & test verification
- Console command (project root):
  ```pwsh
  npm run build
  ```
- Expected: TS compilation succeeds with no errors (strict mode).
- Console command:
  ```pwsh
  npm test
  ```
- Expected: all existing tests pass + the three new optional-omission tests pass.

### Step 11 — Cross-check sweep
- Use `Bifrost_find_usages` on each of the three field symbols to confirm no consumer in `src/` assumed them required (e.g., a default export, builder, or fixture). If any required-access usage is found outside tests, flag back to caller (do not silently change unrelated code).
- Expected: no consumer requires non-null access to these three fields within this repo.

## Files Touched (summary)
- `src/entities/company/company.entity.ts` (1 line)
- `src/entities/client/client.entity.ts` (1 line)
- `src/entities/debt/debt.entity.ts` (1 line)
- `src/schemas/company.schema.json` (type + required array)
- `src/schemas/client.schema.json` (type + required array)
- `src/schemas/debt.schema.json` (required array only)
- `.agent/project-info/entities-definition.csv` (3 cell edits)
- `src/__tests__/entities/company-and-client.test.ts` (+2 tests)
- `src/__tests__/entities/debt-and-payment.test.ts` (+1 test)

## Files NOT Touched
- DTOs (`*.dto.ts`) — optionality propagates via `Omit`.
- Other entity interfaces / schemas — out of scope.
- No git operations, no commits (handled in step 4.2).

## Verification Checklist
- [ ] All three entity interfaces accept omission of the field (compile check).
- [ ] `npm run build` clean.
- [ ] `npm test` green (existing + 3 new tests).
- [ ] CSV `required` column matches entity interfaces for the three fields.
- [ ] JSON schema `required` arrays no longer list the three fields.
- [ ] `contact` and `fullName` schema properties declare `["object", "null"]`.
- [ ] `description` schema property unchanged (plain `string`).
- [ ] No other source file treated field as non-null without a guard (verified via `Bifrost_find_usages`).

## Risks / Notes
- Downstream microservices consuming `Company.contact` / `Client.fullName` as required will need to handle `null`/`undefined`. This is a breaking change for them and must be communicated via changelog (handled by docs sub-step 4.4).
- DB migrations enabling NULL on the corresponding columns are out of scope of this library repo; flagged via CSV update only.