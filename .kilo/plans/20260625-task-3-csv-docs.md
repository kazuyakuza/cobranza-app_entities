# Plan — Task 3: Sync `entities-definition.csv` + Related Documentation

> TODO item (`.agent/todos/20260625/20260625-todo-0.md`, line 3):
> "update the `.agent\project-info\entities-definition.csv` file with the entities changes. also update all related documentation."

## Context

- Library: `@cobranza-apps/entities` at `C:\projects\cobranza-app\entities`.
- Branch: `feat/entity-base-refactor` (created in Critical Workflow Step 2).
- Prerequisite tasks already complete on the branch:
  - **Task 1** — `BaseEntity` redesign: merged `SoftDeletable` into `BaseEntity` (`src/interfaces/base-entity.interface.ts`).
  - **Task 2** — All 22 entity interfaces now `extends BaseEntity` (inline audit fields removed; stale `SoftDeletable` imports removed).
  - **Task 4** — DTOs, JSON schemas, and tests updated for the BaseEntity migration.
  - **Task 5** — Field optionality changes: `Company.contact`, `Client.fullName`, `Debt.description` made optional.
- **Task 3 (this plan)** is the documentation-sync step: reflect the above code changes into `entities-definition.csv` and the four related docs so that the SSOT docs match the shipped code.

## Goal

Make `.agent/project-info/entities-definition.csv` faithfully describe the **current TypeScript entity interfaces** (post BaseEntity + optionality refactor), and update the four related documentation files so the SSOT docs and code agree.

## Scope

### In scope

- Rewrite the 20 entity blocks in `.agent/project-info/entities-definition.csv` to reflect:
  - camelCase property names (matching code + architecture naming conventions).
  - TypeScript type vocabulary (`string`, `boolean`, `number`, `Date`, `UUID`, `Decimal`, `JsonData`, `Location`, `EncryptedValue | null`, specific enum names).
  - The uniform `BaseEntity` audit block on every entity.
  - Behavior changes from Task 2 (newly-required `createdBy`; newly-required `createdAt` on `PaymentMatch` / `ClientDebtSummary`; `updatedAt` / `updatedBy` / `deletedAt` / `deletedBy` optional on all).
  - Optionality changes from Task 5 (`Company.contact`, `Client.fullName`, `Debt.description`).
- Update `.agent/project-info/data-model-brief.md` (BaseEntity audit pattern note + optionality note).
- Update `.agent/project-info/architecture.md` (`BaseEntity` snippet uses `UUID` type alias; clarify CSV naming convention).
- Update `.agent/project-info/context.md` (Recent Changes + Immediate Next Steps after Task 3).
- Update `README.md` (BaseEntity contract accuracy + optionality note).

### Out of scope (see "Out-of-Scope Notes" section)

- Adding `Receipt` / `ReceiptTemplate` rows to the CSV (pre-existing CSV gap; flagged separately).
- Modifying any `*.entity.ts`, `*.dto.ts`, `*.schema.json`, enum, or test file.
- Runtime/library behavior changes.
- Publishing, version bump.

## BaseEntity Contract Definition (source of truth)

From `src/interfaces/base-entity.interface.ts` (verified current state):

```typescript
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

**Required / optional summary** (applies uniformly to all 20 entities via inheritance):

| Property    | Type  | Required | Notes                                                                 |
|-------------|-------|----------|-----------------------------------------------------------------------|
| `id`        | UUID  | Yes      | PK — provided by persistence layer                                    |
| `createdAt` | Date  | Yes      | Provided by persistence layer                                          |
| `createdBy` | UUID  | Yes      | UUID of creating user (behavior change: newly required on many entities) |
| `updatedAt` | Date  | No       | Optional; null until first update                                      |
| `updatedBy` | UUID  | No       | Optional                                                              |
| `deletedAt` | Date  | No       | Optional soft-delete marker                                            |
| `deletedBy` | UUID  | No       | Optional                                                              |

## CSV Rewrite Strategy

### CSV structure (preserve)

- Header row stays: `,entity,property,type,required,comments`
  (first column intentionally empty — keep the leading comma on data rows).
- Each entity block = one entity row (entity name + description in `comments`), followed by property rows, followed by one blank separator row.
- Preserve RFC 4180 escaping: any cell containing commas, double-quotes, or newlines must be wrapped in `"..."` and inner `"` doubled (`""`). The current CSV already does this for comment cells — preserve the same style.

### Property naming convention

Convert every snake_case property to **camelCase** to match code and the naming table in `architecture.md`. Examples: `company_id` → `companyId`, `created_at` → `createdAt`, `business_name` → `businessName`, `friendly_url` → `friendlyUrl`, `tax_id_hash` → `taxIdHash`.

Also clean up two CSV anomalies found in the current file — markdown-bold artifacts in the **property** column: `**period_from**`, `**period_to**` (BankStatement) and `**client_id**`, `**updated_by**` (BankStatement / BankTransaction). Rewrite as plain camelCase: `periodFrom`, `periodTo`, `clientId`, `updatedBy`.

### Type vocabulary (replace DB-ish types with TS types)

