# Plan — Task 3, Step 4.1: Sync `src/schemas/*.json` to Broad DTOs & Encrypted Field Union Types

> **Scope**: Single discrete step (4.1 Analysis & Planning) of the Critical Workflow for TODO Task 3.
> This plan covers ONLY syncing JSON Schemas in `src/schemas/` with the broad DTOs and the new
> `EncryptedValue | string | null` / `EncryptedValue | string` union types introduced for entity
> interfaces in Task 2. It does NOT implement code changes (that is step 4.2) and does NOT touch
> other TODO tasks.

## 1. Task Recap

Sync `src/schemas/*.json` so encrypted fields declare the union `["object", "string", "null"]`
(nullable cases) or `["object", "string"]` (required non-nullable cases), mirroring the entity
interface changes from Task 2 (`.kilo/plans/20260630-task-2-encrypted-fields.md`), and verify
that `required` arrays remain consistent with the broad DTO philosophy.

## 2. Source of Truth

- Task 2 plan: `.kilo/plans/20260630-task-2-encrypted-fields.md` — the authoritative list of which
  entity fields became `EncryptedValue | string | null` (nullable) and `EncryptedValue | string`
  (required). Schemas must mirror exactly the same 7 entity files / 18 fields.
- `EncryptedValue` interface: `src/types/encrypted.ts` (already mirrored in each schema as the
  inner `properties` block: `encryptedData`, `keyName`, `algorithm`, `version` with
  `required: ["encryptedData", "keyName"]`). No change to inner object shape.

## 3. Schema File Inventory (22 files)

| # | File | Encrypted fields? | Change? |
|---|------|-------------------|---------|
| 1 | `company.schema.json` | YES: businessName, taxId, contact, phone | YES |
| 2 | `user.schema.json` | YES: fullName, phone | YES |
| 3 | `role.schema.json` | no | NO |
| 4 | `company-user.schema.json` | no | NO |
| 5 | `company-plan.schema.json` | no | NO |
| 6 | `client.schema.json` | YES: fullName, email, phone, taxId | YES |
| 7 | `client-debt-summary.schema.json` | no | NO |
| 8 | `debt.schema.json` | no | NO |
| 9 | `debt-schedule.schema.json` | no | NO |
| 10 | `invoice.schema.json` | no | NO |
| 11 | `invoice-template.schema.json` | no | NO |
| 12 | `receipt.schema.json` | no | NO |
| 13 | `receipt-template.schema.json` | no | NO |
| 14 | `payment.schema.json` | no | NO |
| 15 | `payment-proof.schema.json` | YES: notes | YES |
| 16 | `payment-attempt.schema.json` | no | NO |
| 17 | `payment-match.schema.json` | no | NO |
| 18 | `bank-statement.schema.json` | YES: notes | YES |
| 19 | `bank-transaction.schema.json` | YES: description, reference | YES |
| 20 | `notification.schema.json` | YES: to, subject, body, from | YES |
| 21 | `notification-template.schema.json` | no | NO |
| 22 | `company-monthly-summary.schema.json` | no | NO |

**Files to modify: 7.** Files unchanged: 15.

## 4. Type-Change Rules (Authoritative)

Apply only to the encrypted field's top-level `"type"` member. The inner `properties` /
`required` block (the `EncryptedValue` object shape) is preserved unchanged.

