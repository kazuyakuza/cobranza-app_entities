# Plan — Task 4: Update DTOs, Tests, and JSON Schemas for BaseEntity refactor

- **Date**: 2026-06-25
- **Branch**: `feat/entity-base-refactor`
- **Package**: `@cobranza-apps/entities` (v0.4.0)
- **TODO**: `.agent/todos/20260625/20260625-todo-0.md` — line 4: *"update dtos of modified entities, and related tests. Same for schemas json files"*
- **Scope**: Task 4 only — align all 22 `Create*Dto`/`Update*Dto`/`*Response` type aliases and all 22 JSON Schema files with the post-refactor `BaseEntity` shape (Task 1) and the `extends BaseEntity` cleanup (Task 2). Add DTO type-level tests.
- **Design decision (per caller)**: **Option B — inline literal unions per DTO.** Do NOT introduce a shared `BaseEntityKey` type/const. Each `Create*Dto` writes its own inline `Omit<Entity, …>` union.

---

## 1. Pre-Analysis

### 1.1 New BaseEntity shape (from Task 1, already merged)

`src/interfaces/base-entity.interface.ts`:

```ts
export interface BaseEntity {
  id: UUID;
  createdAt: Date;    // required
  createdBy: UUID;   // required  ← NEW (was optional)
  updatedAt?: Date;   // optional  ← (was required)
  updatedBy?: UUID;
  deletedAt?: Date;   // ← migrated from SoftDeletable
  deletedBy?: UUID;   // ← migrated from SoftDeletable
}
```

Implications for this task:

- `createdBy` is now a **required** field on every entity, so every `Create*Dto` must **omit** `createdBy` (it is injected by the service layer from the auth context, not supplied by the API caller).
- `updatedAt`/`updatedBy`/`deletedAt`/`deletedBy` are optional and system-managed → must be **omitted** from every `Create*Dto`.
- JSON Schemas must declare all four `createdBy`/`updatedBy`/`deletedAt`/`deletedBy` (where missing) and set `required` to include `createdAt` + `createdBy` (NOT `updatedAt`, which is now optional).

### 1.2 Canonical omit union (inline per DTO — Option B)

Every `Create*Dto` uses `Omit<Entity, BaseEntityAudit | EntitySpecificSystem>` where the **inline** audit union is:

```ts
'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
```

Entity-specific system-managed keys (counted transactions, review fields, derived summary fields, etc.) are appended to this union inline on the affected DTOs only.

### 1.3 Current-state summary (audit coverage)

| # | DTO file | Current `Omit` keys | Audit keys present in schema |
|---|----------|----------------------|------------------------------|
| 1 | `bank/bank-statement.dto.ts` | `id \| createdAt \| updatedAt \| createdBy \| updatedBy \| totalTransactions` | createdAt, updatedAt, createdBy, updatedBy |
| 2 | `bank/bank-transaction.dto.ts` | `id \| createdAt \| updatedAt` | createdAt, updatedAt |
| 3 | `bank/payment-match.dto.ts` | `id \| matchedAt` | (none) |
| 4 | `client/client.dto.ts` | `id \| createdAt \| updatedAt \| updatedBy` | createdAt, updatedAt, updatedBy |
| 5 | `company/company-plan.dto.ts` | `id \| createdAt \| updatedAt` | createdAt, updatedAt |
| 6 | `company/company-user.dto.ts` | `id \| createdAt \| updatedAt` | createdAt, updatedAt |
| 7 | `company/company.dto.ts` | `id \| createdAt \| updatedAt` | createdAt, updatedAt |
| 8 | `company/role.dto.ts` | `id \| createdAt` | createdAt |
| 9 | `company/user.dto.ts` | `id \| createdAt \| updatedAt \| passwordHash \| passwordUpdatedAt \| lastLoginAt` | createdAt, updatedAt |
| 10 | `debt/debt.dto.ts` | `id \| createdAt \| updatedAt \| createdBy \| updatedBy` | createdAt, updatedAt, createdBy, updatedBy |
| 11 | `debt/debt-schedule.dto.ts` | full set + `lastGeneratedDate` | full set incl deletedAt/deletedBy |
| 12 | `invoice/invoice.dto.ts` | `id \| createdAt \| updatedAt \| createdBy \| updatedBy` | createdAt, updatedAt, createdBy, updatedBy |
| 13 | `invoice/invoice-template.dto.ts` | full set incl deletedAt/deletedBy | full set incl deletedAt/deletedBy |
| 14 | `notification/notification.dto.ts` | `id \| createdAt \| sentAt` | createdAt |
| 15 | `notification/notification-template.dto.ts` | `id \| createdAt \| updatedAt \| createdBy \| updatedBy` | createdAt, updatedAt, createdBy, updatedBy |
| 16 | `payment/payment.dto.ts` | `id \| createdAt \| updatedAt \| createdBy \| updatedBy` | createdAt, updatedAt, createdBy, updatedBy |
| 17 | `payment/payment-attempt.dto.ts` | `id \| createdAt \| updatedAt \| reviewedBy \| reviewedAt \| amount \| currency` | createdAt, updatedAt |
| 18 | `payment/payment-proof.dto.ts` | `id \| createdAt \| createdBy` | createdAt, createdBy |
| 19 | `receipt/receipt.dto.ts` | `id \| createdAt \| updatedAt \| createdBy \| updatedBy` | createdAt, updatedAt, createdBy, updatedBy |
| 20 | `receipt/receipt-template.dto.ts` | full set incl deletedAt/deletedBy | full set incl deletedAt/deletedBy |
| 21 | `summary/client-debt-summary.dto.ts` | `id \| updatedAt \| lastPaymentId \| lastDebtId \| lastPaymentDate \| lastDebtDate` | updatedAt only (missing createdAt!) |
| 22 | `summary/company-monthly-summary.dto.ts` | `id \| createdAt \| updatedAt` | createdAt, updatedAt |