| CSV old type                | New CSV type                |
|-----------------------------|-----------------------------|
| `String`                    | `string`                    |
| `Boolean`                   | `boolean`                   |
| `Integer`                   | `number`                    |
| `Timestamp`                 | `Date`                      |
| `Date`                      | `Date`                      |
| `UUID`                      | `UUID`                      |
| `UUID (FK)`                 | `UUID`                      |
| `Decimal(12,2)`, `Decimal(14,2)`, `Decimal(5,4)`, `Decimal(5,2)` | `Decimal` |
| `Enum`                      | specific enum name (e.g. `Currency`, `DebtStatus`, `InvoiceStatus`, `PaymentStatus`, `PaymentAttemptStatus`, `BankTransactionStatus`, `BankStatementStatus`, `Bank`, `BankStatementFormat`, `MatchMethod`, `DebtScheduleFrequency`, `CalculationType`, `NotificationType`, `NotificationChannel`, `NotificationStatus`, `ClientDebtSummaryStatus`) |
| `JSONB` (EncryptedValue)    | `EncryptedValue \| null` |
| `JSONB` (location)          | `Location`                  |
| `JSONB` (generic)           | `JsonData`                  |
| `Text`                      | `string`                    |

### `required` column

Values stay `Yes` / `No`. `No` = optional or nullable. For encrypted nullable fields, comment notes the `| null` form. The BaseEntity `audit block` (below) is added to **every** entity using the fixed `Yes/No` pattern from the BaseEntity table.

### Standard BaseEntity audit block (append to each entity)

For every entity, after its domain properties, list these 7 rows (in this order). Comment text mirrors the `BaseEntity` JSDoc:

```
,,id,UUID,Yes,PK
,,createdAt,Date,Yes,BaseEntity inherited — provided by persistence layer
,,createdBy,UUID,Yes,BaseEntity inherited — UUID of creating user
,,updatedAt,Date,No,BaseEntity inherited — optional
,,updatedBy,UUID,No,BaseEntity inherited — optional
,,deletedAt,Date,No,BaseEntity inherited — soft-delete marker
,,deletedBy,UUID,No,BaseEntity inherited — optional
```

> Rationale: documenting the inherited audit block once per entity makes the CSV self-describing for AI agents and consumers, and surfaces the Task-2 behavior changes (newly required `createdAt` / `createdBy`) directly in the row data. Do **not** keep legacy inline audit rows (e.g. the old `created_at`/`updated_at`/`updated_by` rows for Client/Debt/Payment); replace them with the standard block.

---

## Per-Entity Change Matrix (all 20 CSV entities)

For each entity: **Audit deltas** (before CSV audit rows → after BaseEntity block), **Renames**, **Type / required deltas**, **Notes**. Domain fields not listed keep their current CSV semantics (only case + type are mechanically updated per the strategy above).

### 1. Company  (CSV rows 2–17)
- **Audit before:** `id`, `created_at`(Yes), `updated_at`(Yes). → After: standard block; `updated_at` Yes→No; **+createdBy(Yes)**, **+updatedBy(No)**, **+deletedAt(No)**, **+deletedBy(No)**.
- **Renames:** `friendly_url`→`friendlyUrl`, `business_name`→`businessName`, `tax_id`→`taxId`, `tax_id_hash`→`taxIdHash`, `contact`→`contact`, `contact_hash`→`contactHash`, `phone`→`phone`, `location`→`location`, `logo_url`→`logoUrl`, `active`→`active`, `settings`→`settings`.
- **Types:** `String`→`string`, `Boolean`→`boolean`, `Timestamp`→`Date`; encrypted fields → `EncryptedValue | null`; `location` → `Location`; `settings` → `JsonData`.
- **Required:** `friendlyUrl` Yes, `name` Yes, `active` Yes; all PII/encrypted/hash `No`; `location` No, `logoUrl` No, `settings` No.
- **Notes:** `contact` now optional + nullable (Task 5) — comment: "Optional (Task 5). EncryptedValue or null."

### 2. CompanyPlan  (rows 19–31)
- **Audit before:** `id`, `created_at`(Yes), `updated_at`(Yes). → After: standard block; `updated_at` Yes→No; +createdBy/updatedBy/deletedAt/deletedBy.
- **Renames:** `company_id`→`companyId`, `commission_rate`→`commissionRate`, `saas_percentage`→`saasPercentage`, `intermediary_percentage`→`intermediaryPercentage`, `valid_from`→`validFrom`, `valid_until`→`validUntil`.
- **Types:** `UUID (FK)`→`UUID`; `Decimal(5,4)`→`Decimal`; `Enum`→`Currency`; `Boolean`→`boolean`; `Date`→`Date`; `Text`→`string`; `Timestamp`→`Date`.
- **Required:** `companyId` Yes, `commissionRate` Yes, `saasPercentage` Yes, `intermediaryPercentage` No, `currency` Yes, `active` Yes, `validFrom` Yes, `validUntil` No, `notes` No.

### 3. User  (rows 33–44)
- **Audit before:** `id`, `created_at`(Yes), `updated_at`(Yes). → After: standard block; `updated_at` Yes→No; +createdBy(+Yes) etc.
- **Renames:** `password_hash`→`passwordHash`, `password_updated_at`→`passwordUpdatedAt`, `full_name`→`fullName`, `last_login_at`→`lastLoginAt`.
- **Types:** `String`→`string`; encrypted → `EncryptedValue | null`; `Timestamp`→`Date`; `Boolean`→`boolean`.
- **Required:** `email` Yes, `passwordHash` No, `passwordUpdatedAt` No, `fullName` No (nullable), `phone` No (nullable), `active` Yes, `emailVerified` Yes, `lastLoginAt` No.

