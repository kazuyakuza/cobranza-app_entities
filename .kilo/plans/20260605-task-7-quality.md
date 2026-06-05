# Plan: Task 7 — Quality & Testing

## 1. Goal
Add runtime tests for enums, types, interfaces, and entities; verify full TypeScript type checking passes; and ensure the codebase has zero circular dependencies.

## 2. Tooling Decision
**Vitest** is chosen over Jest.

- Native ESM support (aligns with `"module": "ES2022"`).
- Built-in TypeScript support via esbuild (no `ts-jest` or Babel needed).
- Faster cold-start and watch mode.
- Minimal configuration (`defineConfig` + `include` pattern).

**Circular dependency checker**: `dpdm` (Dependency Dumper for Modules). It supports ESM/TypeScript out of the box and has a lightweight CLI.

## 3. Dependencies & Scripts

### DevDependencies to add
```json
{
  "vitest": "^1.6.0",
  "dpdm": "^3.14.0"
}
```

### Package.json script additions
```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:circular": "dpdm --no-warning --no-tree src/index.ts"
}
```

## 4. TypeScript Configuration

Create `tsconfig.build.json` so tests are type-checked by the root `tsconfig.json` but excluded from the `dist/` build output.

**`tsconfig.build.json`**:
```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "dist", "**/__tests__", "**/*.test.ts"]
}
```

Update `package.json` build script:
```json
"build": "tsc -p tsconfig.build.json"
```

## 5. Vitest Configuration

**`vitest.config.ts`** (project root):
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    include: ['src/__tests__/**/*.test.ts'],
    environment: 'node',
  },
});
```

## 6. Test File Structure

All test files live under `src/__tests__/` so they are covered by `tsconfig.json` `include: ["src"]`.

```
src/__tests__/
  enums/
    group-a.test.ts
    group-b.test.ts
  types.test.ts
  interfaces.test.ts
  entities/
    company-and-client.test.ts
    debt-and-payment.test.ts
    bank-and-invoice.test.ts
    notification-and-summary.test.ts
```

Every test file must stay **≤ 100 lines**.

## 7. Exact Test Code

### 7.1 Enum value tests

**`src/__tests__/enums/group-a.test.ts`** (covers 10 enums):
```ts
import { describe, it, expect } from 'vitest';
import { Bank } from '../../enums/bank.enum';
import { BankStatementFormat } from '../../enums/bank-statement-format.enum';
import { BankStatementStatus } from '../../enums/bank-statement-status.enum';
import { BankTransactionStatus } from '../../enums/bank-transaction-status.enum';
import { Currency } from '../../enums/currency.enum';
import { DebtStatus } from '../../enums/debt-status.enum';
import { InvoiceStatus } from '../../enums/invoice-status.enum';
import { MatchMethod } from '../../enums/match-method.enum';
import { PaymentAttemptStatus } from '../../enums/payment-attempt-status.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';

