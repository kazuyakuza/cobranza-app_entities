# Plan: JSON Schema Generation for All 20 Entities

**Plan ID**: `20260605-task-7-schemas`  
**Task**: Task 2 — JSON Schema Generation from `.agent/todos/20260605/20260605-todo-0.md`  
**Date**: 2026-06-05  
**Format**: JSON Schema Draft-07  
**Scope**: 20 entity schemas, barrel export, root index update

---

## 1. Type Mapping Table

| TypeScript Type | JSON Schema Definition | Notes |
|-----------------|------------------------|-------|
| `UUID` | `{ "type": "string", "format": "uuid" }` | All primary keys and foreign keys |
| `string` | `{ "type": "string" }` | Plain text fields |
| `number` | `{ "type": "integer" }` | `year`, `month`, `totalTransactions` |
| `boolean` | `{ "type": "boolean" }` | `active`, `emailVerified`, `isDefault`, etc. |
| `Date` | `{ "type": "string", "format": "date-time" }` | All timestamps and date fields |
| `Decimal` | `{ "type": "string" }` | Preserved as string for precision |
| `Money` | `{ "type": "string" }` | Defined in `common.ts`, not directly used in entities |
| `JsonData` | `{ "type": "object" }` | Flexible JSON column storage |
| `DateString` | `{ "type": "string", "format": "date" }` | Defined in `common.ts`, not directly used in entities |
| Enum types | `{ "type": "string", "enum": ["VALUE1", "VALUE2"] }` | Embed enum values directly |

---

## 2. Enum Reference Table

| Enum Name | Values |
|-----------|--------|
| `Bank` | `GALICIA`, `BBVA`, `SANTANDER`, `BRUBANK`, `MERCADOPAGO` |
| `BankStatementFormat` | `PDF_TEXT`, `PDF_TABLA`, `EXCEL`, `CSV`, `API` |
| `BankStatementStatus` | `UPLOADED`, `PARSING`, `PROCESSED`, `FAILED`, `MANUALLY_REVIEWED` |
| `BankTransactionStatus` | `UNMATCHED`, `MATCHED`, `IGNORED` |
| `CalculationType` | `FIXED`, `FORMULA` |
| `ClientDebtSummaryStatus` | `NORMAL`, `OVERDUE`, `INACTIVE` |
| `Currency` | `ARS`, `USD` |
| `DebtScheduleFrequency` | `WEEKLY`, `MONTHLY`, `BIMONTHLY`, `QUARTERLY`, `YEARLY` |
| `DebtStatus` | `PENDING`, `OVERDUE`, `PARTIALLY_PAID`, `PAID`, `CANCELLED` |
| `InvoiceStatus` | `PENDING`, `PAID`, `PARTIALLY_PAID`, `OVERDUE`, `CANCELLED` |
| `MatchMethod` | `AUTOMATIC`, `MANUAL` |
| `NotificationChannel` | `EMAIL`, `WHATSAPP`, `SMS` |
| `NotificationStatus` | `PENDING`, `SENT`, `FAILED`, `CANCELLED` |
| `NotificationType` | `PAYMENT_UPLOADED`, `PAYMENT_APPROVED`, `PAYMENT_REJECTED`, `DEBT_OVERDUE` |
| `PaymentAttemptStatus` | `UPLOADED`, `PARSE_FAILED`, `PENDING_VALIDATION`, `MATCHED`, `APPROVED`, `REJECTED` |
| `PaymentStatus` | `CONFIRMED`, `REFUNDED` |

---

## 3. Schema File Layout

**Recommendation**: Flat layout inside `src/schemas/` for simplicity.

```
src/schemas/
  company.schema.json
  company-plan.schema.json
  user.schema.json
  role.schema.json
  company-user.schema.json
  client.schema.json
  debt.schema.json
  debt-schedule.schema.json
  invoice.schema.json
  invoice-template.schema.json
  receipt.schema.json
  receipt-template.schema.json
  payment-proof.schema.json
  payment-attempt.schema.json
  payment.schema.json
  bank-statement.schema.json
  bank-transaction.schema.json
  payment-match.schema.json
  notification.schema.json
  notification-template.schema.json
  client-debt-summary.schema.json
  company-monthly-summary.schema.json
  index.ts
```