### 4. Role  (rows 46–50)
- **Audit before:** `id`, `created_at` only (no `updated_at`). → After: standard block; **+createdAt stays Yes**, **+createdBy(Yes NEW)**, **+updatedAt(No NEW)**, **+updatedBy(No NEW)**, **+deletedAt(No NEW)**, **+deletedBy(No NEW)**.
- **Renames:** none beyond audit.
- **Types:** `String`→`string`.
- **Required:** `name` Yes, `description` No.

### 5. CompanyUser  (rows 52–58)
- **Audit before:** `id`, `created_at`(Yes), `updated_at`(Yes). → After: standard block; `updated_at` Yes→No; +createdBy/updatedBy/deletedAt/deletedBy.
- **Renames:** `company_id`→`companyId`, `user_id`→`userId`, `role_id`→`roleId`.
- **Types:** `UUID (FK)`→`UUID`; `Boolean`→`boolean`; `Timestamp`→`Date`.
- **Required:** `companyId` Yes, `userId` Yes, `roleId` Yes, `active` Yes.

### 6. Client  (rows 61–77)
- **Audit before:** `id`, `created_at`(Yes), `updated_at`(Yes), `updated_by`(No). → After: standard block (replaces the inline `updated_by` row); `updated_at` Yes→No; **+createdBy(Yes)**, **+deletedAt(No)**, **+deletedBy(No)**. Remove the legacy inline `updated_by` row.
- **Renames:** `company_id`→`companyId`, `client_code`→`clientCode`, `full_name`→`fullName`, `email`→`email`, `email_hash`→`emailHash`, `tax_id`→`taxId`, `tax_id_hash`→`taxIdHash`, `extra_data`→`extraData`.
- **Types:** encrypted → `EncryptedValue | null`; `location`→`Location`; `extra_data` (JSONB generic)→`JsonData`; `Text`→`string`; `Boolean`→`boolean`; `Timestamp`→`Date`.
- **Required:** `companyId` Yes, `clientCode` Yes, `fullName` No (nullable, Task 5), `email` No (nullable), `emailHash` No, `phone` No (nullable), `location` No, `taxId` No (nullable), `taxIdHash` No, `extraData` No, `active` Yes, `notes` No.
- **Notes:** `fullName` optional + nullable (Task 5).

### 7. Debt  (rows 79–102)
- **Audit before:** `id`, `created_at`(Yes), `updated_at`(Yes), `created_by`(No), `updated_by`(No). → After: standard block; **`created_by` No→Yes (behavior change)**; `updated_at` Yes→No; **+deletedAt(No)**, **+deletedBy(No)**. Remove inline `created_by` / `updated_by` rows.
- **Renames:** `company_id`→`companyId`, `client_id`→`clientId`, `debt_schedule_id`→`debtScheduleId`, `debt_code`→`debtCode`, `total_amount`→`totalAmount`, `due_date`→`dueDate`, `issue_date`→`issueDate`, `daily_interest_rate`→`dailyInterestRate`, `extra_data`→`extraData`, `invoice_template_id`→`invoiceTemplateId`.
- **Types:** `UUID (FK)`→`UUID`; `Decimal(12,2)` / `Decimal(5,4)`→`Decimal`; `Enum`→`Currency` / `DebtStatus`; `Date`→`Date`; `String`→`string`; `Text`→`string`; `JSONB`→`JsonData`.
- **Required:** `companyId` Yes, `clientId` Yes, `debtScheduleId` No, `debtCode` Yes, `description` No (Task 5), `totalAmount` Yes, `currency` Yes, `dueDate` Yes, `issueDate` Yes, `dailyInterestRate` No, `status` Yes, `notes` No, `extraData` No, `invoiceTemplateId` No.
- **Notes:** `description` optional (Task 5).

### 8. DebtSchedule  (rows 104–128)
- **Audit before:** `id`, `created_at`(Yes), `updated_at`(Yes), `created_by`(No), `updated_by`(No), `deleted_at`(No), `deleted_by`(No). → After: standard block; **`created_by` No→Yes (behavior change)**; all others already match BaseEntity optionality; `updated_at` Yes→No.
- **Renames:** `group_id`→`groupId`, `day_of_month`→`dayOfMonth`, `calculation_type`→`calculationType`, `calculation_formula`→`calculationFormula`, `daily_interest_rate`→`dailyInterestRate`, `start_date`→`startDate`, `end_date`→`endDate`, `last_generated_date`→`lastGeneratedDate`, `invoice_template_id`→`invoiceTemplateId`.
- **Types:** `UUID (FK)`→`UUID`; `Decimal(*)`→`Decimal`; `Enum`→`Currency` / `DebtScheduleFrequency` / `CalculationType`; `String`→`string`; `Boolean`→`boolean`; `Date`→`Date`.
- **Required:** `companyId` Yes, `groupId` No, `clientId` Yes, `name` Yes, `description` No, `amount` Yes, `currency` Yes, `frequency` Yes, `dayOfMonth` Yes, `calculationType` Yes, `calculationFormula` No, `dailyInterestRate` No, `active` Yes, `startDate` Yes, `endDate` No, `lastGeneratedDate` No, `invoiceTemplateId` No.

