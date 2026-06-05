# Task 4: Entities Implementation Plan

## Overview

Create 20 TypeScript entity interface files across 9 domain directories under `src/entities/`.
Each file is a plain interface with JSDoc on every property. No decorators, no runtime logic.
Barrel `index.ts` updates are **excluded** (Task 5).

---

## Type Mapping Reference

| CSV Type | TypeScript Type | Import Source |
|---|---|---|
| UUID | `UUID` | `../types/common` |
| UUID (FK) | `UUID` | `../types/common` |
| Timestamp | `Date` | built-in |
| Date | `Date` | built-in |
| Decimal(...) | `Decimal` | `../types/common` |
| JSONB | `JsonData` | `../types/common` |
| Text | `string` | built-in |
| Integer | `number` | built-in |
| Boolean | `boolean` | built-in |
| String | `string` | built-in |
| Enum | specific enum | `../enums/*` |

---

## Base Interface Usage Rules

- **BaseEntity** = `id`, `createdAt`, `updatedAt`, `createdBy?`, `updatedBy?`
- **SoftDeletable** = `deletedAt?`, `deletedBy?`
- Extend **BaseEntity** only when the entity has `createdBy` **and/or** `updatedBy` (or when all four audit fields match exactly).
- When an entity has `createdAt` + `updatedAt` but **no** `createdBy`/`updatedBy`, define `id`, `createdAt`, `updatedAt` explicitly.
- When an entity lacks `createdAt` or `updatedAt`, define all fields explicitly.

---

## Domain: company/

### File: `src/entities/company/company.entity.ts`

```typescript
import type { UUID } from '../../types/common';
import type { JsonData } from '../../types/common';

/**
 * SaaS client company (the main tenant).
 */
export interface Company {
  /** Primary key identifier. */
  id: UUID;

  /** Slug unique (`acme-servicios`, `lopez-contador`). Will be used in URLs. */
  friendlyUrl: string;

  /** Trade name / brand name. */
  name: string;

  /** Legal business name. */
  businessName?: string;

  /** Tax ID (e.g., CUIT, RUC, etc.). */
  taxId?: string;

  /** Email or contact information to be displayed to the end client. */
  contact: string;

  /** Contact phone. */
  phone?: string;

  /** Address. */
  address?: string;

  /** Logo URL. */
  logoUrl?: string;

  /** Whether the company is active. Default: true. */
  active: boolean;

  /** General company settings. */
  settings?: JsonData;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** Timestamp when the entity was last updated. */
  updatedAt: Date;
}
```

### File: `src/entities/company/company-plan.entity.ts`

```typescript
import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';

/**
 * Pricing configuration (% commission, etc.).
 */
export interface CompanyPlan {
  /** Primary key identifier. */
  id: UUID;

  /** Reference to the company. */
  companyId: UUID;

  /** E.g., 0.085 = 8.5% (total). */
  commissionRate: Decimal;

  /** Percentage retained by the platform. */
  saasPercentage: Decimal;

  /** If there is an intermediary. */
  intermediaryPercentage?: Decimal;

  /** `'ARS'` or `'USD'`. */
  currency: Currency;

  /** Whether the plan is active. Default: true. */
  active: boolean;

  /** Start of validity period. */
  validFrom: Date;

  /** End of validity period. Null = undefined (no end date). */
  validUntil?: Date;

  /** Additional notes. */
  notes?: string;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** Timestamp when the entity was last updated. */
  updatedAt: Date;
}
```

### File: `src/entities/company/user.entity.ts`

```typescript
import type { UUID } from '../../types/common';

/**
 * Any person with an account in the system (Company users + future End Users with login).
 */
export interface User {
  /** Primary key identifier. */
  id: UUID;

  /** Globally unique email. */
  email: string;

  /** Hashed password. */
  passwordHash?: string;

  /** Date of last password change. */
  passwordUpdatedAt?: Date;

  /** Optional full name (can be completed later). */
  fullName?: string;

  /** Phone number. */
  phone?: string;

  /** Whether the user is active. Default: true. */
  active: boolean;

  /** Whether the email is verified. Default: false. */
  emailVerified: boolean;

  /** Timestamp of the last login. */
  lastLoginAt?: Date;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** Timestamp when the entity was last updated. */
  updatedAt: Date;
}
```