---

## 4. Per-Entity Schema Specifications

### 4.1 Company Domain

#### `company.schema.json`
- **Title**: `Company`
- **Properties**:
  - `id`: `uuid`
  - `friendlyUrl`: `string`
  - `name`: `string`
  - `businessName`: `string`
  - `taxId`: `string`
  - `contact`: `string`
  - `phone`: `string`
  - `address`: `string`
  - `logoUrl`: `string`
  - `active`: `boolean`
  - `settings`: `object` (JsonData)
  - `createdAt`: `date-time`
  - `updatedAt`: `date-time`
- **Required**: `["id", "friendlyUrl", "name", "contact", "active", "createdAt", "updatedAt"]`

#### `company-plan.schema.json`
- **Title**: `CompanyPlan`
- **Properties**:
  - `id`: `uuid`
  - `companyId`: `uuid`
  - `commissionRate`: `string` (Decimal)
  - `saasPercentage`: `string` (Decimal)
  - `intermediaryPercentage`: `string` (Decimal)
  - `currency`: `string` enum `["ARS", "USD"]`
  - `active`: `boolean`
  - `validFrom`: `date-time`
  - `validUntil`: `date-time`
  - `notes`: `string`
  - `createdAt`: `date-time`
  - `updatedAt`: `date-time`
- **Required**: `["id", "companyId", "commissionRate", "saasPercentage", "currency", "active", "validFrom", "createdAt", "updatedAt"]`

#### `user.schema.json`
- **Title**: `User`
- **Properties**:
  - `id`: `uuid`
  - `email`: `string`
  - `passwordHash`: `string`
  - `passwordUpdatedAt`: `date-time`
  - `fullName`: `string`
  - `phone`: `string`
  - `active`: `boolean`
  - `emailVerified`: `boolean`
  - `lastLoginAt`: `date-time`
  - `createdAt`: `date-time`
  - `updatedAt`: `date-time`
- **Required**: `["id", "email", "active", "emailVerified", "createdAt", "updatedAt"]`

#### `role.schema.json`
- **Title**: `Role`
- **Properties**:
  - `id`: `uuid`
  - `name`: `string`
  - `description`: `string`
  - `createdAt`: `date-time`
- **Required**: `["id", "name", "createdAt"]`

#### `company-user.schema.json`
- **Title**: `CompanyUser`
- **Properties**:
  - `id`: `uuid`
  - `companyId`: `uuid`
  - `userId`: `uuid`
  - `roleId`: `uuid`
  - `active`: `boolean`
  - `createdAt`: `date-time`
  - `updatedAt`: `date-time`
- **Required**: `["id", "companyId", "userId", "roleId", "active", "createdAt", "updatedAt"]`

---

### 4.2 Client Domain

#### `client.schema.json`
- **Title**: `Client`
- **Properties**:
  - `id`: `uuid`
  - `companyId`: `uuid`
  - `clientCode`: `string`
  - `fullName`: `string`
  - `email`: `string`
  - `phone`: `string`
  - `address`: `string`
  - `taxId`: `string`
  - `extraData`: `object` (JsonData)
  - `active`: `boolean`
  - `notes`: `string`
  - `createdAt`: `date-time`
  - `updatedAt`: `date-time`
  - `updatedBy`: `uuid`
- **Required**: `["id", "companyId", "clientCode", "fullName", "active", "createdAt", "updatedAt"]`

---

### 4.3 Debt Domain

#### `debt.schema.json`
- **Title**: `Debt`
- **Properties**:
  - `id`: `uuid`
  - `companyId`: `uuid`
  - `clientId`: `uuid`
  - `debtScheduleId`: `uuid`
  - `debtCode`: `string`
  - `description`: `string`
  - `totalAmount`: `string` (Decimal)
  - `currency`: `string` enum `["ARS", "USD"]`
  - `dueDate`: `date-time`
  - `issueDate`: `date-time`
  - `dailyInterestRate`: `string` (Decimal)
  - `status`: `string` enum `["PENDING", "OVERDUE", "PARTIALLY_PAID", "PAID", "CANCELLED"]`
  - `notes`: `string`
  - `extraData`: `object` (JsonData)
  - `invoiceTemplateId`: `uuid`
  - `createdAt`: `date-time`
  - `updatedAt`: `date-time`
  - `createdBy`: `uuid`
  - `updatedBy`: `uuid`