### 9. Invoice  (rows 130–146)
- **Audit before:** `id`, `created_at`(Yes), `updated_at`(Yes), `created_by`(No), `updated_by`(No). → After: standard block; **`created_by` No→Yes**; `updated_at` Yes→No; **+deletedAt(No)**, **+deletedBy(No)**. Remove inline `created_by`/`updated_by`.
- **Renames:** `company_id`→`companyId`, `client_id`→`clientId`, `debt_id`→`debtId`, `invoice_template_id`→`invoiceTemplateId`, `invoice_number`→`invoiceNumber`, `issue_date`→`issueDate`, `due_date`→`dueDate`, `total_amount`→`totalAmount`.
- **Types:** `UUID (FK)`→`UUID`; `Decimal(12,2)`→`Decimal`; `Enum`→`Currency` / `InvoiceStatus`; `Date`→`Date`; `Text`→`string`.
- **Required:** `companyId` Yes, `clientId` Yes, `debtId` Yes, `invoiceTemplateId` No, `invoiceNumber` Yes, `issueDate` Yes, `dueDate` Yes, `totalAmount` Yes, `currency` Yes, `status` Yes, `notes` No.

### 10. InvoiceTemplate  (rows 148–161)
- **Audit before:** `id`, `created_at`(Yes), `updated_at`(Yes), `created_by`(No), `updated_by`(No), `deleted_at`(No), `deleted_by`(No). → After: standard block; **`created_by` No→Yes (behavior change)**; others already match.
- **Renames:** `company_id`→`companyId`, `body_html`→`bodyHtml`, `is_default`→`isDefault`.
- **Types:** `UUID (FK)`→`UUID`; `String`→`string`; `Text`→`string`; `Boolean`→`boolean`.
- **Required:** `companyId` Yes, `name` Yes, `subject` Yes, `bodyHtml` Yes, `isDefault` Yes, `active` Yes.

### 11. PaymentProof  (rows 163–172)
- **Audit before:** `id`, `created_at`(Yes), `created_by`(No). → After: standard block; **`created_by` No→Yes (behavior change)**; `updated_at` was absent → keep optional No; **+updatedAt(No NEW)**, **+updatedBy(No NEW)**, **+deletedAt(No NEW)**, **+deletedBy(No NEW)**. Remove inline `created_by`.
- **Renames:** `company_id`→`companyId`, `client_id`→`clientId`, `file_url`→`fileUrl`, `file_name`→`fileName`, `file_type`→`fileType`.
- **Types:** `UUID (FK)`→`UUID`; `String`→`string`; JSONB encrypted notes → `EncryptedValue | null`; `Timestamp`→`Date`.
- **Required:** `companyId` Yes, `clientId` Yes, `fileUrl` Yes, `fileName` Yes, `fileType` No, `notes` No (nullable).

### 12. PaymentAttempt  (rows 174–192)
- **Audit before:** `id`, `created_at`(Yes), `updated_at`(Yes). → After: standard block; `updated_at` Yes→No; **+createdBy(Yes NEW)**, **+updatedBy(No NEW)**, **+deletedAt(No NEW)**, **+deletedBy(No NEW)**.
- **Renames:** `company_id`→`companyId`, `client_id`→`clientId`, `payment_proof_id`→`paymentProofId`, `debt_id`→`debtId`, `rejection_reason`→`rejectionReason`, `reviewed_by`→`reviewedBy`, `reviewed_at`→`reviewedAt`.
- **Types:** `UUID (FK)`→`UUID`; `Decimal(12,2)`→`Decimal`; `Enum`→`Currency` / `PaymentAttemptStatus`; `String`→`string`; `Timestamp`→`Date`.
- **Required:** `companyId` Yes, `clientId` Yes, `paymentProofId` Yes, `debtId` Yes, `amount` No, `currency` No, `status` Yes, `rejectionReason` No, `reviewedBy` No, `reviewedAt` No.
- **Notes:** comment for `status` retains the 7-state explainer (UPLOADED → ... → REJECTED); keep as quoted multi-line cell.

### 13. Payment  (rows 194–208)
- **Audit before:** `id`, `created_at`(Yes), `updated_at`(Yes), `created_by`(No), `updated_by`(No). → After: standard block; **`created_by` No→Yes**; `updated_at` Yes→No; **+deletedAt(No)**, **+deletedBy(No)**. Remove inline `created_by`/`updated_by`.
- **Renames:** `company_id`→`companyId`, `client_id`→`clientId`, `debt_id`→`debtId`, `payment_attempt_id`→`paymentAttemptId`, `payment_date`→`paymentDate`.
- **Types:** `UUID (FK)`→`UUID`; `Decimal(12,2)`→`Decimal`; `Enum`→`Currency` / `PaymentStatus`; `Date`→`Date`; `Text`→`string`.
- **Required:** `companyId` Yes, `clientId` Yes, `debtId` Yes, `paymentAttemptId` No, `amount` Yes, `currency` Yes, `paymentDate` Yes, `status` Yes, `notes` No.

### 14. BankStatement  (rows 210–225)
- **Audit before:** `id`, `created_at`(Yes), `updated_at`(Yes), `created_by`(No), `**updated_by**`(No). → After: standard block; **`created_by` No→Yes**; `updated_at` Yes→No; **+deletedAt(No)**, **+deletedBy(No)**. Remove inline `created_by`/`updated_by`.
- **CRITICAL CSV cleanup:** property `**period_from**` → `periodFrom`; `**period_to**` → `periodTo`; `**updated_by**` (bold artifact in property column) is removed (replaced by BaseEntity `updatedBy`).
- **Renames:** `company_id`→`companyId`, `file_url`→`fileUrl`, `file_name`→`fileName`, `total_transactions`→`totalTransactions`.
- **Types:** `UUID (FK)`→`UUID`; `Enum`→`Bank` / `BankStatementFormat` / `BankStatementStatus`; `Integer`→`number`; JSONB encrypted notes → `EncryptedValue | null`; `Date`→`Date`; `Timestamp`→`Date`.
- **Required:** `companyId` Yes, `bank` Yes, `format` Yes, `fileUrl` Yes, `fileName` Yes, `periodFrom` No, `periodTo` No, `status` Yes, `totalTransactions` No, `notes` No (nullable).