### File: `src/entities/company/role.entity.ts`

```typescript
import type { UUID } from '../../types/common';

/**
 * Roles (company_admin, company_operator, end_user, super_admin, etc.).
 */
export interface Role {
  /** Primary key identifier. */
  id: UUID;

  /** E.g., `company_admin`, `company_operator`, `end_user`, `super_admin`. */
  name: string;

  /** Role description. */
  description?: string;

  /** Timestamp when the entity was created. */
  createdAt: Date;
}
```

### File: `src/entities/company/company-user.entity.ts`

```typescript
import type { UUID } from '../../types/common';

/**
 * Many-to-many relationship between User and Company + specific role within the company.
 */
export interface CompanyUser {
  /** Primary key identifier. */
  id: UUID;

  /** Reference to the company. */
  companyId: UUID;

  /** Reference to the user. */
  userId: UUID;

  /** Reference to the role. */
  roleId: UUID;

  /** Whether the relationship is active. Default: true. */
  active: boolean;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** Timestamp when the entity was last updated. */
  updatedAt: Date;
}
```

---

## Domain: client/

### File: `src/entities/client/client.entity.ts`

```typescript
import type { UUID } from '../../types/common';
import type { JsonData } from '../../types/common';

/**
 * End client / debtor of a Company.
 */
export interface Client {
  /** Primary key identifier. */
  id: UUID;

  /** Reference to the company. */
  companyId: UUID;

  /** Unique code per Company (e.g., `CLI-00042`). */
  clientCode: string;

  /** Full name of the debtor. */
  fullName: string;

  /** Email. Highly recommended. */
  email?: string;

  /** Phone number. */
  phone?: string;

  /** Address. */
  address?: string;

  /** National ID / Tax ID of the end client (e.g., DNI, CUIT). */
  taxId?: string;

  /** Custom fields (e.g., `{ "dni": "...", "category": "..." }`). */
  extraData?: JsonData;

  /** Whether the client is active. Default: true. */
  active: boolean;

  /** Internal notes. */
  notes?: string;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** Timestamp when the entity was last updated. */
  updatedAt: Date;

  /** ID of the User who made the last modification. */
  updatedBy?: UUID;
}
```

---

## Domain: debt/

### File: `src/entities/debt/debt.entity.ts`

```typescript
import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import type { JsonData } from '../../types/common';
import { Currency } from '../../enums/currency.enum';
import { DebtStatus } from '../../enums/debt-status.enum';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * Individual debt.
 */
export interface Debt extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** Reference to the client. */
  clientId: UUID;

  /** Reference if the debt was automatically generated from a schedule. */
  debtScheduleId?: UUID;

  /** Human-readable code (e.g., `DEUD-2026-0042`). */
  debtCode: string;

  /** Debt concept / description. */
  description: string;

  /** Original amount. */
  totalAmount: Decimal;

  /** `'ARS'` or `'USD'`. */
  currency: Currency;

  /** Due date. */
  dueDate: Date;

  /** Issue date. */
  issueDate: Date;

  /** Daily interest rate after due date (e.g., 0.0050 = 0.5% daily). Null = no interest. */
  dailyInterestRate?: Decimal;

  /** Status of the debt. */
  status: DebtStatus;

  /** Additional notes. */
  notes?: string;

  /** Extra data. */
  extraData?: JsonData;

  /** Invoice/receipt template to use. */
  invoiceTemplateId?: UUID;
}
```

### File: `src/entities/debt/debt-schedule.entity.ts`