Inconsistencies to fix: audit omit coverage is partial across DTOs; `client-debt-summary.schema.json` is missing `createdAt` entirely and its `required` lists `updatedAt`.

### 1.4 DTO-barrel impact

DTOs are re-exported as type aliases from per-domain `index.ts` barrels (e.g. `src/entities/company/index.ts`). The exported **names** (`Create*Dto`, `Update*Dto`, `*Response`) are unchanged, so no barrel edits are required. Verification only.

### 1.5 Test impact

Existing entity test files (`src/__tests__/entities/*.test.ts`) and `src/__tests__/interfaces.test.ts` already include `createdBy` and provide `updatedAt` only as optional values — they were updated in Tasks 1 & 2 and currently type-check. No DTO tests exist today. To satisfy *"related tests"* and to lock in the new Omit pattern, add a new type-level test file `src/__tests__/dtos.test.ts` asserting that every `Create*Dto` excludes the full audit set and exposes the required business fields.

### 1.6 Rules Compliance

- `max-lines-per-file` (200 / ~125 effective): all DTO files remain <30 lines; test file planned ~110 lines — within limits. JSON Schemas are config files, rule does not apply.
- `max-arguments-per-method`: N/A (type aliases, no function params).
- `single-section-boolean-conditions`: N/A.
- `prefer-private-members`: N/A (type aliases).
- `no-commented-code`: no commented code introduced.
- `self-documenting-code`: keep/update JSDoc on the Omit clauses to name the omitted audit fields.
- `newline-prevention`: real newlines only.

---

## 2. High-Level Approach

1. **DTOs (22 files)** — normalize every `Create*Dto` to the inline Option B omit union (full audit set + entity-specific system fields). Update the JSDoc line above each Omit to list the omitted audit fields. `Update*Dto = Partial<Create*Dto>` and `*Response = Entity` are unchanged in shape but kept in sync.
2. **Schemas (22 files)** — add missing audit properties (`createdBy`, `updatedBy`, `deletedAt`, `deletedBy`, and `createdAt` for `client-debt-summary`); normalize every `required` array to include `createdAt` + `createdBy` and **remove** `updatedAt` (now optional). Keep all non-audit properties/required entries untouched.
3. **Tests** — add `src/__tests__/dtos.test.ts` (type-level guards). Leave existing entity/interface tests untouched (already correct).
4. **Verify** — `npm run typecheck`, `npm test`, `npm run lint`, `npm run format:check`, `npm run test:circular`.
5. **Git** — three logical commits (DTOs / schemas / tests) on the current feature branch.

---

## 3. DTO Changes (Option B — inline omit unions)

Canonical audit union (inline, repeated per DTO):

```ts
'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
```

For each file below, only the `Create*Dto` Omit clause changes. Keep the leading JSDoc and the `Update*Dto`/`*Response` lines. Where shown, replace the indicated lines.

### 3.1 `src/entities/bank/bank-statement.dto.ts` — add full audit set + keep `totalTransactions`

Replace lines 12–15:

```ts
export type CreateBankStatementDto = Omit<
  BankStatement,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy' | 'totalTransactions'
>;
```

### 3.2 `src/entities/bank/bank-transaction.dto.ts` — add full audit set

Replace line 11:

```ts
export type CreateBankTransactionDto = Omit<
  BankTransaction,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
```

