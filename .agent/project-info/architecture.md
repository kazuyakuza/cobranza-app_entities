# Architecture

## System Overview

The **Entities Library** (`@conciliador/entities`) is a standalone TypeScript package that serves as the Single Source of Truth for data models across the entire Conciliador de Pagos ecosystem. It is not a deployable service — it is a published npm package consumed by multiple projects.

```
┌─────────────────────────────────────────────────────┐
│                  @conciliador/entities              │
│              (This Repository — SSOT)               │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ entities/ │  │  enums/  │  │  types/ &         │  │
│  │           │  │          │  │  interfaces/      │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ npm package
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
   ┌────────────┐ ┌─────────┐ ┌──────────┐
   │  NestJS    │ │ Angular │ │  Future  │
   │  Backend   │ │  Front  │ │ Services │
   │  Services  │ │   App   │ │ (Mobile) │
   └────────────┘ └─────────┘ └──────────┘
```

## Architecture Principles

| Principle | Description |
|-----------|-------------|
| **TypeScript First** | All definitions use modern TypeScript. No runtime logic — only interfaces, types, and enums. |
| **Multi-Tenancy Ready** | Every major entity includes `companyId` to enforce tenant isolation at the type level. |
| **Audit & Soft Delete** | Standard fields (`createdAt`, `updatedAt`, `deletedAt`, `createdBy`, `updatedBy`) on all entities that require them. |
| **Extensibility** | Entities are designed for extension in consuming projects via inheritance or composition — never require modifying the library. |
| **Consistency** | Clear naming conventions, detailed JSDoc comments, and organized barrel exports. |
| **No Runtime Logic** | The library exports only type definitions and enums. No services, no side effects, no network calls. |

## Package Structure

```
src/
├── entities/
│   ├── index.ts                    # Main barrel export
│   ├── company/                    # Company entity group
│   │   ├── company.entity.ts
│   │   ├── company-plan.entity.ts
│   │   ├── user.entity.ts
│   │   ├── role.entity.ts
│   │   └── company-user.entity.ts
│   ├── client/                     # Client entity group
│   │   └── client.entity.ts
│   ├── debt/                       # Debt entity group
│   │   ├── debt.entity.ts
│   │   └── debt-schedule.entity.ts
│   ├── payment/                    # Payment entity group
│   │   ├── payment-proof.entity.ts
│   │   ├── payment-attempt.entity.ts
│   │   └── payment.entity.ts
│   ├── bank/                       # Banking entity group
│   │   ├── bank-statement.entity.ts
│   │   ├── bank-transaction.entity.ts
│   │   └── payment-match.entity.ts
│   ├── invoice/                    # Invoice entity group
│   │   ├── invoice.entity.ts
│   │   └── invoice-template.entity.ts
│   ├── receipt/                    # Receipt entity group
│   │   ├── receipt.entity.ts
│   │   └── receipt-template.entity.ts
│   ├── notification/               # Notification entity group
│   │   ├── notification.entity.ts
│   │   └── notification-template.entity.ts
│   └── summary/                     # Summary entity group
│       ├── client-debt-summary.entity.ts
│       └── company-monthly-summary.entity.ts
├── enums/
│   ├── index.ts                    # Barrel export for enums
│   ├── debt-status.enum.ts
│   ├── payment-status.enum.ts
│   ├── payment-attempt-status.enum.ts
│   ├── bank-statement-status.enum.ts
│   ├── bank-transaction-status.enum.ts
│   ├── notification-type.enum.ts
│   ├── notification-channel.enum.ts
│   ├── currency.enum.ts
│   ├── debt-schedule-frequency.enum.ts
│   ├── calculation-type.enum.ts
│   └── match-method.enum.ts
├── types/
│   ├── index.ts                    # Barrel export for types
│   └── common.ts                   # Shared types (UUID, Money, etc.)
├── interfaces/
│   ├── index.ts                    # Barrel export for interfaces
│   └── base-entity.interface.ts    # Base interface with audit fields
└── index.ts                        # Root barrel export
```