```typescript
import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';
import { DebtScheduleFrequency } from '../../enums/debt-schedule-frequency.enum';
import { CalculationType } from '../../enums/calculation-type.enum';
import type { BaseEntity } from '../../interfaces/base-entity.interface';
import type { SoftDeletable } from '../../interfaces/base-entity.interface';

/**
 * Recurring / scheduled debt.
 */
export interface DebtSchedule extends BaseEntity, SoftDeletable {
  /** Reference to the company. */
  companyId: UUID;

  /** UUID to group multiple DebtSchedules created in bulk (allows group editing). */
  groupId?: UUID;

  /** Reference to the client. */
  clientId: UUID;

  /** Name of the recurrence. */
  name: string;

  /** Description. */
  description?: string;

  /** Base amount. */
  amount: Decimal;

  /** `'ARS'` or `'USD'`. */
  currency: Currency;

  /** `'WEEKLY'`, `'MONTHLY'`, `'BIMONTHLY'`, `'QUARTERLY'`, `'YEARLY'`. */
  frequency: DebtScheduleFrequency;

  /** E.g., `15` -> day 15 of the month. `2L` -> 2nd Monday, `4V` -> 4th Friday, `1D` -> 1st Sunday, etc. */
  dayOfMonth: string;

  /** `'FIXED'` or `'FORMULA'`. */
  calculationType: CalculationType;

  /** For dynamic calculations. */
  calculationFormula?: string;

  /** Daily rate after due date (inheritable by generated debts). */
  dailyInterestRate?: Decimal;

  /** Whether the schedule is active. Default: true. */
  active: boolean;

  /** Start date. */
  startDate: Date;

  /** End date. Null = undefined (no end date). */
  endDate?: Date;

  /** Last date when debts were generated from this schedule. */
  lastGeneratedDate?: Date;

  /** Default template for generated debts. */
  invoiceTemplateId?: UUID;
}
```

---

## Domain: invoice/

### File: `src/entities/invoice/invoice.entity.ts`

```typescript
import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';
import { InvoiceStatus } from '../../enums/invoice-status.enum';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * Invoice / Promissory note (formal representation visible to the client).
 */
export interface Invoice extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** Reference to the client. */
  clientId: UUID;

  /** Reference to the debt. */
  debtId: UUID;

  /** Template used to generate this invoice. */
  invoiceTemplateId?: UUID;

  /** Human-readable number. */
  invoiceNumber: string;

  /** Issue date. */
  issueDate: Date;

  /** Due date. */
  dueDate: Date;

  /** Total amount. */
  totalAmount: Decimal;

  /** `'ARS'` or `'USD'`. */
  currency: Currency;

  /** Status of the invoice. */
  status: InvoiceStatus;

  /** Additional notes. */
  notes?: string;
}
```

### File: `src/entities/invoice/invoice-template.entity.ts`

```typescript
import type { UUID } from '../../types/common';
import type { BaseEntity } from '../../interfaces/base-entity.interface';
import type { SoftDeletable } from '../../interfaces/base-entity.interface';

/**
 * Template configurable by Company.
 */
export interface InvoiceTemplate extends BaseEntity, SoftDeletable {
  /** Reference to the company. */
  companyId: UUID;

  /** Internal template name. */
  name: string;

  /** Subject (email or display). */
  subject: string;

  /** HTML with placeholders (`{{client_name}}`, `{{total_amount}}`, `{{due_date}}`, etc.). */
  bodyHtml: string;

  /** Whether this is the default template. Default: false. */
  isDefault: boolean;

  /** Whether the template is active. Default: true. */
  active: boolean;
}
```

---

## Domain: receipt/

### File: `src/entities/receipt/receipt.entity.ts`

```typescript
import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';
import { InvoiceStatus } from '../../enums/invoice-status.enum';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * Receipt / Promissory note (formal representation visible to the client).
 */
export interface Receipt extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** Reference to the client. */
  clientId: UUID;

  /** Reference to the debt. */
  debtId: UUID;

  /** Template used to generate this receipt. */
  receiptTemplateId?: UUID;

  /** Human-readable number. */
  receiptNumber: string;

  /** Issue date. */
  issueDate: Date;

  /** Due date. */
  dueDate: Date;

  /** Total amount. */
  totalAmount: Decimal;

  /** `'ARS'` or `'USD'`. */
  currency: Currency;

  /** Status of the receipt. */
  status: InvoiceStatus;

  /** Additional notes. */
  notes?: string;
}
```

### File: `src/entities/receipt/receipt-template.entity.ts`

```typescript
import type { UUID } from '../../types/common';
import type { BaseEntity } from '../../interfaces/base-entity.interface';
import type { SoftDeletable } from '../../interfaces/base-entity.interface';

/**
 * Template configurable by Company.
 */
export interface ReceiptTemplate extends BaseEntity, SoftDeletable {
  /** Reference to the company. */
  companyId: UUID;

  /** Internal template name. */
  name: string;

  /** Subject (email or display). */
  subject: string;

  /** HTML with placeholders (`{{client_name}}`, `{{total_amount}}`, `{{due_date}}`, etc.). */
  bodyHtml: string;

  /** Whether this is the default template. Default: false. */
  isDefault: boolean;

  /** Whether the template is active. Default: true. */
  active: boolean;
}
```