### 3.3 `src/entities/bank/payment-match.dto.ts` — add full audit set + keep `matchedAt`

Replace line 7:

```ts
export type CreatePaymentMatchDto = Omit<
  PaymentMatch,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy' | 'matchedAt'
>;
```

### 3.4 `src/entities/client/client.dto.ts` — add full audit set

Replace line 11:

```ts
export type CreateClientDto = Omit<
  Client,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
```

### 3.5 `src/entities/company/company-plan.dto.ts` — add full audit set

Replace line 6:

```ts
export type CreateCompanyPlanDto = Omit<
  CompanyPlan,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
```

### 3.6 `src/entities/company/company-user.dto.ts` — add full audit set

Replace line 6:

```ts
export type CreateCompanyUserDto = Omit<
  CompanyUser,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
```

### 3.7 `src/entities/company/company.dto.ts` — add full audit set

Replace line 12:

```ts
export type CreateCompanyDto = Omit<
  Company,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
```

Update the JSDoc above (lines 3–11): change `Omits system-generated \`id\`, \`createdAt\`, and \`updatedAt\`.` → `Omits the system-managed BaseEntity audit fields (\`id\`, \`createdAt\`, \`createdBy\`, \`updatedAt\`, \`updatedBy\`, \`deletedAt\`, \`deletedBy\`).`

### 3.8 `src/entities/company/role.dto.ts` — add full audit set

Replace line 6:

```ts
export type CreateRoleDto = Omit<
  Role,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
```

### 3.9 `src/entities/company/user.dto.ts` — add full audit set + keep entity-specific system keys

Replace lines 12–15:

```ts
export type CreateUserDto = Omit<
  User,
  | 'id'
  | 'createdAt'
  | 'createdBy'
  | 'updatedAt'
  | 'updatedBy'
  | 'deletedAt'
  | 'deletedBy'
  | 'passwordHash'
  | 'passwordUpdatedAt'
  | 'lastLoginAt'
>;
```

### 3.10 `src/entities/debt/debt.dto.ts` — add `deletedAt`/`deletedBy` (already had the rest)

Replace lines 7–10:

```ts
export type CreateDebtDto = Omit<
  Debt,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
```

### 3.11 `src/entities/debt/debt-schedule.dto.ts` — already full audit set; keep `lastGeneratedDate` (no change needed)

Current lines 7–17 already omit the full audit set plus `lastGeneratedDate`. **No edit required.** Verify only.

### 3.12 `src/entities/invoice/invoice.dto.ts` — add `deletedAt`/`deletedBy`

Replace lines 6–9:

```ts
export type CreateInvoiceDto = Omit<
  Invoice,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
```

### 3.13 `src/entities/invoice/invoice-template.dto.ts` — already full audit set (no change needed)

Current lines 7–10 already omit the full audit set incl `deletedAt`/`deletedBy`. **No edit required.** Verify only.

### 3.14 `src/entities/notification/notification.dto.ts` — add full audit set + keep `sentAt`

Replace line 12:

```ts
export type CreateNotificationDto = Omit<
  Notification,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy' | 'sentAt'
>;
```

Update JSDoc line 5: `Omits system-generated \`sentAt\`.` → `Omits the system-managed BaseEntity audit fields and the system-generated \`sentAt\`.`

### 3.15 `src/entities/notification/notification-template.dto.ts` — add `deletedAt`/`deletedBy`

Replace lines 6–9:

```ts
export type CreateNotificationTemplateDto = Omit<
  NotificationTemplate,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
```

### 3.16 `src/entities/payment/payment.dto.ts` — add `deletedAt`/`deletedBy`

Replace lines 6–9:

```ts
export type CreatePaymentDto = Omit<
  Payment,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
```

### 3.17 `src/entities/payment/payment-attempt.dto.ts` — add `createdBy`/`updatedBy`/`deletedAt`/`deletedBy` + keep entity-specific keys

Replace lines 7–10:

```ts
export type CreatePaymentAttemptDto = Omit<
  PaymentAttempt,
  | 'id'
  | 'createdAt'
  | 'createdBy'
  | 'updatedAt'
  | 'updatedBy'
  | 'deletedAt'
  | 'deletedBy'
  | 'reviewedBy'
  | 'reviewedAt'
  | 'amount'
  | 'currency'
>;
```

### 3.18 `src/entities/payment/payment-proof.dto.ts` — add `updatedAt`/`updatedBy`/`deletedAt`/`deletedBy` (already had `createdBy`)

Replace line 12:

```ts
export type CreatePaymentProofDto = Omit<
  PaymentProof,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
```

### 3.19 `src/entities/receipt/receipt.dto.ts` — add `deletedAt`/`deletedBy`