### 15. BankTransaction  (rows 227–241)
- **Audit before:** `id`, `created_at`(Yes), `updated_at`(Yes). → After: standard block; `updated_at` Yes→No; **+createdBy(Yes NEW)**, **+updatedBy(No NEW)**, **+deletedAt(No NEW)**, **+deletedBy(No NEW)**.
- **CRITICAL CSV cleanup:** property `**client_id**` → `clientId`.
- **Renames:** `bank_statement_id`→`bankStatementId`, `company_id`→`companyId`, `transaction_date`→`transactionDate`, `reference_hash`→`referenceHash`, `balance_after`→`balanceAfter`.
- **Types:** `UUID (FK)`→`UUID`; `Decimal(12,2)`→`Decimal`; `Enum`→`Currency` / `BankTransactionStatus`; JSONB encrypted → `EncryptedValue | null` (for `description` and `reference`); `Date`→`Date`.
- **Required:** `bankStatementId` Yes, `companyId` Yes, `clientId` No, `transactionDate` Yes, `amount` Yes, `currency` Yes, `description` Yes (required `EncryptedValue`, NOT nullable), `reference` No (nullable), `referenceHash` No, `balanceAfter` No, `status` Yes.

### 16. PaymentMatch  (rows 243–252)
- **Audit before:** `id` only (no `created_at` / `created_by`). → After: standard block; **+createdAt(Yes NEW)**, **+createdBy(Yes NEW)**, **+updatedAt(No NEW)**, **+updatedBy(No NEW)**, **+deletedAt(No NEW)**, **+deletedBy(No NEW)**. Behavior change flagged in Task 2.
- **Renames:** `payment_attempt_id`→`paymentAttemptId`, `bank_transaction_id`→`bankTransactionId`, `company_id`→`companyId`, `matched_amount`→`matchedAmount`, `confidence_score`→`confidenceScore`, `matched_by`→`matchedBy`, `matched_at`→`matchedAt`.
- **Types:** `UUID (FK)`→`UUID`; `Decimal(12,2)` / `Decimal(5,2)`→`Decimal`; `Enum`→`MatchMethod`; `Timestamp`→`Date`; `Text`→`string`.
- **Required:** `paymentAttemptId` Yes, `bankTransactionId` Yes, `companyId` Yes, `matchedAmount` Yes, `confidenceScore` No, `matchedBy` Yes, `matchedAt` Yes, `notes` No.
- **Notes:** Keep domain field `matchedAt` (this is a business timestamp, NOT an audit field — do not drop or merge into `createdAt`).

### 17. Notification  (rows 254–268)
- **Audit before:** `id`, `created_at` only. → After: standard block; **+createdBy(Yes NEW)**, **+updatedAt(No NEW)**, **+updatedBy(No NEW)**, **+deletedAt(No NEW)**, **+deletedBy(No NEW)**. Behavior change flagged.
- **Renames:** `company_id`→`companyId`, `client_id`→`clientId`, `user_id`→`userId`, `notification_template_id`→`notificationTemplateId`, `sent_at`→`sentAt`.
- **Types:** `UUID (FK)`→`UUID`; JSONB encrypted → `EncryptedValue | null` (for `to`, `from`, `subject`, `body`); `Enum`→`NotificationType` / `NotificationChannel` / `NotificationStatus`; `Timestamp`→`Date`.
- **Required:** `companyId` Yes, `clientId` No, `userId` No, `notificationTemplateId` No, `to` Yes (required `EncryptedValue`), `from` No (nullable), `type` Yes, `subject` Yes (required), `body` Yes (required), `channel` Yes, `status` Yes, `sentAt` No.
- **Notes:** Keep domain field `sentAt` (NOT audit).

### 18. NotificationTemplate  (rows 270–284)
- **Audit before:** `id`, `created_at`(Yes), `updated_at`(Yes), `created_by`(No), `updated_by`(No). → After: standard block; **`created_by` No→Yes**; `updated_at` Yes→No; **+deletedAt(No NEW)**, **+deletedBy(No NEW)**. Remove inline `created_by`/`updated_by`.
- **Renames:** `company_id`→`companyId`, `body_plain`→`bodyPlain`, `body_html`→`bodyHtml`, `is_default`→`isDefault`.
- **Types:** `UUID (FK)`→`UUID`; `Enum`→`NotificationType` / `NotificationChannel`; `String`→`string`; `Text`→`string`; `Boolean`→`boolean`.
- **Required:** `companyId` Yes, `name` Yes, `type` Yes, `subject` Yes, `bodyPlain` No, `bodyHtml` Yes, `channel` Yes, `isDefault` Yes, `active` Yes.