---

## Domain: payment/

### File: `src/entities/payment/payment-proof.entity.ts`

```typescript
import type { UUID } from '../../types/common';

/**
 * Proof of payment uploaded by the Client.
 */
export interface PaymentProof {
  /** Primary key identifier. */
  id: UUID;

  /** Reference to the company. */
  companyId: UUID;

  /** Reference to the client. */
  clientId: UUID;

  /** URL of the uploaded proof. */
  fileUrl: string;

  /** Original file name. */
  fileName: string;

  /** MIME type (image/jpeg, application/pdf, etc.). */
  fileType?: string;

  /** Additional notes entered by the client when uploading. */
  notes?: string;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** ID of the Client or System who created this proof. */
  createdBy?: UUID;
}
```

### File: `src/entities/payment/payment-attempt.entity.ts`

```typescript
import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';
import { PaymentAttemptStatus } from '../../enums/payment-attempt-status.enum';

/**
 * Payment attempt (intermediate state).
 */
export interface PaymentAttempt {
  /** Primary key identifier. */
  id: UUID;

  /** Reference to the company. */
  companyId: UUID;

  /** Reference to the client. */
  clientId: UUID;

  /** Reference to the payment proof. */
  paymentProofId: UUID;

  /** The client must indicate which debt the proof corresponds to. */
  debtId: UUID;

  /** Auto-filled if the proof parsing is successful. */
  amount?: Decimal;

  /** `'ARS'` or `'USD'` — Filled if parsing is successful. */
  currency?: Currency;

  /** Status of the payment attempt. */
  status: PaymentAttemptStatus;

  /** Rejection reason (used mainly by Company User when manually rejecting). */
  rejectionReason?: string;

  /** Company user who reviewed. */
  reviewedBy?: UUID;

  /** Timestamp when the attempt was reviewed. */
  reviewedAt?: Date;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** Timestamp when the entity was last updated. */
  updatedAt: Date;
}
```

### File: `src/entities/payment/payment.entity.ts`

```typescript
import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * Confirmed payment (final record).
 */
export interface Payment extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** Reference to the client. */
  clientId: UUID;

  /** Debt to which the payment is applied. */
  debtId: UUID;

  /** Payment origin (if it comes from a proof). */
  paymentAttemptId?: UUID;

  /** Amount paid. */
  amount: Decimal;

  /** `'ARS'` or `'USD'`. */
  currency: Currency;

  /** Effective payment date. */
  paymentDate: Date;

  /** Status of the payment. */
  status: PaymentStatus;

  /** Additional notes. */
  notes?: string;
}
```

---

## Domain: bank/

### File: `src/entities/bank/bank-statement.entity.ts`

```typescript
import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Bank } from '../../enums/bank.enum';
import { BankStatementFormat } from '../../enums/bank-statement-format.enum';
import { BankStatementStatus } from '../../enums/bank-statement-status.enum';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * Uploaded bank statement (process-only).
 */
export interface BankStatement extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** E.g., `'GALICIA'`, `'BBVA'`, `'SANTANDER'`, `'BRUBANK'`, `'MERCADOPAGO'`, etc. */
  bank: Bank;

  /** E.g., `'PDF_TEXT'`, `'PDF_TABLA'`, `'EXCEL'`, `'CSV'`, `'API'` — Defines which parser to use. */
  format: BankStatementFormat;

  /** URL of the uploaded statement. */
  fileUrl: string;

  /** Original file name. */
  fileName: string;

  /** Start of the statement period. */
  periodFrom?: Date;

  /** End of the statement period. */
  periodTo?: Date;

  /** Status of the statement. */
  status: BankStatementStatus;

  /** Number of detected transactions. */
  totalTransactions?: number;

  /** Notes (useful for parsing errors). */
  notes?: string;
}
```

### File: `src/entities/bank/bank-transaction.entity.ts`