Replace lines 6–9:

```ts
export type CreateReceiptDto = Omit<
  Receipt,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
```

### 3.20 `src/entities/receipt/receipt-template.dto.ts` — already full audit set (no change needed)

Current lines 7–10 already omit the full audit set incl `deletedAt`/`deletedBy`. **No edit required.** Verify only.

### 3.21 `src/entities/summary/client-debt-summary.dto.ts` — add `createdAt`/`createdBy`/`updatedBy`/`deletedAt`/`deletedBy`

Current Omit omits `id`/`updatedAt` + derived fields but **not** `createdAt`/`createdBy` — this would currently force the API caller to supply `createdAt` on create (wrong). Replace lines 7–10:

```ts
export type CreateClientDebtSummaryDto = Omit<
  ClientDebtSummary,
  | 'id'
  | 'createdAt'
  | 'createdBy'
  | 'updatedAt'
  | 'updatedBy'
  | 'deletedAt'
  | 'deletedBy'
  | 'lastPaymentId'
  | 'lastDebtId'
  | 'lastPaymentDate'
  | 'lastDebtDate'
>;
```

### 3.22 `src/entities/summary/company-monthly-summary.dto.ts` — add full audit set

Replace lines 6–9:

```ts
export type CreateCompanyMonthlySummaryDto = Omit<
  CompanyMonthlySummary,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
```

### 3.23 DTOs needing **no** edit (verify only)

- `debt-schedule.dto.ts` (3.11)
- `invoice-template.dto.ts` (3.13)
- `receipt-template.dto.ts` (3.20)

---

## 4. JSON Schema Changes (22 files)

### 4.1 Canonical audit property block

Append (where missing) into each schema's `properties` object, in this order after the existing entity-specific props:

```json
    "createdAt": { "type": "string", "format": "date-time" },
    "createdBy": { "type": "string", "format": "uuid" },
    "updatedAt": { "type": "string", "format": "date-time" },
    "updatedBy": { "type": "string", "format": "uuid" },
    "deletedAt": { "type": "string", "format": "date-time" },
    "deletedBy": { "type": "string", "format": "uuid" }
```

**Required-array rule for every schema**: include `"createdAt"` and `"createdBy"`; do NOT include `"updatedAt"`, `"updatedBy"`, `"deletedAt"`, `"deletedBy"` (all optional per `BaseEntity`). Preserve all non-audit required entries.

### 4.2 Per-file exact changes

For each schema: "props to add" = audit props not currently present; "required delta" = additions/removals to the existing `required` array.

#### 4.2.1 `src/schemas/bank-statement.schema.json`

- Props to add: `deletedAt`, `deletedBy` (createdAt/updatedAt/createdBy/updatedBy already present).
- Required delta: remove `updatedAt`, add `createdBy`.
- Final `required`: `["id","companyId","bank","format","fileUrl","fileName","status","createdAt","createdBy"]`

#### 4.2.2 `src/schemas/bank-transaction.schema.json`

- Props to add: `createdBy`, `updatedBy`, `deletedAt`, `deletedBy`.
- Required delta: remove `updatedAt`, add `createdBy`.
- Final `required`: `["id","bankStatementId","companyId","transactionDate","amount","currency","description","status","createdAt","createdBy"]`

#### 4.2.3 `src/schemas/payment-match.schema.json`

- Props to add: full block `createdAt`,`createdBy`,`updatedAt`,`updatedBy`,`deletedAt`,`deletedBy` (schema currently has none).
- Required delta: add `createdAt`, `createdBy`.
- Final `required`: `["id","paymentAttemptId","bankTransactionId","companyId","matchedAmount","matchedBy","matchedAt","createdAt","createdBy"]`

#### 4.2.4 `src/schemas/client.schema.json`

- Props to add: `createdBy`, `deletedAt`, `deletedBy` (createdAt/updatedAt/updatedBy present).
- Required delta: remove `updatedAt`, add `createdBy`.
- Final `required`: `["id","companyId","clientCode","active","createdAt","createdBy"]`

#### 4.2.5 `src/schemas/company-plan.schema.json`

- Props to add: `createdBy`, `updatedBy`, `deletedAt`, `deletedBy`.
- Required delta: remove `updatedAt`, add `createdBy`.
- Final `required`: `["id","companyId","commissionRate","saasPercentage","currency","active","validFrom","createdAt","createdBy"]`

#### 4.2.6 `src/schemas/company-user.schema.json`

- Props to add: `createdBy`, `updatedBy`, `deletedAt`, `deletedBy`.
- Required delta: remove `updatedAt`, add `createdBy`.
- Final `required`: `["id","companyId","userId","roleId","active","createdAt","createdBy"]`