describe('Enum group A values', () => {
  it('Bank', () => {
    expect(Bank.GALICIA).toBe('GALICIA');
    expect(Bank.BBVA).toBe('BBVA');
    expect(Bank.SANTANDER).toBe('SANTANDER');
    expect(Bank.BRUBANK).toBe('BRUBANK');
    expect(Bank.MERCADOPAGO).toBe('MERCADOPAGO');
  });

  it('BankStatementFormat', () => {
    expect(BankStatementFormat.PDF_TEXT).toBe('PDF_TEXT');
    expect(BankStatementFormat.PDF_TABLA).toBe('PDF_TABLA');
    expect(BankStatementFormat.EXCEL).toBe('EXCEL');
    expect(BankStatementFormat.CSV).toBe('CSV');
    expect(BankStatementFormat.API).toBe('API');
  });

  it('BankStatementStatus', () => {
    expect(BankStatementStatus.UPLOADED).toBe('UPLOADED');
    expect(BankStatementStatus.PARSING).toBe('PARSING');
    expect(BankStatementStatus.PROCESSED).toBe('PROCESSED');
    expect(BankStatementStatus.FAILED).toBe('FAILED');
    expect(BankStatementStatus.MANUALLY_REVIEWED).toBe('MANUALLY_REVIEWED');
  });

  it('BankTransactionStatus', () => {
    expect(BankTransactionStatus.UNMATCHED).toBe('UNMATCHED');
    expect(BankTransactionStatus.MATCHED).toBe('MATCHED');
    expect(BankTransactionStatus.IGNORED).toBe('IGNORED');
  });

  it('Currency', () => {
    expect(Currency.ARS).toBe('ARS');
    expect(Currency.USD).toBe('USD');
  });

  it('DebtStatus', () => {
    expect(DebtStatus.PENDING).toBe('PENDING');
    expect(DebtStatus.OVERDUE).toBe('OVERDUE');
    expect(DebtStatus.PARTIALLY_PAID).toBe('PARTIALLY_PAID');
    expect(DebtStatus.PAID).toBe('PAID');
    expect(DebtStatus.CANCELLED).toBe('CANCELLED');
  });

  it('InvoiceStatus', () => {
    expect(InvoiceStatus.PENDING).toBe('PENDING');
    expect(InvoiceStatus.PAID).toBe('PAID');
    expect(InvoiceStatus.PARTIALLY_PAID).toBe('PARTIALLY_PAID');
    expect(InvoiceStatus.OVERDUE).toBe('OVERDUE');
    expect(InvoiceStatus.CANCELLED).toBe('CANCELLED');
  });

  it('MatchMethod', () => {
    expect(MatchMethod.AUTOMATIC).toBe('AUTOMATIC');
    expect(MatchMethod.MANUAL).toBe('MANUAL');
  });

  it('PaymentAttemptStatus', () => {
    expect(PaymentAttemptStatus.UPLOADED).toBe('UPLOADED');
    expect(PaymentAttemptStatus.PARSE_FAILED).toBe('PARSE_FAILED');
    expect(PaymentAttemptStatus.PENDING_VALIDATION).toBe('PENDING_VALIDATION');
    expect(PaymentAttemptStatus.MATCHED).toBe('MATCHED');
    expect(PaymentAttemptStatus.APPROVED).toBe('APPROVED');
    expect(PaymentAttemptStatus.REJECTED).toBe('REJECTED');
  });

  it('PaymentStatus', () => {
    expect(PaymentStatus.CONFIRMED).toBe('CONFIRMED');
    expect(PaymentStatus.REFUNDED).toBe('REFUNDED');
  });
});
```

**`src/__tests__/enums/group-b.test.ts`** (covers 6 enums):
```ts
import { describe, it, expect } from 'vitest';
import { CalculationType } from '../../enums/calculation-type.enum';
import { ClientDebtSummaryStatus } from '../../enums/client-debt-summary-status.enum';
import { DebtScheduleFrequency } from '../../enums/debt-schedule-frequency.enum';
import { NotificationChannel } from '../../enums/notification-channel.enum';
import { NotificationStatus } from '../../enums/notification-status.enum';
import { NotificationType } from '../../enums/notification-type.enum';

describe('Enum group B values', () => {
  it('CalculationType', () => {
    expect(CalculationType.FIXED).toBe('FIXED');
    expect(CalculationType.FORMULA).toBe('FORMULA');
  });

  it('ClientDebtSummaryStatus', () => {
    expect(ClientDebtSummaryStatus.NORMAL).toBe('NORMAL');
    expect(ClientDebtSummaryStatus.OVERDUE).toBe('OVERDUE');
    expect(ClientDebtSummaryStatus.INACTIVE).toBe('INACTIVE');
  });

  it('DebtScheduleFrequency', () => {
    expect(DebtScheduleFrequency.WEEKLY).toBe('WEEKLY');
    expect(DebtScheduleFrequency.MONTHLY).toBe('MONTHLY');
    expect(DebtScheduleFrequency.BIMONTHLY).toBe('BIMONTHLY');
    expect(DebtScheduleFrequency.QUARTERLY).toBe('QUARTERLY');
    expect(DebtScheduleFrequency.YEARLY).toBe('YEARLY');
  });

  it('NotificationChannel', () => {
    expect(NotificationChannel.EMAIL).toBe('EMAIL');
    expect(NotificationChannel.WHATSAPP).toBe('WHATSAPP');
    expect(NotificationChannel.SMS).toBe('SMS');
  });

  it('NotificationStatus', () => {
    expect(NotificationStatus.PENDING).toBe('PENDING');
    expect(NotificationStatus.SENT).toBe('SENT');
    expect(NotificationStatus.FAILED).toBe('FAILED');
    expect(NotificationStatus.CANCELLED).toBe('CANCELLED');
  });

  it('NotificationType', () => {
    expect(NotificationType.PAYMENT_UPLOADED).toBe('PAYMENT_UPLOADED');
    expect(NotificationType.PAYMENT_APPROVED).toBe('PAYMENT_APPROVED');
    expect(NotificationType.PAYMENT_REJECTED).toBe('PAYMENT_REJECTED');
    expect(NotificationType.DEBT_OVERDUE).toBe('DEBT_OVERDUE');
  });
});
```

### 7.2 Type compatibility tests

**`src/__tests__/types.test.ts`**:
```ts
import { describe, it, expect } from 'vitest';
import type { UUID, Money, Decimal, JsonData, DateString } from '../types/common';