```typescript
import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';
import { BankTransactionStatus } from '../../enums/bank-transaction-status.enum';

/**
 * Parsed transactions from the statement.
 */
export interface BankTransaction {
  /** Primary key identifier. */
  id: UUID;

  /** Reference to the bank statement. */
  bankStatementId: UUID;

  /** Reference to the company. */
  companyId: UUID;

  /** Client detected automatically or manually from the transfer data. */
  clientId?: UUID;

  /** Transaction date. */
  transactionDate: Date;

  /** Amount. */
  amount: Decimal;

  /** `'ARS'` or `'USD'`. */
  currency: Currency;

  /** Full bank description. */
  description: string;

  /** Reference / operation / CBU / alias number. */
  reference?: string;

  /** Balance after. */
  balanceAfter?: Decimal;

  /** Status of the transaction. */
  status: BankTransactionStatus;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** Timestamp when the entity was last updated. */
  updatedAt: Date;
}
```

### File: `src/entities/bank/payment-match.entity.ts`

```typescript
import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { MatchMethod } from '../../enums/match-method.enum';

/**
 * Record of successful matching.
 */
export interface PaymentMatch {
  /** Primary key identifier. */
  id: UUID;

  /** Reference to the payment attempt. */
  paymentAttemptId: UUID;

  /** Reference to the bank transaction. */
  bankTransactionId: UUID;

  /** Reference to the company. */
  companyId: UUID;

  /** Amount used for the match (allows partial matches). */
  matchedAmount: Decimal;

  /** Automatic match score (0.00 - 100.00). */
  confidenceScore?: Decimal;

  /** `'AUTOMATIC'` or `'MANUAL'`. */
  matchedBy: MatchMethod;

  /** Timestamp when the match was made. */
  matchedAt: Date;

  /** Match notes (e.g., "match by amount + reference"). */
  notes?: string;
}
```

---

## Domain: notification/

### File: `src/entities/notification/notification.entity.ts`

```typescript
import type { UUID } from '../../types/common';
import { NotificationType } from '../../enums/notification-type.enum';
import { NotificationChannel } from '../../enums/notification-channel.enum';
import { NotificationStatus } from '../../enums/notification-status.enum';

/**
 * Notification sent to a user or client.
 */
export interface Notification {
  /** Primary key identifier. */
  id: UUID;

  /** Reference to the company. */
  companyId: UUID;

  /** Reference to the client. */
  clientId?: UUID;

  /** Recipient user (Company or End User). */
  userId?: UUID;

  /** Template used (if applicable). */
  notificationTemplateId?: UUID;

  /** Destination email / phone / WhatsApp. */
  to: string;

  /** Sender (e.g., no-reply@conciliador.app). */
  from?: string;

  /** Type of notification. */
  type: NotificationType;

  /** Final subject. */
  subject: string;

  /** Final content (HTML or text). */
  body: string;

  /** Delivery channel. */
  channel: NotificationChannel;

  /** Delivery status. */
  status: NotificationStatus;

  /** Timestamp when the notification was sent. */
  sentAt?: Date;

  /** Timestamp when the entity was created. */
  createdAt: Date;
}
```

### File: `src/entities/notification/notification-template.entity.ts`

```typescript
import type { UUID } from '../../types/common';
import { NotificationType } from '../../enums/notification-type.enum';
import { NotificationChannel } from '../../enums/notification-channel.enum';
import type { BaseEntity } from '../../interfaces/base-entity.interface';

/**
 * Template for notifications.
 */
export interface NotificationTemplate extends BaseEntity {
  /** Reference to the company. */
  companyId: UUID;

  /** Internal name. */
  name: string;

  /** Same as `Notification.type`. */
  type: NotificationType;

  /** Subject with placeholders. */
  subject: string;

  /** Plain text version (for WhatsApp/SMS). */
  bodyPlain?: string;

  /** HTML version (for email). */
  bodyHtml: string;

  /** Delivery channel. */
  channel: NotificationChannel;

  /** Whether this is the default template. Default: false. */
  isDefault: boolean;

  /** Whether the template is active. Default: true. */
  active: boolean;
}
```

---

## Domain: summary/

### File: `src/entities/summary/client-debt-summary.entity.ts`