#### 4.2.7 `src/schemas/company.schema.json`

- Props to add: `createdBy`, `updatedBy`, `deletedAt`, `deletedBy` (only createdAt/updatedAt present).
- Required delta: remove `updatedAt`, add `createdBy`.
- Final `required`: `["id","friendlyUrl","name","active","createdAt","createdBy"]`

#### 4.2.8 `src/schemas/role.schema.json`

- Props to add: `createdBy`, `updatedAt`, `updatedBy`, `deletedAt`, `deletedBy` (only createdAt present).
- Required delta: add `createdBy` (createdAt already required).
- Final `required`: `["id","name","createdAt","createdBy"]`

#### 4.2.9 `src/schemas/user.schema.json`

- Props to add: `createdBy`, `updatedBy`, `deletedAt`, `deletedBy`.
- Required delta: remove `updatedAt`, add `createdBy`.
- Final `required`: `["id","email","active","emailVerified","createdAt","createdBy"]`

#### 4.2.10 `src/schemas/debt.schema.json`

- Props to add: `deletedAt`, `deletedBy` (rest present).
- Required delta: remove `updatedAt`, add `createdBy`.
- Final `required`: `["id","companyId","clientId","debtCode","totalAmount","currency","dueDate","issueDate","status","createdAt","createdBy"]`

#### 4.2.11 `src/schemas/debt-schedule.schema.json`

- Props to add: none (full audit incl deletedAt/deletedBy already present).
- Required delta: remove `updatedAt`, add `createdBy`.
- Final `required`: `["id","companyId","clientId","name","amount","currency","frequency","dayOfMonth","calculationType","active","startDate","createdAt","createdBy"]`

#### 4.2.12 `src/schemas/invoice.schema.json`

- Props to add: `deletedAt`, `deletedBy`.
- Required delta: remove `updatedAt`, add `createdBy`.
- Final `required`: `["id","companyId","clientId","debtId","invoiceNumber","issueDate","dueDate","totalAmount","currency","status","createdAt","createdBy"]`

#### 4.2.13 `src/schemas/invoice-template.schema.json`

- Props to add: none (full audit present).
- Required delta: remove `updatedAt`, add `createdBy`.
- Final `required`: `["id","companyId","name","subject","bodyHtml","isDefault","active","createdAt","createdBy"]`

#### 4.2.14 `src/schemas/receipt.schema.json`

- Props to add: `deletedAt`, `deletedBy`.
- Required delta: remove `updatedAt`, add `createdBy`.
- Final `required`: `["id","companyId","clientId","debtId","receiptNumber","issueDate","dueDate","totalAmount","currency","status","createdAt","createdBy"]`

#### 4.2.15 `src/schemas/receipt-template.schema.json`

- Props to add: none (full audit present).
- Required delta: remove `updatedAt`, add `createdBy`.
- Final `required`: `["id","companyId","name","subject","bodyHtml","isDefault","active","createdAt","createdBy"]`

#### 4.2.16 `src/schemas/payment-attempt.schema.json`

- Props to add: `createdBy`, `updatedBy`, `deletedAt`, `deletedBy`.
- Required delta: remove `updatedAt`, add `createdBy`.
- Final `required`: `["id","companyId","clientId","paymentProofId","debtId","status","createdAt","createdBy"]`

#### 4.2.17 `src/schemas/payment.schema.json`

- Props to add: `deletedAt`, `deletedBy`.
- Required delta: remove `updatedAt`, add `createdBy`.
- Final `required`: `["id","companyId","clientId","debtId","amount","currency","paymentDate","status","createdAt","createdBy"]`

#### 4.2.18 `src/schemas/notification.schema.json`

- Props to add: `createdBy`, `updatedAt`, `updatedBy`, `deletedAt`, `deletedBy` (only createdAt present).
- Required delta: add `createdBy` (createdAt already required; do NOT add updatedAt).
- Final `required`: `["id","companyId","to","type","subject","body","channel","status","createdAt","createdBy"]`

#### 4.2.19 `src/schemas/notification-template.schema.json`

- Props to add: `deletedAt`, `deletedBy`.
- Required delta: remove `updatedAt`, add `createdBy`.
- Final `required`: `["id","companyId","name","type","subject","bodyHtml","channel","isDefault","active","createdAt","createdBy"]`

#### 4.2.20 `src/schemas/payment-proof.schema.json`

- Props to add: `updatedAt`, `updatedBy`, `deletedAt`, `deletedBy` (createdAt/createdBy present).
- Required delta: add `createdBy` (createdAt already required).
- Final `required`: `["id","companyId","clientId","fileUrl","fileName","createdAt","createdBy"]`