- **Required**: `["id", "companyId", "clientId", "debtCode", "description", "totalAmount", "currency", "dueDate", "issueDate", "status", "createdAt", "updatedAt"]`

#### `debt-schedule.schema.json`
- **Title**: `DebtSchedule`
- **Properties**:
  - `id`: `uuid`
  - `companyId`: `uuid`
  - `groupId`: `uuid`
  - `clientId`: `uuid`
  - `name`: `string`
  - `description`: `string`
  - `amount`: `string` (Decimal)
  - `currency`: `string` enum `["ARS", "USD"]`
  - `frequency`: `string` enum `["WEEKLY", "MONTHLY", "BIMONTHLY", "QUARTERLY", "YEARLY"]`
  - `dayOfMonth`: `string`
  - `calculationType`: `string` enum `["FIXED", "FORMULA"]`
  - `calculationFormula`: `string`
  - `dailyInterestRate`: `string` (Decimal)
  - `active`: `boolean`
  - `startDate`: `date-time`
  - `endDate`: `date-time`
  - `lastGeneratedDate`: `date-time`
  - `invoiceTemplateId`: `uuid`
  - `createdAt`: `date-time`
  - `updatedAt`: `date-time`
  - `createdBy`: `uuid`
  - `updatedBy`: `uuid`
  - `deletedAt`: `date-time`
  - `deletedBy`: `uuid`
- **Required**: `["id", "companyId", "clientId", "name", "amount", "currency", "frequency", "dayOfMonth", "calculationType", "active", "startDate", "createdAt", "updatedAt"]`

---

### 4.4 Invoice Domain

#### `invoice.schema.json`
- **Title**: `Invoice`
- **Properties**:
  - `id`: `uuid`
  - `companyId`: `uuid`
  - `clientId`: `uuid`
  - `debtId`: `uuid`
  - `invoiceTemplateId`: `uuid`
  - `invoiceNumber`: `string`
  - `issueDate`: `date-time`
  - `dueDate`: `date-time`
  - `totalAmount`: `string` (Decimal)
  - `currency`: `string` enum `["ARS", "USD"]`
  - `status`: `string` enum `["PENDING", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED"]`
  - `notes`: `string`
  - `createdAt`: `date-time`
  - `updatedAt`: `date-time`
  - `createdBy`: `uuid`
  - `updatedBy`: `uuid`
- **Required**: `["id", "companyId", "clientId", "debtId", "invoiceNumber", "issueDate", "dueDate", "totalAmount", "currency", "status", "createdAt", "updatedAt"]`

#### `invoice-template.schema.json`
- **Title**: `InvoiceTemplate`
- **Properties**:
  - `id`: `uuid`
  - `companyId`: `uuid`
  - `name`: `string`
  - `subject`: `string`
  - `bodyHtml`: `string`
  - `isDefault`: `boolean`
  - `active`: `boolean`
  - `createdAt`: `date-time`
  - `updatedAt`: `date-time`
  - `createdBy`: `uuid`
  - `updatedBy`: `uuid`
  - `deletedAt`: `date-time`
  - `deletedBy`: `uuid`
- **Required**: `["id", "companyId", "name", "subject", "bodyHtml", "isDefault", "active", "createdAt", "updatedAt"]`

---

### 4.5 Receipt Domain