### 19. ClientDebtSummary  (rows 286–299)
- **Audit before:** `id`, `updated_at`(Yes) — **no `created_at`**. → After: standard block; **+createdAt(Yes NEW)**, **+createdBy(Yes NEW)**; **`updated_at` Yes→No** (now optional); **+updatedBy(No NEW)**, **+deletedAt(No NEW)**, **+deletedBy(No NEW)**. Behavior change flagged (summary/MV entity now requires `createdAt`/`createdBy`).
- **Renames:** `company_id`→`companyId`, `client_id`→`clientId`, `total_debt`→`totalDebt`, `total_paid`→`totalPaid`, `last_payment_id`→`lastPaymentId`, `last_debt_id`→`lastDebtId`, `last_payment_date`→`lastPaymentDate`, `last_debt_date`→`lastDebtDate`.
- **Types:** `UUID (FK)`→`UUID`; `Decimal(14,2)`→`Decimal`; `Enum`→`Currency` / `ClientDebtSummaryStatus`; `Date`→`Date`.
- **Required:** `companyId` Yes, `clientId` Yes, `totalDebt` Yes, `totalPaid` Yes, `balance` Yes, `currency` Yes, `lastPaymentId` No, `lastDebtId` No, `lastPaymentDate` No, `lastDebtDate` No, `status` Yes.

### 20. CompanyMonthlySummary  (rows 301–311)
- **Audit before:** `id`, `created_at`(Yes), `updated_at`(Yes). → After: standard block; `updated_at` Yes→No; **+createdBy(Yes NEW)**, **+updatedBy(No NEW)**, **+deletedAt(No NEW)**, **+deletedBy(No NEW)**.
- **Renames:** `company_id`→`companyId`, `total_debts_generated`→`totalDebtsGenerated`, `total_payments_received`→`totalPaymentsReceived`, `commission_earned`→`commissionEarned`.
- **Types:** `UUID (FK)`→`UUID`; `Decimal(14,2)`→`Decimal`; `Integer`→`number` (for `year`, `month`); `Enum`→`Currency`; `Timestamp`→`Date`.
- **Required:** `companyId` Yes, `year` Yes, `month` Yes, `totalDebtsGenerated` Yes, `totalPaymentsReceived` Yes, `commissionEarned` Yes, `currency` Yes.

---

## Documentation Updates

### A. `.agent/project-info/data-model-brief.md`

Add a new subsection **"2.x Standard Audit Fields (BaseEntity)"** (insert before "3. Main System Flows"):

```markdown
## 2.x Standard Audit Fields (`BaseEntity`)

Every entity in the model extends the `BaseEntity` interface defined in
`src/interfaces/base-entity.interface.ts`. The library inherits these fields on all
entities; they are not redeclared per entity:

| Field         | Type | Required | Purpose                                  |
|---------------|------|----------|------------------------------------------|
| `id`          | UUID | Yes      | Primary key (persistence-assigned)        |
| `createdAt`   | Date | Yes      | Creation timestamp                        |
| `createdBy`   | UUID | Yes      | UUID of the creating user                 |
| `updatedAt`   | Date | No       | Last update timestamp (null until updated) |
| `updatedBy`   | UUID | No       | UUID of the last modifying user            |
| `deletedAt`   | Date | No       | Soft-delete marker                         |
| `deletedBy`   | UUID | No       | UUID of the user who soft-deleted          |

> Some entities previously lacked `createdAt` / `createdBy` (e.g. `PaymentMatch`,
> `ClientDebtSummary`) — these are now required per `BaseEntity`. Consumers that
> generate these entities must supply `createdBy`; persistence layers supply `id`
> and `createdAt`.
```

Also add a short note at the end of **section 2 ("Entity Definitions & Roles")** bullet list:

```markdown
- **Optionality (Task 5):** `Company.contact`, `Client.fullName`, and
  `Debt.description` are optional fields (nullable where applicable).
```

(No bullet replacements — purely additive edits to the existing file.)

### B. `.agent/project-info/architecture.md`

1. Replace the `BaseEntity` code snippet (lines ~113–122) so the type uses `UUID` (matching the actual interface) rather than raw `string`, and add a one-line note pointing to the source file:

```markdown
### Base Entity Interface

All entities implement `BaseEntity`, which includes audit and soft-delete fields.
Definition lives in `src/interfaces/base-entity.interface.ts`:

```typescript
import { UUID } from '../types/common';
interface BaseEntity {
  id: UUID;          // PK
  createdAt: Date;   // required
  createdBy: UUID;   // required — UUID of creating user
  updatedAt?: Date;  // optional
  updatedBy?: UUID;  // optional
  deletedAt?: Date;  // soft-delete marker
  deletedBy?: UUID;  // optional
}
```
```

2. In the **Naming Conventions** table, the row for "Foreign keys" already states `camelCase with Id suffix`. Add a new row documenting CSV/property case:

```markdown
| Entity properties (CSV + code) | camelCase | `companyId`, `createdAt`, `taxIdHash` |
```

3. No structural changes to the package-structure diagram (it already matches the codebase).

### C. `.agent/project-info/context.md`

Update three sections:

1. **"Current Status"** → append after the existing bullet list:
```markdown
- Task 3 (CSV + docs sync) in progress: `entities-definition.csv` and related docs (data-model-brief, architecture, context, README) being aligned with the BaseEntity migration and Task-5 optionality changes.
```

2. **"Recent Changes"** → append:
```markdown
- Synced `entities-definition.csv` to reflect BaseEntity audit block (id/createdAt/createdBy required; updatedAt/updatedBy/deletedAt/deletedBy optional), camelCase property names, and TypeScript type vocabulary.
- Reflected Task-5 optionality (`Company.contact`, `Client.fullName`, `Debt.description` optional) in CSV and docs.
- Updated `data-model-brief.md` (BaseEntity audit subsection + optionality note), `architecture.md` (BaseEntity snippet + naming row), and `README.md` (optionality note).
```