#### 4.2.21 `src/schemas/client-debt-summary.schema.json`

- Props to add: `createdAt`, `createdBy`, `updatedBy`, `deletedAt`, `deletedBy` (only updatedAt present).
- Required delta: remove `updatedAt`; add `createdAt`, `createdBy`.
- Final `required`: `["id","companyId","clientId","totalDebt","totalPaid","balance","currency","status","createdAt","createdBy"]`

#### 4.2.22 `src/schemas/company-monthly-summary.schema.json`

- Props to add: `createdBy`, `updatedBy`, `deletedAt`, `deletedBy`.
- Required delta: remove `updatedAt`, add `createdBy`.
- Final `required`: `["id","companyId","year","month","totalDebtsGenerated","totalPaymentsReceived","commissionEarned","currency","createdAt","createdBy"]`

### 4.3 Property ordering convention

In each file, place audit properties in the fixed order `createdAt, createdBy, updatedAt, updatedBy, deletedAt, deletedBy` at the end of `properties` (consistent with current files). When only adding a subset, insert into that order without reordering existing non-audit props.

---

## 5. Test Changes

### 5.1 Existing suites — no edits

`src/__tests__/interfaces.test.ts` and the four `src/__tests__/entities/*.test.ts` files already conform to the new `BaseEntity` (include `createdBy`; `updatedAt` provided only as an allowed optional value). Leave them untouched. They must still pass after the DTO/schema edits (DTOs do not affect entity-shape tests).

### 5.2 New file — `src/__tests__/dtos.test.ts`

Add a type-level test file that locks in the Option B omit pattern: each `Create*Dto` must NOT accept any audit field as a required key, and must STILL require the entity's core business fields. Use a small type-equality + key-exclusion helper. Keep under the 200-line / ~125-effective-line rule (target ~100 lines).

```ts
import { describe, it, expect } from 'vitest';
import type { CreateCompanyDto } from '../entities/company/company.dto';
import type { CreateCompanyPlanDto } from '../entities/company/company-plan.dto';
import type { CreateCompanyUserDto } from '../entities/company/company-user.dto';
import type { CreateRoleDto } from '../entities/company/role.dto';
import type { CreateUserDto } from '../entities/company/user.dto';
import type { CreateClientDto } from '../entities/client/client.dto';
import type { CreateDebtDto } from '../entities/debt/debt.dto';
import type { CreateDebtScheduleDto } from '../entities/debt/debt-schedule.dto';
import type { CreateInvoiceDto } from '../entities/invoice/invoice.dto';
import type { CreateInvoiceTemplateDto } from '../entities/invoice/invoice-template.dto';
import type { CreateNotificationDto } from '../entities/notification/notification.dto';
import type { CreateNotificationTemplateDto } from '../entities/notification/notification-template.dto';
import type { CreatePaymentDto } from '../entities/payment/payment.dto';
import type { CreatePaymentAttemptDto } from '../entities/payment/payment-attempt.dto';
import type { CreatePaymentProofDto } from '../entities/payment/payment-proof.dto';
import type { CreateReceiptDto } from '../entities/receipt/receipt.dto';
import type { CreateReceiptTemplateDto } from '../entities/receipt/receipt-template.dto';
import type { CreateBankStatementDto } from '../entities/bank/bank-statement.dto';
import type { CreateBankTransactionDto } from '../entities/bank/bank-transaction.dto';
import type { CreatePaymentMatchDto } from '../entities/bank/payment-match.dto';
import type { CreateClientDebtSummaryDto } from '../entities/summary/client-debt-summary.dto';
import type { CreateCompanyMonthlySummaryDto } from '../entities/summary/company-monthly-summary.dto';

type AuditKeys = 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy';
type HasKey<T, K extends string> = K extends keyof T ? true : false;
type ExcludesAudit<T> = true extends HasKey<T, AuditKeys> ? false : true;
type Assert<T extends true> = T;

describe('Create DTOs exclude BaseEntity audit fields (Option B)', () => {
  it('company + bank statement dtos omit audit (totalTransactions omitted too)', () => {
    type _c = Assert<ExcludesAudit<CreateCompanyDto>>;
    type _t = Assert<HasKey<CreateBankStatementDto, 'totalTransactions'> ? false : true>;
    expect(true).toBe(true);
  });

  it('all core DTOs exclude the full audit set', () => {
    type _a = Assert<ExcludesAudit<CreateCompanyPlanDto>>;
    type _b = Assert<ExcludesAudit<CreateCompanyUserDto>>;
    type _d = Assert<ExcludesAudit<CreateRoleDto>>;
    type _e = Assert<ExcludesAudit<CreateUserDto>>;
    type _f = Assert<ExcludesAudit<CreateClientDto>>;
    type _g = Assert<ExcludesAudit<CreateDebtDto>>;
    type _h = Assert<ExcludesAudit<CreateDebtScheduleDto>>;
    type _i = Assert<ExcludesAudit<CreateInvoiceDto>>;
    type _j = Assert<ExcludesAudit<CreateInvoiceTemplateDto>>;
    type _k = Assert<ExcludesAudit<CreateNotificationDto>>;
    type _l = Assert<ExcludesAudit<CreateNotificationTemplateDto>>;
    type _m = Assert<ExcludesAudit<CreatePaymentDto>>;
    type _n = Assert<ExcludesAudit<CreatePaymentAttemptDto>>;
    type _o = Assert<ExcludesAudit<CreatePaymentProofDto>>;
    type _p = Assert<ExcludesAudit<CreateReceiptDto>>;
    type _q = Assert<ExcludesAudit<CreateReceiptTemplateDto>>;
    type _r = Assert<ExcludesAudit<CreateBankTransactionDto>>;
    type _s = Assert<ExcludesAudit<CreatePaymentMatchDto>>;
    type _u = Assert<ExcludesAudit<CreateClientDebtSummaryDto>>;
    type _v = Assert<ExcludesAudit<CreateCompanyMonthlySummaryDto>>;
    expect(true).toBe(true);
  });

  it('bank transaction create dto keeps business fields', () => {
    const dto: CreateBankTransactionDto = {
      companyId: 'c',
      bankStatementId: 'b',
      transactionDate: new Date(),
      amount: '1.00',
      currency: 'ARS',
      description: { encryptedData: 'x', keyName: 'k' },
      status: 'UNMATCHED',
    };
    expect(dto.currency).toBe('ARS');
  });
});
```