#### `receipt.schema.json`
- **Title**: `Receipt`
- **Properties**:
  - `id`: `uuid`
  - `companyId`: `uuid`
  - `clientId`: `uuid`
  - `debtId`: `uuid`
  - `receiptTemplateId`: `uuid`
  - `receiptNumber`: `string`
  - `issueDate`: `date-time`
  - `dueDate`: `date-time`
  - `totalAmount`: `string` (Decimal)
  - `currency`: `string` enum `["ARS", "USD"]`
  - `status`: `string` enum `["PENDING", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED"]`
  - `notes`: `string`
  - `createdAt`: `date-time`
  - `updatedAt`: `date-time`
  - `createdBy`: `uuid`
  - `updatedBy`: `uuid`
- **Required**: `["id", "companyId", "clientId", "debtId", "receiptNumber", "issueDate", "dueDate", "totalAmount", "currency", "status", "createdAt", "updatedAt"]`

#### `receipt-template.schema.json`
- **Title**: `ReceiptTemplate`
- **Properties**:
  - `id`: `uuid`
  - `companyId`: `uuid`
  - `name`: `string`
  - `subject`: `string`
  - `bodyHtml`: `string`
  - `isDefault`: `boolean`
  - `active`: `boolean`
  - `createdAt`: `date-time`
  - `updatedAt`: `date-time`
  - `createdBy`: `uuid`
  - `updatedBy`: `uuid`
  - `deletedAt`: `date-time`
  - `deletedBy`: `uuid`
- **Required**: `["id", "companyId", "name", "subject", "bodyHtml", "isDefault", "active", "createdAt", "updatedAt"]`

---

### 4.6 Payment Domain

#### `payment-proof.schema.json`
- **Title**: `PaymentProof`
- **Properties**:
  - `id`: `uuid`
  - `companyId`: `uuid`
  - `clientId`: `uuid`
  - `fileUrl`: `string`
  - `fileName`: `string`
  - `fileType`: `string`
  - `notes`: `string`
  - `createdAt`: `date-time`
  - `createdBy`: `uuid`
- **Required**: `["id", "companyId", "clientId", "fileUrl", "fileName", "createdAt"]`

#### `payment-attempt.schema.json`
- **Title**: `PaymentAttempt`
- **Properties**:
  - `id`: `uuid`
  - `companyId`: `uuid`
  - `clientId`: `uuid`
  - `paymentProofId`: `uuid`
  - `debtId`: `uuid`
  - `amount`: `string` (Decimal)
  - `currency`: `string` enum `["ARS", "USD"]`
  - `status`: `string` enum `["UPLOADED", "PARSE_FAILED", "PENDING_VALIDATION", "MATCHED", "APPROVED", "REJECTED"]`
  - `rejectionReason`: `string`
  - `reviewedBy`: `uuid`
  - `reviewedAt`: `date-time`
  - `createdAt`: `date-time`
  - `updatedAt`: `date-time`
- **Required**: `["id", "companyId", "clientId", "paymentProofId", "debtId", "status", "createdAt", "updatedAt"]`

#### `payment.schema.json`
- **Title**: `Payment`
- **Properties**:
  - `id`: `uuid`
  - `companyId`: `uuid`
  - `clientId`: `uuid`
  - `debtId`: `uuid`
  - `paymentAttemptId`: `uuid`
  - `amount`: `string` (Decimal)
  - `currency`: `string` enum `["ARS", "USD"]`
  - `paymentDate`: `date-time`
  - `status`: `string` enum `["CONFIRMED", "REFUNDED"]`
  - `notes`: `string`
  - `createdAt`: `date-time`
  - `updatedAt`: `date-time`
  - `createdBy`: `uuid`
  - `updatedBy`: `uuid`
- **Required**: `["id", "companyId", "clientId", "debtId", "amount", "currency", "paymentDate", "status", "createdAt", "updatedAt"]`

---

### 4.7 Bank Domain

#### `bank-statement.schema.json`
- **Title**: `BankStatement`
- **Properties**:
  - `id`: `uuid`
  - `companyId`: `uuid`
  - `bank`: `string` enum `["GALICIA", "BBVA", "SANTANDER", "BRUBANK", "MERCADOPAGO"]`
  - `format`: `string` enum `["PDF_TEXT", "PDF_TABLA", "EXCEL", "CSV", "API"]`
  - `fileUrl`: `string`
  - `fileName`: `string`
  - `periodFrom`: `date-time`
  - `periodTo`: `date-time`
  - `status`: `string` enum `["UPLOADED", "PARSING", "PROCESSED", "FAILED", "MANUALLY_REVIEWED"]`
  - `totalTransactions`: `integer`
  - `notes`: `string`
  - `createdAt`: `date-time`
  - `updatedAt`: `date-time`
  - `createdBy`: `uuid`
  - `updatedBy`: `uuid`