- **Nullable encrypted field** currently `"type": ["object", "null"]`
  → `"type": ["object", "string", "null"]` (keep `?:` semantics implied by absence from the
  schema's top-level `required` array).
- **Required non-nullable encrypted field** currently `"type": "object"` (single-string form)
  → `"type": ["object", "string"]`.
- **Order convention**: keep `"object"` first, then `"string"`, then `"null"` — mirroring the TS
  union order `EncryptedValue | string | null` / `EncryptedValue | string`.
- **Do NOT touch** hash fields: `taxIdHash`, `emailHash`, `contactHash`, `referenceHash`
  (stay `"type": ["string", "null"]`). They are out of scope and were unchanged in Task 2.
- **Do NOT change** field names, nesting, inner object `properties`, inner `required`, top-level
  `required` arrays, `enum`s, `$schema`, `title`, or any non-encrypted property.
- **Do NOT add** `"additionalProperties"`, `$ref`, or any new keys. Minimal `type`-only edits.

## 5. Required-Array Verification (Task Step 4)

The task asked to verify whether any `required` array incorrectly omits business fields that
should be present per the broad DTO philosophy. Verification performed by comparing each
schema's top-level `required` array against the corresponding entity interface optionality
for 5 representative schemas spanning encrypted and non-encrypted entities:

| Schema | Entity required business fields (non-optional) | Schema `required` extra members beyond audit | Match? |
|--------|------------------------------------------------|----------------------------------------------|--------|
| `notification.schema.json` | companyId, to, type, subject, body, channel, status | companyId, to, type, subject, body, channel, status | YES |
| `debt.schema.json` | companyId, clientId, debtCode, totalAmount, currency, dueDate, issueDate, status | companyId, clientId, debtCode, totalAmount, currency, dueDate, issueDate, status | YES |
| `payment-attempt.schema.json` | companyId, clientId, paymentProofId, debtId, status | companyId, clientId, paymentProofId, debtId, status | YES |
| `bank-transaction.schema.json` | bankStatementId, companyId, transactionDate, amount, currency, description, status | bankStatementId, companyId, transactionDate, amount, currency, description, status | YES |
| `client.schema.json` | companyId, clientCode, active | companyId, clientCode, active | YES |

All schemas include the audit identifiers `id`, `createdAt`, `createdBy` in `required`
(mirroring `BaseEntity`'s always-present members). Optional/nullable business fields
(including all nullable encrypted fields) are correctly omitted from `required`.

### Conclusion

- `required` arrays are correct. **No `required` array edits in this task.**
- The broad DTO philosophy applies to *DTO* optionality, not persisted-entity schemas; the
  schema `required` arrays already correctly require all non-optional business fields.
- `required` array changes are **OUT OF SCOPE** for Task 3.

## 6. Per-Schema Change Checklist (Exact)

Legend for each field:
- **nullable** = currently `"type": ["object", "null"]` → target `"type": ["object", "string", "null"]`
- **required** = currently `"type": "object"` → target `"type": ["object", "string"]`

### 6.1 `src/schemas/user.schema.json`

- `fullName` — **nullable**. Change `"type": ["object", "null"]` → `"type": ["object", "string", "null"]`.
- `phone` — **nullable**. Change `"type": ["object", "null"]` → `"type": ["object", "string", "null"]`.
- Inner properties of `fullName` and `phone` unchanged.
- (2 field edits.)

### 6.2 `src/schemas/company.schema.json`

- `businessName` — **nullable**.
- `taxId` — **nullable**.
- `contact` — **nullable**.
- `phone` — **nullable**.
- `taxIdHash` and `contactHash` unchanged (out of scope).
- (4 field edits.)

### 6.3 `src/schemas/client.schema.json`

- `fullName` — **nullable**.
- `email` — **nullable**.
- `phone` — **nullable**.
- `taxId` — **nullable**.
- `emailHash` and `taxIdHash` unchanged (out of scope).
- (4 field edits.)

### 6.4 `src/schemas/payment-proof.schema.json`

- `notes` — **nullable**.
- (1 field edit.)

### 6.5 `src/schemas/bank-statement.schema.json`

- `notes` — **nullable**.
- (1 field edit.)

### 6.6 `src/schemas/bank-transaction.schema.json`

- `description` — **required**. Currently `"type": "object"` → `"type": ["object", "string"]`.
- `reference` — **nullable**.
- `referenceHash` unchanged (out of scope).
- (2 field edits.)

### 6.7 `src/schemas/notification.schema.json`

- `to` — **required**. Currently `"type": "object"` → `"type": ["object", "string"]`.
- `from` — **nullable**.
- `subject` — **required**. Currently `"type": "object"` → `"type": ["object", "string"]`.
- `body` — **required**. Currently `"type": "object"` → `"type": ["object", "string"]`.
- (4 field edits.)

## 7. Summary of Total Edits

- Files modified: **7**.
- Nullable encrypted fields widened (`["object", "null"]` → `["object", "string", "null"]`): **14**
  - user: fullName, phone (2)
  - company: businessName, taxId, contact, phone (4)
  - client: fullName, email, phone, taxId (4)
  - payment-proof: notes (1)
  - bank-statement: notes (1)
  - bank-transaction: reference (1)
  - notification: from (1)
  - subtotal: 2 + 4 + 4 + 1 + 1 + 1 + 1 = 14
- Required non-nullable encrypted fields widened (`"object"` → `["object", "string"]`): **4**
  - bank-transaction: description (1)
  - notification: to, subject, body (3)
- **Total = 18 field edits** across 7 files (matches Task 2's 18-field count, as expected).
- `required` array edits: **0**.
- Hash field edits: **0**.
- Inner `properties`/inner `required` of EncryptedValue object: **0** changes.
- If a count discrepancy arises during implementation, defer to the per-field checklist in section 6.

## 8. Out of Scope (Explicitly NOT Changed)

- Any of the 15 schemas without encrypted fields.
- Hash fields (`taxIdHash`, `emailHash`, `contactHash`, `referenceHash`).
- Top-level `required` arrays (verified correct; section 5).
- Inner `EncryptedValue` object shape (`encryptedData`, `keyName`, `algorithm`, `version`).
- Entity interfaces (`*.entity.ts`), DTOs (`*.dto.ts`), enums, types, tests.
- `src/schemas/index.ts` barrel (schema set unchanged; no import/export edits).
- Git branch operations (handled by Critical Workflow step 2 / 4.2 implementer).

## 9. Implementation Notes for 4.2 (Implementer)

- Use structured JSON edits (`vscode-mcp-server_replace_lines_code` or `edit`) with the smallest
  possible `oldString` to avoid collateral changes; JSON whitespace is 2-space indented.
- Preserve exact key ordering and indentation of each file. The only token changed in each
  edited field is the `"type"` value.
- After edits, validate JSON syntactically (build will parse them via `resolveJsonModule`):
  ```powershell
  npm run typecheck
  ```
- Full validation suite:
  ```powershell
  npm run build
  npm test
  npm run test:circular
  npm run lint
  ```
- Expect: typecheck/build succeed (JSON well-formed); no Ajv-style runtime schema-content tests
  exist (verified: no `ajv`/schema-validators in `*.test.ts`), so build/typecheck JSON parse is
  the automated guard. Lint/prettier target `src/**/*.ts` only (JSON not linted).
- Manual diff review is the primary correctness gate for schema content (see section 10).

## 10. Verification Checklist for 4.5 (Architect)

1. Exactly 7 schema files modified; all 15 non-encrypted schemas untouched.
2. Each of the 18 encrypted field `type` declarations matches section 6 targets verbatim.
3. Nullable fields became `["object", "string", "null"]`; required non-nullable became
   `["object", "string"]`.
4. Inner `properties` blocks of each encrypted field unchanged (`encryptedData`, `keyName`,
   `algorithm`, `version` + inner `required: ["encryptedData", "keyName"]`).
5. No hash field type altered.
6. No top-level `required` array altered (still includes only non-optional business fields +
   `id`/`createdAt`/`createdBy`).
7. `src/schemas/index.ts` barrel unchanged.
8. `npm run typecheck`, `npm run build`, `npm test`, `npm run test:circular`, `npm run lint` all
   pass.
9. `git diff --stat` shows only the 7 `*.schema.json` files.
10. Confirm consistency with Task 2's entity interface union types (same 7 entities, same 18
    fields, same nullable/required partition).

## 11. Git Handling (For Implementer 4.2)

- This plan does not create or switch branches (Critical Workflow step 2 handles that).
- Stage only the 7 modified `src/schemas/*.schema.json` files; commit message:
  `refactor(schemas): allow string|EncryptedValue for encrypted JSON schema fields`
- Follow `.kilo/rules/gitignore-compliance.md` before committing: run `git status`, confirm no
  gitignored or non-schema files are staged, and that no dependency dirs (`node_modules/`,
  `dist/`) are staged.

## 12. Risks / Notes

- JSON Schema consumers (microservices) that previously emitted a strict `object` will now accept
  raw plaintext `string` for these fields on the read path. This is the intended Task 2 trade-off
  (read-path plaintext support). The inner `EncryptedValue` object validation is preserved, so
  encrypted containers still validate strictly when present.
- Adding `"string"` to a `type` array is additive and non-breaking for validators that treat
  `type` as a set of allowed types (draft-07 semantics).
- No `required`-array change means nullable encrypted fields remain optional in schema
  validation, consistent with entity optionality.
- No automated schema-content tests exist; rely on diff review (section 10).

## 13. Deliverable

This file: `.kilo/plans/20260630-task-3-schema-sync.md`