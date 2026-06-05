# Plan: Organization & Exports — Populate All Barrel Exports

**Date**: 2026-06-05
**Task**: Task 5 — Populate domain barrel files, entities barrel, and root index exports.
**Auto-approved**: Yes

---

## Overview

Populate all barrel (`index.ts`) files in `src/entities/` and update `src/index.ts` to provide clean re-exports of all domain entities. After changes, verify the project builds successfully.

---

## Step 1: Populate Domain Barrel Files

Each domain barrel must export its entities using named `export` statements.

### 1.1 `src/entities/company/index.ts`

```typescript
export { Company } from './company.entity';
export { CompanyPlan } from './company-plan.entity';
export { User } from './user.entity';
export { Role } from './role.entity';
export { CompanyUser } from './company-user.entity';
```

### 1.2 `src/entities/client/index.ts`

```typescript
export { Client } from './client.entity';
```

### 1.3 `src/entities/debt/index.ts`

```typescript
export { Debt } from './debt.entity';
export { DebtSchedule } from './debt-schedule.entity';
```

### 1.4 `src/entities/invoice/index.ts`

```typescript
export { Invoice } from './invoice.entity';
export { InvoiceTemplate } from './invoice-template.entity';
```

### 1.5 `src/entities/receipt/index.ts`

```typescript
export { Receipt } from './receipt.entity';
export { ReceiptTemplate } from './receipt-template.entity';
```

### 1.6 `src/entities/payment/index.ts`

```typescript
export { PaymentProof } from './payment-proof.entity';
export { PaymentAttempt } from './payment-attempt.entity';
export { Payment } from './payment.entity';
```

### 1.7 `src/entities/bank/index.ts`

```typescript
export { BankStatement } from './bank-statement.entity';
export { BankTransaction } from './bank-transaction.entity';
export { PaymentMatch } from './payment-match.entity';
```

### 1.8 `src/entities/notification/index.ts`

```typescript
export { Notification } from './notification.entity';
export { NotificationTemplate } from './notification-template.entity';
```

### 1.9 `src/entities/summary/index.ts`

```typescript
export { ClientDebtSummary } from './client-debt-summary.entity';
export { CompanyMonthlySummary } from './company-monthly-summary.entity';
```

---

## Step 2: Populate Entities Barrel

### 2.1 `src/entities/index.ts`

```typescript
export * from './company';
export * from './client';
export * from './debt';
export * from './invoice';
export * from './receipt';
export * from './payment';
export * from './bank';
export * from './notification';
export * from './summary';
```

---

## Step 3: Update Root Index

### 3.1 `src/index.ts`

Append a re-export for entities:

```typescript
export * from './enums';
export * from './interfaces';
export * from './types';
export * from './entities';
```

---

## Step 4: Build Verification

Run the project's build command and confirm it completes without errors.

```bash
npm run build
```

Expected outcome: build succeeds with zero errors.

---

## Step 5: Final Review Checklist

- [ ] All 9 domain barrel files export their entities correctly.
- [ ] `src/entities/index.ts` re-exports all 9 domain barrels.
- [ ] `src/index.ts` includes the new `entities` re-export.
- [ ] `npm run build` passes with no errors.
- [ ] JSDoc comments remain intact (verified in prior task).

---

## Notes

- Do **not** modify entity files themselves; only update barrel `index.ts` files.
- Preserve existing exports in `src/enums/index.ts`, `src/types/index.ts`, and `src/interfaces/index.ts`.
- No new dependencies are required.