3. **"Immediate Next Steps"** → replace item 2 with:
```markdown
2. **Implement entities** — Begin writing TypeScript entity interfaces based on the data model definitions. (Already done for all 22 entities; remaining work is Task 6: changelog.)
```
and add:
```markdown
6. **Task 6 — Changelog**: Write the detailed changelog entry for the BaseEntity refactor + optionality changes.
```

> Context.md is the "factual log"; keep edits additive and factual. Do not delete prior content.

### D. `README.md`

1. In the **"Types and Interfaces"** → `BaseEntity` row of the interface table, ensure the description is accurate:
```markdown
| `BaseEntity` | Base interface with `id` (UUID, required), `createdAt` (Date, required), `createdBy` (UUID, required), and optional `updatedAt?`, `updatedBy?`, `deletedAt?`, `deletedBy?` — inherited by every entity |
```
(This already matches lines 18–19 / 37; keep consistent.)

2. After the **"Available Entities"** section, add a short subsection **"Entity Audit & Optionality Notes"**:

```markdown
### Entity Audit & Optionality Notes

- All entities inherit the standard audit fields from `BaseEntity` (see
  [Architecture](.agent/project-info/architecture.md)). They are not redeclared
  per entity.
- The following fields are intentionally optional (Task 5):
  - `Company.contact` — may be omitted; nullable when present.
  - `Client.fullName` — optional; may be completed later.
  - `Debt.description` — optional debt concept.
- For the authoritative per-entity property list (types, required flags, comments),
  see [`entities-definition.csv`](.agent/project-info/entities-definition.csv).
```

(Additive only — do not remove existing README content.)

---

## Detailed Implementation Steps

### Step 1 — Back up CSV (safety)

Copy the current CSV before editing (optional but recommended):

```powershell
Copy-Item ".agent\project-info\entities-definition.csv" ".agent\project-info\entities-definition.csv.bak"
```

> Do NOT commit the `.bak` file — `.gitignore` already may exclude `*.bak`; verify and remove before commit if it would be staged.

### Step 2 — Rewrite the CSV

Rewrite `entities-definition.csv` in place using the strategy + per-entity matrix above. Concretely:

1. Keep the header row unchanged: `,entity,property,type,required,comments`.
2. For each of the 20 entities, in their existing CSV order (Company, CompanyPlan, User, Role, CompanyUser, Client, Debt, DebtSchedule, Invoice, InvoiceTemplate, PaymentProof, PaymentAttempt, Payment, BankStatement, BankTransaction, PaymentMatch, Notification, NotificationTemplate, ClientDebtSummary, CompanyMonthlySummary):
   - Emit one entity row (entity name in col 2, description in col 6 / `comments`).
   - Emit one property row per **domain** field (renamed to camelCase, typed per the vocabulary table, `required` per code).
   - Emit the 7 standard `BaseEntity` audit rows (the standardized block from the strategy section).
   - Emit one blank separator row.
3. Remove all legacy inline audit rows (`created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`, `deleted_by`) that were previously declared per-entity — they are replaced by the standard block.
4. Clean the `**...**` markdown-bold property-name artifacts in BankStatement / BankTransaction.
5. Preserve quoted multi-line comment cells verbatim where they still apply (e.g. `Debt.status`, `PaymentAttempt.status`, `DebtSchedule.day_of_month` legend, `Currency` enum values).

> Because the CSV is fully rewritten, prefer the `vscode-mcp-server_create_file_code` tool (overwrite) over many small `edit` calls. After writing, open the file and visually scan one entity block (e.g. `Company`) to confirm column alignment and quoting.

### Step 3 — Update the four docs

Apply the additive edits defined in section "Documentation Updates" A–D, using `vscode-mcp-server_replace_lines_code` or `edit` for the targeted insertions. Do **not** rewrite any of these docs wholesale — only the specified insertions/snippet replacements.

### Step 4 — Validation (console commands)

Run from `C:\projects\cobranza-app\entities`:

```powershell
npm run build
```
Expected: builds clean (no code changes were made; this guards against accidental edits to `src/`). Exit code 0.

```powershell
npm run typecheck
```
Expected: 0 errors.

Optional CSV sanity checks (PowerShell):

```powershell
# Count entity header rows (should be 20)
Select-String -Path ".agent\project-info\entities-definition.csv" -Pattern '^,([A-Z][A-Za-z]+),,,' | Measure-Object | Select-Object -ExpandProperty Count
```
Expected: 20.

```powershell
# Ensure no snake_case audit or leftover inline audit field names remain as property rows
Select-String -Path ".agent\project-info\entities-definition.csv" -Pattern '^,,(created_at|updated_at|deleted_at|created_by|updated_by|deleted_by|company_id|client_id|\*\*[^,]+\*\*)'
```
Expected: no matches.

```powershell
# Ensure camelCase standard block present 20 times
Select-String -Path ".agent\project-info\entities-definition.csv" -Pattern '^,,createdBy,UUID,Yes,' | Measure-Object | Select-Object -ExpandProperty Count
```
Expected: 20.

### Step 5 — Cross-check matrix vs source (manual)