- **Required**: `["id", "companyId", "bank", "format", "fileUrl", "fileName", "status", "createdAt", "updatedAt"]`

#### `bank-transaction.schema.json`
- **Title**: `BankTransaction`
- **Properties**:
  - `id`: `uuid`
  - `bankStatementId`: `uuid`
  - `companyId`: `uuid`
  - `clientId`: `uuid`
  - `transactionDate`: `date-time`
  - `amount`: `string` (Decimal)
  - `currency`: `string` enum `["ARS", "USD"]`
  - `description`: `string`
  - `reference`: `string`
  - `balanceAfter`: `string` (Decimal)
  - `status`: `string` enum `["UNMATCHED", "MATCHED", "IGNORED"]`
  - `createdAt`: `date-time`
  - `updatedAt`: `date-time`
- **Required**: `["id", "bankStatementId", "companyId", "transactionDate", "amount", "currency", "description", "status", "createdAt", "updatedAt"]`

#### `payment-match.schema.json`
- **Title**: `PaymentMatch`
- **Properties**:
  - `id`: `uuid`
  - `paymentAttemptId`: `uuid`
  - `bankTransactionId`: `uuid`
  - `companyId`: `uuid`
  - `matchedAmount`: `string` (Decimal)
  - `confidenceScore`: `string` (Decimal)
  - `matchedBy`: `string` enum `["AUTOMATIC", "MANUAL"]`
  - `matchedAt`: `date-time`
  - `notes`: `string`
- **Required**: `["id", "paymentAttemptId", "bankTransactionId", "companyId", "matchedAmount", "matchedBy", "matchedAt"]`

---

### 4.8 Notification Domain

#### `notification.schema.json`
- **Title**: `Notification`
- **Properties**:
  - `id`: `uuid`
  - `companyId`: `uuid`
  - `clientId`: `uuid`
  - `userId`: `uuid`
  - `notificationTemplateId`: `uuid`
  - `to`: `string`
  - `from`: `string`
  - `type`: `string` enum `["PAYMENT_UPLOADED", "PAYMENT_APPROVED", "PAYMENT_REJECTED", "DEBT_OVERDUE"]`
  - `subject`: `string`
  - `body`: `string`
  - `channel`: `string` enum `["EMAIL", "WHATSAPP", "SMS"]`
  - `status`: `string` enum `["PENDING", "SENT", "FAILED", "CANCELLED"]`
  - `sentAt`: `date-time`
  - `createdAt`: `date-time`
- **Required**: `["id", "companyId", "to", "type", "subject", "body", "channel", "status", "createdAt"]`

#### `notification-template.schema.json`
- **Title**: `NotificationTemplate`
- **Properties**:
  - `id`: `uuid`
  - `companyId`: `uuid`
  - `name`: `string`
  - `type`: `string` enum `["PAYMENT_UPLOADED", "PAYMENT_APPROVED", "PAYMENT_REJECTED", "DEBT_OVERDUE"]`
  - `subject`: `string`
  - `bodyPlain`: `string`
  - `bodyHtml`: `string`
  - `channel`: `string` enum `["EMAIL", "WHATSAPP", "SMS"]`
  - `isDefault`: `boolean`
  - `active`: `boolean`
  - `createdAt`: `date-time`
  - `updatedAt`: `date-time`
  - `createdBy`: `uuid`
  - `updatedBy`: `uuid`
- **Required**: `["id", "companyId", "name", "type", "subject", "bodyHtml", "channel", "isDefault", "active", "createdAt", "updatedAt"]`

---

### 4.9 Summary Domain