## Design Patterns

### Barrel Exports

Every folder contains an `index.ts` barrel file that re-exports all public symbols. Consumers import from the root:

```typescript
import { Client, DebtStatus } from '@conciliador/entities';
```

### Base Entity Interface

All entities that require audit fields implement `BaseEntity`:

```typescript
interface BaseEntity {
  id: string;          // UUID
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;  // UUID (User)
  updatedBy?: string;  // UUID (User)
}
```

### Soft-Deletable Interface

Entities that support soft deletion implement `SoftDeletable`:

```typescript
interface SoftDeletable {
  deletedAt?: Date;
  deletedBy?: string;  // UUID (User)
}
```

### Entity Grouping

Entities are organized by domain concern into subdirectories under `src/entities/`:

| Group | Directory | Entities |
|-------|-----------|----------|
| Core & Multi-Tenancy | `company/` | `Company`, `CompanyPlan`, `User`, `Role`, `CompanyUser` |
| Clients | `client/` | `Client` |
| Debts | `debt/` | `Debt`, `DebtSchedule` |
| Payments | `payment/` | `PaymentProof`, `PaymentAttempt`, `Payment` |
| Banking | `bank/` | `BankStatement`, `BankTransaction`, `PaymentMatch` |
| Invoicing | `invoice/` | `Invoice`, `InvoiceTemplate` |
| Receipts | `receipt/` | `Receipt`, `ReceiptTemplate` |
| Notifications | `notification/` | `Notification`, `NotificationTemplate` |
| Summaries | `summary/` | `ClientDebtSummary`, `CompanyMonthlySummary` |

### Enum Pattern

Each enum lives in its own file under `src/enums/` and follows TypeScript const enum or union type pattern:

```typescript
export enum DebtStatus {
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}
```

## Multi-Tenancy Architecture

Every major entity includes a `companyId` field referencing `Company.id`. This design:

- Enforces tenant isolation at the data model level.
- Allows consuming services to implement row-level security using the `companyId` field.
- Enables querying all entities scoped to a specific tenant.

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Entity files | kebab-case, `.entity.ts` suffix | `payment-attempt.entity.ts` |
| Enum files | kebab-case, `.enum.ts` suffix | `debt-status.enum.ts` |
| Type files | kebab-case, `.ts` suffix | `common.ts` |
| Interface files | kebab-case, `.interface.ts` or `.entity.ts` | `base-entity.interface.ts` |
| Barrel files | `index.ts` | `entities/index.ts` |
| Entity names | PascalCase, singular | `PaymentAttempt` |
| Property names | camelCase | `companyId`, `totalAmount` |
| Enum values | UPPER_SNAKE_CASE | `PARTIALLY_PAID` |
| Primary keys | `id` (UUID) | `id: string` |
| Foreign keys | camelCase with `Id` suffix | `companyId`, `clientId` |

## Critical Paths

### Import Path

Consumer → `npm install @conciliador/entities` → barrel re-exports → individual entity/enum/type.

### Build Path

Source (`src/`) → TypeScript compiler (`tsc`) → declaration files (`.d.ts`) + JavaScript → published npm package.

### Update Path

1. Developer modifies entity in this library.
2. Version bump (semver).
3. Publish to npm registry.
4. Consumers update dependency version.
5. Type-safe compilation catches any breaking changes.

## Related Files

- [Brief](./brief.md) — Core requirements and project goals.
- [Product](./product.md) — Product definition and user experience.
- [Tech](./tech.md) — Technology stack and development setup.
- [Context](./context.md) — Current work focus and next steps.
- [Data Model Brief](./data-model-brief.md) — Detailed entity definitions and roles.
- [Entities Definition](./entities-definition.csv) — Full property definitions.
- [Relationship Diagram](./entities-relationship-diagram-overview.md) — Entity relationships.