```typescript
import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';
import { ClientDebtSummaryStatus } from '../../enums/client-debt-summary-status.enum';

/**
 * Current balance, total debt, etc. (can be a materialized view).
 */
export interface ClientDebtSummary {
  /** Primary key identifier. */
  id: UUID;

  /** Reference to the company. */
  companyId: UUID;

  /** Reference to the client. */
  clientId: UUID;

  /** Total debt amount. */
  totalDebt: Decimal;

  /** Total paid amount. */
  totalPaid: Decimal;

  /** Balance. */
  balance: Decimal;

  /** `'ARS'` or `'USD'`. */
  currency: Currency;

  /** Reference to the last confirmed payment. */
  lastPaymentId?: UUID;

  /** Reference to the last generated debt. */
  lastDebtId?: UUID;

  /** Date of the last payment. */
  lastPaymentDate?: Date;

  /** Date of the last debt. */
  lastDebtDate?: Date;

  /** Status of the summary. */
  status: ClientDebtSummaryStatus;

  /** Timestamp when the entity was last updated. */
  updatedAt: Date;
}
```

### File: `src/entities/summary/company-monthly-summary.entity.ts`

```typescript
import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';

/**
 * For SaaS billing.
 */
export interface CompanyMonthlySummary {
  /** Primary key identifier. */
  id: UUID;

  /** Reference to the company. */
  companyId: UUID;

  /** Year. */
  year: number;

  /** Month (1-12). */
  month: number;

  /** Total amount of generated debts. */
  totalDebtsGenerated: Decimal;

  /** Total amount of confirmed payments. */
  totalPaymentsReceived: Decimal;

  /** Commission earned by the platform. */
  commissionEarned: Decimal;

  /** `'ARS'` or `'USD'`. */
  currency: Currency;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** Timestamp when the entity was last updated. */
  updatedAt: Date;
}
```

---

## File Summary

| # | File Path | Entity | Extends |
|---|---|---|---|
| 1 | `src/entities/company/company.entity.ts` | `Company` | — |
| 2 | `src/entities/company/company-plan.entity.ts` | `CompanyPlan` | — |
| 3 | `src/entities/company/user.entity.ts` | `User` | — |
| 4 | `src/entities/company/role.entity.ts` | `Role` | — |
| 5 | `src/entities/company/company-user.entity.ts` | `CompanyUser` | — |
| 6 | `src/entities/client/client.entity.ts` | `Client` | — |
| 7 | `src/entities/debt/debt.entity.ts` | `Debt` | `BaseEntity` |
| 8 | `src/entities/debt/debt-schedule.entity.ts` | `DebtSchedule` | `BaseEntity`, `SoftDeletable` |
| 9 | `src/entities/invoice/invoice.entity.ts` | `Invoice` | `BaseEntity` |
| 10 | `src/entities/invoice/invoice-template.entity.ts` | `InvoiceTemplate` | `BaseEntity`, `SoftDeletable` |
| 11 | `src/entities/receipt/receipt.entity.ts` | `Receipt` | `BaseEntity` |
| 12 | `src/entities/receipt/receipt-template.entity.ts` | `ReceiptTemplate` | `BaseEntity`, `SoftDeletable` |
| 13 | `src/entities/payment/payment-proof.entity.ts` | `PaymentProof` | — |
| 14 | `src/entities/payment/payment-attempt.entity.ts` | `PaymentAttempt` | — |
| 15 | `src/entities/payment/payment.entity.ts` | `Payment` | `BaseEntity` |
| 16 | `src/entities/bank/bank-statement.entity.ts` | `BankStatement` | `BaseEntity` |
| 17 | `src/entities/bank/bank-transaction.entity.ts` | `BankTransaction` | — |
| 18 | `src/entities/bank/payment-match.entity.ts` | `PaymentMatch` | — |
| 19 | `src/entities/notification/notification.entity.ts` | `Notification` | — |
| 20 | `src/entities/notification/notification-template.entity.ts` | `NotificationTemplate` | `BaseEntity` |
| 21 | `src/entities/summary/client-debt-summary.entity.ts` | `ClientDebtSummary` | — |
| 22 | `src/entities/summary/company-monthly-summary.entity.ts` | `CompanyMonthlySummary` | — |

**Note:** `Receipt` and `ReceiptTemplate` are structurally identical to `Invoice` / `InvoiceTemplate` per architecture, but kept as separate entities in the `receipt/` domain.

---

## Build Verification

After all files are created, run:

```bash
npm run build
```

or

```bash
npx tsc --noEmit
```

All 22 files must compile without errors.