#### `client-debt-summary.schema.json`
- **Title**: `ClientDebtSummary`
- **Properties**:
  - `id`: `uuid`
  - `companyId`: `uuid`
  - `clientId`: `uuid`
  - `totalDebt`: `string` (Decimal)
  - `totalPaid`: `string` (Decimal)
  - `balance`: `string` (Decimal)
  - `currency`: `string` enum `["ARS", "USD"]`
  - `lastPaymentId`: `uuid`
  - `lastDebtId`: `uuid`
  - `lastPaymentDate`: `date-time`
  - `lastDebtDate`: `date-time`
  - `status`: `string` enum `["NORMAL", "OVERDUE", "INACTIVE"]`
  - `updatedAt`: `date-time`
- **Required**: `["id", "companyId", "clientId", "totalDebt", "totalPaid", "balance", "currency", "status", "updatedAt"]`

#### `company-monthly-summary.schema.json`
- **Title**: `CompanyMonthlySummary`
- **Properties**:
  - `id`: `uuid`
  - `companyId`: `uuid`
  - `year`: `integer`
  - `month`: `integer`
  - `totalDebtsGenerated`: `string` (Decimal)
  - `totalPaymentsReceived`: `string` (Decimal)
  - `commissionEarned`: `string` (Decimal)
  - `currency`: `string` enum `["ARS", "USD"]`
  - `createdAt`: `date-time`
  - `updatedAt`: `date-time`
- **Required**: `["id", "companyId", "year", "month", "totalDebtsGenerated", "totalPaymentsReceived", "commissionEarned", "currency", "createdAt", "updatedAt"]`

---

## 5. Barrel Export Design (`src/schemas/index.ts`)

Since `resolveJsonModule` is enabled, JSON files can be imported as modules. However, direct re-exports of JSON via `export { default as x } from './y.json'` may fail in some TypeScript/Node configurations. The safest approach is a **record object** that imports each schema and exports them grouped by domain.

```typescript
import companySchema from './company.schema.json';
import companyPlanSchema from './company-plan.schema.json';
import userSchema from './user.schema.json';
import roleSchema from './role.schema.json';
import companyUserSchema from './company-user.schema.json';
import clientSchema from './client.schema.json';
import debtSchema from './debt.schema.json';
import debtScheduleSchema from './debt-schedule.schema.json';
import invoiceSchema from './invoice.schema.json';
import invoiceTemplateSchema from './invoice-template.schema.json';
import receiptSchema from './receipt.schema.json';
import receiptTemplateSchema from './receipt-template.schema.json';
import paymentProofSchema from './payment-proof.schema.json';
import paymentAttemptSchema from './payment-attempt.schema.json';
import paymentSchema from './payment.schema.json';
import bankStatementSchema from './bank-statement.schema.json';
import bankTransactionSchema from './bank-transaction.schema.json';
import paymentMatchSchema from './payment-match.schema.json';
import notificationSchema from './notification.schema.json';
import notificationTemplateSchema from './notification-template.schema.json';
import clientDebtSummarySchema from './client-debt-summary.schema.json';
import companyMonthlySummarySchema from './company-monthly-summary.schema.json';

export const schemas = {
  company: {
    company: companySchema,
    companyPlan: companyPlanSchema,
    user: userSchema,
    role: roleSchema,
    companyUser: companyUserSchema,
  },
  client: {
    client: clientSchema,
  },
  debt: {
    debt: debtSchema,
    debtSchedule: debtScheduleSchema,
  },
  invoice: {
    invoice: invoiceSchema,
    invoiceTemplate: invoiceTemplateSchema,
  },
  receipt: {
    receipt: receiptSchema,
    receiptTemplate: receiptTemplateSchema,
  },
  payment: {
    paymentProof: paymentProofSchema,
    paymentAttempt: paymentAttemptSchema,
    payment: paymentSchema,
  },
  bank: {
    bankStatement: bankStatementSchema,
    bankTransaction: bankTransactionSchema,
    paymentMatch: paymentMatchSchema,
  },
  notification: {
    notification: notificationSchema,
    notificationTemplate: notificationTemplateSchema,
  },
  summary: {
    clientDebtSummary: clientDebtSummarySchema,
    companyMonthlySummary: companyMonthlySummarySchema,
  },
};

// Also export individual schemas for direct import
export {
  companySchema,
  companyPlanSchema,
  userSchema,
  roleSchema,
  companyUserSchema,
  clientSchema,
  debtSchema,
  debtScheduleSchema,
  invoiceSchema,
  invoiceTemplateSchema,
  receiptSchema,
  receiptTemplateSchema,
  paymentProofSchema,
  paymentAttemptSchema,
  paymentSchema,
  bankStatementSchema,
  bankTransactionSchema,
  paymentMatchSchema,
  notificationSchema,
  notificationTemplateSchema,
  clientDebtSummarySchema,
  companyMonthlySummarySchema,
};
```