describe('Common type aliases', () => {
  it('UUID accepts string values', () => {
    const id: UUID = '550e8400-e29b-41d4-a716-446655440000';
    expect(typeof id).toBe('string');
  });

  it('Money accepts numeric strings', () => {
    const amount: Money = '1500.50';
    expect(typeof amount).toBe('string');
  });

  it('Decimal accepts precision strings', () => {
    const rate: Decimal = '0.0050';
    expect(typeof rate).toBe('string');
  });

  it('JsonData accepts record objects', () => {
    const data: JsonData = { key: 'value', count: 42 };
    expect(data.key).toBe('value');
    expect(data.count).toBe(42);
  });

  it('DateString accepts ISO date strings', () => {
    const date: DateString = '2026-01-01';
    expect(typeof date).toBe('string');
  });
});
```

### 7.3 Interface structure tests

**`src/__tests__/interfaces.test.ts`**:
```ts
import { describe, it, expect } from 'vitest';
import type { BaseEntity, SoftDeletable } from '../interfaces/base-entity.interface';

describe('BaseEntity interface', () => {
  it('accepts a valid base entity object at compile time and runtime', () => {
    const entity = {
      id: 'entity-uuid',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
      createdBy: 'user-uuid',
      updatedBy: 'user-uuid',
    } satisfies BaseEntity;

    expect(entity.id).toBe('entity-uuid');
    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.updatedBy).toBe('user-uuid');
  });
});

describe('SoftDeletable interface', () => {
  it('accepts a valid soft-deletable object', () => {
    const deletable = {
      deletedAt: new Date('2026-01-03'),
      deletedBy: 'admin-uuid',
    } satisfies SoftDeletable;

    expect(deletable.deletedAt).toBeInstanceOf(Date);
    expect(deletable.deletedBy).toBe('admin-uuid');
  });
});
```

### 7.4 Entity structure & type-compatibility tests

**`src/__tests__/entities/company-and-client.test.ts`**:
```ts
import { describe, it, expect } from 'vitest';
import type { Company } from '../../entities/company/company.entity';
import type { Client } from '../../entities/client/client.entity';