Notes:

- `HasKey<T, AuditKeys>` distributes over the union; `ExcludesAudit<T>` is `false` if any audit key is assignable to `keyof T`. This is a compile-time guard: if a future change re-adds an audit key to a `Create*Dto`, the `Assert<ExcludesAudit<...>>` will fail under `npm run typecheck`.
- The `_t` check pins the `BankStatement` extra: `totalTransactions` must remain omitted.
- Treat this file as type-only assertions; the single runtime `it` for `CreateBankTransactionDto` is a smoke test that the business fields are still required.
- File must contain real newline characters (Newline Prevention Rule).

---

## 6. Git Actions

On current branch (`feat/entity-base-refactor`). Three commits, staged precisely.

### 6.1 DTOs

```bash
git add src/entities/bank/bank-statement.dto.ts src/entities/bank/bank-transaction.dto.ts src/entities/bank/payment-match.dto.ts src/entities/client/client.dto.ts src/entities/company/company.dto.ts src/entities/company/company-plan.dto.ts src/entities/company/company-user.dto.ts src/entities/company/role.dto.ts src/entities/company/user.dto.ts src/entities/debt/debt.dto.ts src/entities/invoice/invoice.dto.ts src/entities/notification/notification.dto.ts src/entities/notification/notification-template.dto.ts src/entities/payment/payment.dto.ts src/entities/payment/payment-attempt.dto.ts src/entities/payment/payment-proof.dto.ts src/entities/receipt/receipt.dto.ts src/entities/summary/client-debt-summary.dto.ts src/entities/summary/company-monthly-summary.dto.ts
git status
git commit -m "refactor(dtos): align Create DTOs with BaseEntity audit fields

- Omit full audit set (id, createdAt, createdBy, updatedAt, updatedBy,
  deletedAt, deletedBy) from every Create*Dto (Option B inline unions)
- Add createdBy/updatedBy/deletedAt/deletedBy where missing
- Keep entity-specific system keys (totalTransactions, matchedAt, sentAt,
  lastGeneratedDate, reviewedBy/reviewedAt/amount/currency, user system
  fields, client-debt-summary derived fields)
- No shared BaseEntityKey type introduced

Refs .agent/todos/20260625/20260625-todo-0.md"
```

### 6.2 Schemas

```bash
git add src/schemas/*.schema.json
git status
git commit -m "refactor(schemas): align JSON Schemas with BaseEntity audit fields

- Add missing createdBy/updatedBy/deletedAt/deletedBy (and createdAt for
  client-debt-summary) to properties
- required: add createdBy; remove updatedAt (now optional per BaseEntity)
- Keep all non-audit required entries unchanged

Refs .agent/todos/20260625/20260625-todo-0.md"
```

### 6.3 Tests