---

## 6. Root Export Update (`src/index.ts`)

Add `schemas` export to the root barrel:

```typescript
export * from './enums';
export * from './interfaces';
export * from './types';
export * from './entities';
export * from './schemas';
```

---

## 7. Implementation Steps

| Step | Action | File(s) |
|------|--------|---------|
| 1 | Create `src/schemas/` directory | `src/schemas/` |
| 2 | Generate 21 JSON schema files (20 entities + index) | `src/schemas/*.schema.json` |
| 3 | Create barrel export | `src/schemas/index.ts` |
| 4 | Update root barrel | `src/index.ts` |
| 5 | Update `tsconfig.json` if needed | `tsconfig.json` |
| 6 | Run `npm run typecheck` | terminal |
| 7 | Verify barrel exports resolve | terminal |

---

## 8. Verification Steps

1. **TypeScript compilation**: Run `npm run typecheck` to ensure `resolveJsonModule` allows importing `.json` files and the barrel compiles without errors.
2. **Barrel resolution**: Verify that `import { schemas } from './schemas'` and `import { debtSchema } from './schemas'` work correctly.
3. **Schema count**: Confirm exactly 20 `.schema.json` files exist in `src/schemas/`.
4. **Root export**: Confirm `src/index.ts` re-exports `schemas`.
5. **Required fields parity**: Cross-check each `required` array against the original entity interface to ensure optional fields (marked with `?`) are excluded.

---

## 9. Example Schema Snippet (Debt)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Debt",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "companyId": { "type": "string", "format": "uuid" },
    "clientId": { "type": "string", "format": "uuid" },
    "debtScheduleId": { "type": "string", "format": "uuid" },
    "debtCode": { "type": "string" },
    "description": { "type": "string" },
    "totalAmount": { "type": "string" },
    "currency": { "type": "string", "enum": ["ARS", "USD"] },
    "dueDate": { "type": "string", "format": "date-time" },
    "issueDate": { "type": "string", "format": "date-time" },
    "dailyInterestRate": { "type": "string" },
    "status": { "type": "string", "enum": ["PENDING", "OVERDUE", "PARTIALLY_PAID", "PAID", "CANCELLED"] },
    "notes": { "type": "string" },
    "extraData": { "type": "object" },
    "invoiceTemplateId": { "type": "string", "format": "uuid" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" },
    "createdBy": { "type": "string", "format": "uuid" },
    "updatedBy": { "type": "string", "format": "uuid" }
  },
  "required": [
    "id",
    "companyId",
    "clientId",
    "debtCode",
    "description",
    "totalAmount",
    "currency",
    "dueDate",
    "issueDate",
    "status",
    "createdAt",
    "updatedAt"
  ]
}
```

---

## 10. Plan Verification against Original Task

- ✅ JSON Schema files stored in `src/schemas/` (one file per entity)
- ✅ Barrel export: `src/schemas/index.ts` with domain-grouped exports
- ✅ Schemas kept in sync with TypeScript interfaces (all 20 entities covered)
- ✅ Proper `$schema`, `title`, `properties`, `required`, and `enum` definitions
- ✅ Format: JSON Schema Draft-07
- ✅ Root export update (`src/index.ts`) planned
- ✅ Verification steps (`npm run typecheck`, barrel resolution) included