describe('Company entity', () => {
  it('accepts a valid company object with required fields', () => {
    const company = {
      id: 'comp-uuid',
      friendlyUrl: 'acme-servicios',
      name: 'Acme Servicios',
      contact: 'contact@acme.com',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies Company;

    expect(company.friendlyUrl).toBe('acme-servicios');
    expect(company.active).toBe(true);
  });
});

describe('Client entity', () => {
  it('accepts a valid client object with required fields', () => {
    const client = {
      id: 'client-uuid',
      companyId: 'comp-uuid',
      clientCode: 'CLI-00042',
      fullName: 'Juan Perez',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies Client;

    expect(client.clientCode).toBe('CLI-00042');
    expect(client.fullName).toBe('Juan Perez');
  });
});
```

**`src/__tests__/entities/debt-and-payment.test.ts`**:
```ts
import { describe, it, expect } from 'vitest';
import type { Debt } from '../../entities/debt/debt.entity';
import type { Payment } from '../../entities/payment/payment.entity';
import { DebtStatus } from '../../enums/debt-status.enum';
import { Currency } from '../../enums/currency.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';

describe('Debt entity', () => {
  it('accepts a valid debt object with required fields', () => {
    const debt = {
      id: 'debt-uuid',
      companyId: 'comp-uuid',
      clientId: 'client-uuid',
      debtCode: 'DEUD-2026-0042',
      description: 'Test debt',
      totalAmount: '1000.00',
      currency: Currency.ARS,
      dueDate: new Date('2026-12-31'),
      issueDate: new Date('2026-01-01'),
      status: DebtStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies Debt;

    expect(debt.currency).toBe(Currency.ARS);
    expect(debt.status).toBe(DebtStatus.PENDING);
  });
});

describe('Payment entity', () => {
  it('accepts a valid payment object with required fields', () => {
    const payment = {
      id: 'pay-uuid',
      companyId: 'comp-uuid',
      clientId: 'client-uuid',
      debtId: 'debt-uuid',
      amount: '500.00',
      currency: Currency.USD,
      paymentDate: new Date('2026-06-01'),
      status: PaymentStatus.CONFIRMED,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies Payment;

    expect(payment.amount).toBe('500.00');
    expect(payment.status).toBe(PaymentStatus.CONFIRMED);
  });
});
```

**`src/__tests__/entities/bank-and-invoice.test.ts`**:
```ts
import { describe, it, expect } from 'vitest';
import type { BankStatement } from '../../entities/bank/bank-statement.entity';
import type { Invoice } from '../../entities/invoice/invoice.entity';
import { Bank } from '../../enums/bank.enum';
import { BankStatementFormat } from '../../enums/bank-statement-format.enum';
import { BankStatementStatus } from '../../enums/bank-statement-status.enum';
import { InvoiceStatus } from '../../enums/invoice-status.enum';

describe('BankStatement entity', () => {
  it('accepts a valid bank statement object', () => {
    const statement = {
      id: 'stmt-uuid',
      companyId: 'comp-uuid',
      bank: Bank.GALICIA,
      format: BankStatementFormat.CSV,
      fileUrl: 'https://example.com/stmt.csv',
      fileName: 'stmt.csv',
      status: BankStatementStatus.UPLOADED,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies BankStatement;

    expect(statement.bank).toBe(Bank.GALICIA);
    expect(statement.status).toBe(BankStatementStatus.UPLOADED);
  });
});

describe('Invoice entity', () => {
  it('accepts a valid invoice object', () => {
    const invoice = {
      id: 'inv-uuid',
      companyId: 'comp-uuid',
      clientId: 'client-uuid',
      debtId: 'debt-uuid',
      invoiceNumber: 'A-0001-00000001',
      issueDate: new Date(),
      dueDate: new Date(),
      totalAmount: '2000.00',
      status: InvoiceStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies Invoice;

    expect(invoice.invoiceNumber).toBe('A-0001-00000001');
    expect(invoice.status).toBe(InvoiceStatus.PENDING);
  });
});
```

**`src/__tests__/entities/notification-and-summary.test.ts`**:
```ts
import { describe, it, expect } from 'vitest';
import type { Notification } from '../../entities/notification/notification.entity';
import type { ClientDebtSummary } from '../../entities/summary/client-debt-summary.entity';
import { NotificationType } from '../../enums/notification-type.enum';
import { NotificationChannel } from '../../enums/notification-channel.enum';
import { NotificationStatus } from '../../enums/notification-status.enum';
import { ClientDebtSummaryStatus } from '../../enums/client-debt-summary-status.enum';

describe('Notification entity', () => {
  it('accepts a valid notification object', () => {
    const notification = {
      id: 'notif-uuid',
      companyId: 'comp-uuid',
      to: 'client@example.com',
      type: NotificationType.PAYMENT_UPLOADED,
      subject: 'Payment received',
      body: '<p>Thank you</p>',
      channel: NotificationChannel.EMAIL,
      status: NotificationStatus.SENT,
      createdAt: new Date(),
    } satisfies Notification;

    expect(notification.channel).toBe(NotificationChannel.EMAIL);
    expect(notification.status).toBe(NotificationStatus.SENT);
  });
});

describe('ClientDebtSummary entity', () => {
  it('accepts a valid summary object', () => {
    const summary = {
      id: 'sum-uuid',
      companyId: 'comp-uuid',
      clientId: 'client-uuid',
      status: ClientDebtSummaryStatus.NORMAL,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies ClientDebtSummary;

    expect(summary.status).toBe(ClientDebtSummaryStatus.NORMAL);
  });
});
```

## 8. Circular Dependency Check

Add the script `test:circular` as shown in section 3.

**Command**: `npm run test:circular`

**Expected result**: `dpdm` exits with code `0` and prints nothing (because `--no-tree` suppresses output when `--no-warning` is also set and there are no circular dependencies). If circulars exist, `dpdm` lists them and exits non-zero, causing CI/script failure.

## 9. Build Verification Steps

After all code changes are in place, run the following commands in order:

1. `npm install` — install new devDependencies.
2. `npm run typecheck` — ensure full project (src + tests) compiles under strict mode.
3. `npm run test:circular` — confirm zero circular dependencies.
4. `npm run test` — run the Vitest suite once (headless).
5. `npm run build` — verify `dist/` is generated and does **not** contain `__tests__/`.

## 10. Atomic Implementation Steps

| Step | Action | File(s) / Command |
|---|---|---|
| 1 | Install devDependencies | `npm install -D vitest@^1.6.0 dpdm@^3.14.0` |
| 2 | Create build TS config | `tsconfig.build.json` |
| 3 | Update `package.json` scripts and deps | `package.json` |
| 4 | Create Vitest config | `vitest.config.ts` |
| 5 | Create test directories | `src/__tests__/enums/`, `src/__tests__/entities/` |
| 6 | Create enum tests | `src/__tests__/enums/group-a.test.ts`, `group-b.test.ts` |
| 7 | Create type tests | `src/__tests__/types.test.ts` |
| 8 | Create interface tests | `src/__tests__/interfaces.test.ts` |
| 9 | Create entity tests | `src/__tests__/entities/company-and-client.test.ts`, `debt-and-payment.test.ts`, `bank-and-invoice.test.ts`, `notification-and-summary.test.ts` |
| 10 | Run circular check | `npm run test:circular` |
| 11 | Run typecheck | `npm run typecheck` |
| 12 | Run tests | `npm run test` |
| 13 | Run build | `npm run build` |
| 14 | Verify dist has no tests | Check `dist/` does not contain `__tests__` |