```bash
git add src/__tests__/dtos.test.ts
git status
git commit -m "test(dtos): add type-level guards for Create*Dto audit omission

Refs .agent/todos/20260625/20260625-todo-0.md"
```

Pre-commit (Gitignore Compliance Rule): after each `git add`, run `git status` and confirm no `dist/`, `node_modules/`, `.vitest-cache/`, or other ignored paths are staged. If any ignored path appears, unstage it before committing.

---

## 7. Verification Steps

Run from repo root (`C:\projects\cobranza-app\entities`). All must pass (full project is now coherent after Tasks 1–5).

1. **Type check**:

   ```bash
   npm run typecheck
   ```

   Expect: 0 errors (the deferred entity errors from Task 1 are already resolved by Task 2; the optional-field changes from Task 5 are already merged).

2. **DTO test suite (new) in isolation**:

   ```bash
   npm test -- src/__tests__/dtos.test.ts
   ```

   Expect: all assertions pass; type-level guards compile.

3. **Full test suite**:

   ```bash
   npm test
   ```

   Expect: all existing suites + new `dtos.test.ts` pass.

4. **Lint**:

   ```bash
   npm run lint
   ```

   Expect: 0 errors on changed/added files.

5. **Format check**:

   ```bash
   npm run format:check
   ```

   If it flags any changed file, run `npm run format`, re-stage, and amend or re-commit.

6. **Circular dependency**:

   ```bash
   npm run test:circular
   ```

   Expect: no circular dependencies.

7. **Build**:

   ```bash
   npm run build
   ```

   Expect: `dist/` produced, no TS errors.

8. **Diagnostics (optional sanity)** via `vscode-mcp-server_get_diagnostics_code`:
   - `path: "src/__tests__/dtos.test.ts"` → errors+warnings: none.
   - Sample 2–3 DTO files (e.g. `src/entities/summary/client-debt-summary.dto.ts`, `src/entities/payment/payment-attempt.dto.ts`) to confirm absence of TS errors.

---

## 8. Code Review Checklist (for 4.3)

- Every `Create*Dto` omits all 7 audit keys (`id`,`createdAt`,`createdBy`,`updatedAt`,`updatedBy`,`deletedAt`,`deletedBy`); no audit key is accidentally retained.
- Entity-specific system keys preserved exactly where required (see §3 tables).
- No shared `BaseEntityKey` type/const introduced (Option B).
- No DTO export names changed; per-domain barrels untouched.
- Each schema declares all required audit fields is required `createdBy` + `createdAt` only; `updatedAt` removed from every `required`.
- `client-debt-summary.schema.json` now declares `createdAt` and lists it + `createdBy` in `required`; `updatedAt` removed from `required`.
- JSON files remain valid JSON (trailing commas removed where entries deleted; arrays well-formed).
- `dtos.test.ts` compiles and passes; no commented-out code; real newlines; within file-length rule.

---

## 9. Out of Scope (deferred)

- `.agent/project-info/entities-definition.csv` and relationship docs → **Task 3**.
- `CHANGELOG.md` entry → **Task 6**.
- `README.md`/`CONTRIBUTING.md` DTO/schema narrative → **Step 4.4 (Docs)**.
- Version bump / `feat/entity-base-refactor` merge to `main` → **Step 5 (TODO completion)** of the global Critical Workflow.
- Any runtime DTO validation library wiring (class-validator etc.) — none exists; this library is type-only.

---

## 10. Acceptance Criteria

Task 4 is complete when **all** are true:

1. All 19 edited DTO files use the Option B inline omit union per §3; the 3 verify-only DTOs (debt-schedule, invoice-template, receipt-template) already conform and are unchanged.
2. All 22 schema files match §4.2 final `required` arrays and declare all applicable audit properties.
3. `src/__tests__/dtos.test.ts` exists, compiles, and passes.
4. `npm run typecheck`, `npm test`, `npm run lint`, `npm run format:check`, `npm run test:circular`, `npm run build` all succeed.
5. `git status` shows only the in-scope files committed across the three commits; no ignored paths staged.
6. No new shared `BaseEntityKey` type/const exists in the repo.

---

## 11. Summary

This plan normalizes the 22 `Create*Dto` Omit clauses to the post-refactor `BaseEntity` audit set using inline Option B unions (no shared key type). It also aligns all 22 JSON Schemas' audit properties and `required` arrays (removing `updatedAt` from `required`, adding `createdBy`, and adding the missing `createdAt` for `client-debt-summary`), and adds a `dtos.test.ts` type-level guard file to lock in the pattern. The changes are conservative, consistent with the contracts established in Tasks 1/2/5, and do not touch CSV/CHANGELOG/README (those belong to Task 3 / Task 6 / Step 4.4).
