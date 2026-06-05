# Task 4 Plan: Define Project Structure

## Objective

Create the complete folder structure under `src/`, barrel export files, placeholder enum/type/interface files with initial content derived from `entities-definition.csv` and `architecture.md`, and update `.agent/project-structure.md`.

## 1. Folders to Create

- `src/entities/`
- `src/entities/company/`
- `src/entities/client/`
- `src/entities/debt/`
- `src/entities/payment/`
- `src/entities/bank/`
- `src/entities/invoice/`
- `src/entities/receipt/`
- `src/entities/notification/`
- `src/entities/summary/`
- `src/enums/`
- `src/types/`
- `src/interfaces/`

## 2. Barrel Export Files (all contain `export {};`)

- `src/index.ts`
- `src/entities/index.ts`
- `src/entities/company/index.ts`
- `src/entities/client/index.ts`
- `src/entities/debt/index.ts`
- `src/entities/payment/index.ts`
- `src/entities/bank/index.ts`
- `src/entities/invoice/index.ts`
- `src/entities/receipt/index.ts`
- `src/entities/notification/index.ts`
- `src/entities/summary/index.ts`
- `src/enums/index.ts`
- `src/types/index.ts`
- `src/interfaces/index.ts`

## 3. Enum Files

All under `src/enums/`:

- `debt-status.enum.ts` — PENDING, OVERDUE, PARTIALLY_PAID, PAID, CANCELLED
- `payment-status.enum.ts` — CONFIRMED, REFUNDED
- `payment-attempt-status.enum.ts` — UPLOADED, PARSE_FAILED, PENDING_VALIDATION, MATCHED, APPROVED, REJECTED
- `bank-statement-status.enum.ts` — UPLOADED, PARSING, PROCESSED, FAILED, MANUALLY_REVIEWED
- `bank-transaction-status.enum.ts` — UNMATCHED, MATCHED, IGNORED
- `notification-type.enum.ts` — PAYMENT_UPLOADED, PAYMENT_APPROVED, PAYMENT_REJECTED, DEBT_OVERDUE
- `notification-channel.enum.ts` — EMAIL, WHATSAPP, SMS
- `currency.enum.ts` — ARS, USD
- `debt-schedule-frequency.enum.ts` — WEEKLY, MONTHLY, BIMONTHLY, QUARTERLY, YEARLY
- `calculation-type.enum.ts` — FIXED, FORMULA
- `match-method.enum.ts` — AUTOMATIC, MANUAL
- `invoice-status.enum.ts` — PENDING, PAID, PARTIALLY_PAID, OVERDUE, CANCELLED

## 4. Type Files

- `src/types/common.ts` — UUID (string alias), Money (string alias)
- `src/types/index.ts` — barrel

## 5. Interface Files

- `src/interfaces/base-entity.interface.ts` — BaseEntity (id, createdAt, updatedAt, createdBy?, updatedBy?) + SoftDeletable (deletedAt?, deletedBy?)
- `src/interfaces/index.ts` — barrel

## 6. Order of Operations

1. Remove `src/.gitkeep`
2. Create all folders
3. Create all barrel index.ts files
4. Create all enum files
5. Create type files
6. Create interface files
7. Update `.agent/project-structure.md`
8. Commit with message: `feat: define src folder structure with barrel exports, enums, types, and interfaces`

## 7. Update `.agent/project-structure.md`

Replace with updated content listing all `src/` folders with brief AI-agent-understandable comments.

## 8. Verification

- All 13 folders exist
- 14 barrel index.ts files exist
- 12 enum files exist
- 2 type files + 2 interface files exist
- `.agent/project-structure.md` updated
- `src/.gitkeep` removed
