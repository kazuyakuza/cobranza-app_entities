# @cobranza-app/entities — Cobranza App Entities Library

Central data model definitions (entities, enums, types) for the **Cobranza App** system — a multi-tenant SaaS for debt management and payment reconciliation. This package serves as the **Single Source of Truth (SSOT)** for all data models across the ecosystem.

**Attention AI Agents:** Before making any changes, you **must** read and adhere to the guidelines outlined in [`AGENTS.md`](AGENTS.md). This file contains critical information about the project's workflow, rules, and architectural standards.

## About

The primary goal of this repository is to provide a clean, structured, and authoritative source of truth for all data models in the Cobranza App platform.

By centralizing entity definitions in one versioned TypeScript package, we ensure consistency across:

- NestJS backend microservices
- Angular frontend applications
- Future services (mobile apps, scripts, etc.)

### Core Principles

- **TypeScript First** — All definitions are in modern TypeScript with strict mode.
- **Multi-Tenancy Ready** — Every major entity includes `companyId` for tenant isolation.
- **Audit & Soft Delete** — Standard audit fields (`createdAt`, `updatedAt`, `deletedAt`, `createdBy`, `updatedBy`) built into every entity.
- **Extensibility** — Entities are designed to be extended in consuming projects without modifying the library.
- **Consistency** — Clear naming conventions, detailed JSDoc comments, and organized barrel exports.

## Types and Interfaces

The library provides shared type aliases and base interfaces used across all domain entities:

| Type | Description |
|------|-------------|
| `UUID` | Unique identifier for all primary and foreign keys |
| `Money` | Monetary amount (string, precision-safe) |
| `Decimal` | Decimal column values (string, precision-safe) |
| `JsonData` | JSONB column data (`Record<string, unknown>`) |
| `DateString` | ISO date string (e.g., `'YYYY-MM-DD'`) |

| Interface | Description |
|-----------|-------------|
| `BaseEntity` | Base interface with `id`, `createdAt`, `updatedAt`, `createdBy?`, `updatedBy?` |
| `SoftDeletable` | Mixin interface with `deletedAt?`, `deletedBy?` for soft-delete support |

## Key Entities

Entities are organized by domain concern:

| Group | Entities |
|-------|----------|
| **Core & Multi-Tenancy** | `Company`, `CompanyPlan`, `User`, `Role`, `CompanyUser` |
| **Clients & Debts** | `Client`, `Debt`, `DebtSchedule` |
| **Invoicing & Templates** | `Invoice`, `InvoiceTemplate`, `Receipt`, `ReceiptTemplate` |
| **Payments & Reconciliation** | `PaymentProof`, `PaymentAttempt`, `Payment`, `BankStatement`, `BankTransaction`, `PaymentMatch` |
| **Communication & Summaries** | `Notification`, `NotificationTemplate`, `ClientDebtSummary`, `CompanyMonthlySummary` |

For full property definitions, see [`entities-definition.csv`](.agent/project-info/entities-definition.csv). For relationship diagrams, see [`entities-relationship-diagram-overview.md`](.agent/project-info/entities-relationship-diagram-overview.md).

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **TypeScript** >= 5.x | Strict-mode type definitions |
| **Node.js** >= 20.x LTS | Build tooling runtime |
| **npm** >= 10.x | Package manager and publish tool |

Zero runtime dependencies. The library exports only TypeScript interfaces, types, and enums — no services, no side effects, no network calls.

## Code Quality

This project uses ESLint and Prettier for code consistency. Run `npm run lint` to check for issues and `npm run format` to auto-format code.

## Project Structure

```text
src/
├── entities/          # Domain-organized entity interfaces
│   ├── company/
│   ├── client/
│   ├── debt/
│   ├── payment/
│   ├── bank/
│   ├── invoice/
│   ├── receipt/
│   ├── notification/
│   └── summary/
├── enums/             # Custom enums (e.g., DebtStatus, PaymentStatus)
├── types/             # Shared types (e.g., UUID, Money)
├── interfaces/        # Base interfaces (e.g., BaseEntity)
└── index.ts           # Root barrel export
```

## Installation & Usage

Install the package via npm:

```bash
npm install @cobranza-app/entities
```

Import directly into your project:

```typescript
import { Client, Debt, DebtStatus, Currency } from '@cobranza-app/entities';
```

The library exports only TypeScript interfaces, types, and enums — no runtime code, no side effects.

## Related Documentation

- [`brief.md`](.agent/project-info/brief.md) — Core requirements, entity list, and project goals
- [`product.md`](.agent/project-info/product.md) — Product vision, target users, and key flows
- [`architecture.md`](.agent/project-info/architecture.md) — Design patterns, package structure, and naming conventions
- [`tech.md`](.agent/project-info/tech.md) — Technology stack, build workflow, and constraints
- [`data-model-brief.md`](.agent/project-info/data-model-brief.md) — Detailed entity definitions and roles
- [`entities-definition.csv`](.agent/project-info/entities-definition.csv) — Full property definitions for all entities
- [`entities-relationship-diagram-overview.md`](.agent/project-info/entities-relationship-diagram-overview.md) — Entity relationship diagrams