For a sampled 3 entities (one per audit-category kind), open the rewritten CSV block and the corresponding `src/entities/<module>/<name>.entity.ts` and confirm every property name, type, and required-flag matches. Recommended sample:
- `Role` (gained many optional audit fields — confirm `createdBy` Yes, `updatedAt` No, etc.).
- `PaymentMatch` (gained required `createdAt`/`createdBy`).
- `BankTransaction` (`description` required non-nullable, `reference` optional nullable — confirm the `| null` distinction).

### Step 6 — Code review (deferred to Task 4.3)

Hand off to code-reviewer sub-agent. Acceptance criteria:
- CSV has exactly 20 entity blocks, each ending with the 7-row BaseEntity audit block.
- Zero snake_case properties; zero `**...**` artifacts; zero legacy inline audit rows.
- Type vocabulary uses TS types only (no `String`, `Boolean`, `Integer`, `Timestamp`, `Text`, `Decimal(...)`, raw `Enum`, `UUID (FK)`, `JSONB`).
- `createdBy` required=Yes on all 20; `createdAt` required=Yes on all 20; `updatedAt`/`updatedBy`/`deletedAt`/`deletedBy` = No on all 20.
- docs A–D edits present; additive only; no removed prior content (except replaced BaseEntity snippet in architecture.md and removed legacy inline CSV audit rows).
- `npm run build` + `npm run typecheck` clean.

### Step 7 — Commit

```text
docs(csv): sync entities-definition.csv & docs to BaseEntity + optionality refactor

- Rewrite CSV: camelCase props, TS types, standard BaseEntity audit block per entity
- Reflect Task-2 behavior changes (createdBy optional→required; createdAt gained on PaymentMatch/ClientDebtSummary)
- Reflect Task-5 optionality (Company.contact, Client.fullName, Debt.description optional)
- Clean markdown-bold artifacts in BankStatement/BankTransaction property names
- Update data-model-brief.md, architecture.md, context.md, README.md
```

## Git Actions

- Stay on branch `feat/entity-base-refactor`. No branch switch.
- Single commit at Step 7 after validation passes.
- Do NOT push in this sub-task (push handled by Plan Agent at end of TODO file per Critical Workflow Step 5).
- Verify `.gitignore` excludes the `.bak` file from Step 1 (or delete it) before `git add`.

## Files Modified

- `.agent/project-info/entities-definition.csv` (full rewrite preserving structure).
- `.agent/project-info/data-model-brief.md` (additive: BaseEntity audit subsection + optionality note).
- `.agent/project-info/architecture.md` (BaseEntity snippet → `UUID` types; naming-convention row added).
- `.agent/project-info/context.md` (Recent Changes + Immediate Next Steps updated).
- `README.md` (BaseEntity table row consistency + new "Entity Audit & Optionality Notes" subsection).

## Files NOT Modified

- Any `src/**` file (entities, DTOs, enums, types, interfaces, schemas, tests).
- `.agent/project-info/entities-relationship-diagram-overview.md` (unchanged — relationships unaffected).
- `.agent/project-info/brief.md`, `product.md`, `tech.md` (no factual changes required).
- `package.json`, `tsconfig.json`, configs.

## Verification Steps Summary

1. `npm run build` → exit 0 (no `src/` changes).
2. `npm run typecheck` → 0 errors.
3. CSV entity header count = 20.
4. CSV has zero legacy snake_case audit rows and zero `**...**` artifacts.
5. CSV `createdBy`/`createdAt` Yes count = 20 each; `updatedAt`/`updatedBy`/`deletedAt`/`deletedBy` No count = 20 each.
6. Sampled 3 entity blocks match their `*.entity.ts` source property-for-property.
7. All four docs contain the specified additive edits (grep for anchor strings).
8. Single commit on `feat/entity-base-refactor`.

## Out-of-Scope Notes

- **Receipt / ReceiptTemplate absence from CSV.** The CSV currently has 20 entities; `Receipt` and `ReceiptTemplate` are defined in `src/entities/receipt/` and referenced in `data-model-brief.md`, `architecture.md`, `README.md`, and the relationship diagram, but their property rows are **not** in `entities-definition.csv`. Adding them is a scope expansion beyond Task 3 ("all 20 entities in the CSV"). Decision deferred to the Plan Agent / user: either (a) accept the pre-existing gap, or (b) open a follow-up task to add Receipt + ReceiptTemplate CSV blocks. This plan does NOT add them.
- **Enums documentation.** Enum value listings in CSV comments (e.g. the `status` comment cells) are kept as-is where still accurate. Full enum-to-value cross-reference is not part of this task.
- **Changelog (Task 6).** Writing the detailed changelog is Task 6; not done here. Context.md "Immediate Next Steps" edit references it as remaining work.
- **CSV format redesign** (e.g. adding a `nullable` column, splitting `type` from `format`) is out of scope — preserve the existing 5-column schema.

## Risk / Notes

- The CSV is the human/AI-facing SSOT for entity properties; an inaccurate CSV can mislead consuming services and AI agents. This is the primary reason for the full rewrite + sampled cross-check (Step 5).
- Behavior changes from Tasks 1/2 (newly required `createdAt`/`createdBy`) are intentional and already shipped in code; the CSV now documents them truthfully. No code reverts.
- If code-review finds a CSV row disagrees with the actual `*.entity.ts`, the implementer must fix the CSV row to match the code (code is authoritative for this docs-sync task) — not the reverse.
- Quoting correctness matters: mis-quoted multi-line comment cells will corrupt the CSV. Re-open the file after writing and confirm a parser (or visual inspection) reads 6 columns per row.