# @cobranza-app/entities — Cobranza App Entities Library

Central data model definitions (entities, enums, types) for the **Cobranza App** system — a multi-tenant SaaS for debt management and payment reconciliation. This package serves as the **Single Source of Truth (SSOT)** for all data models across the ecosystem.

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
| `EncryptedValue` | Container for encrypted fields (`encryptedData`, `keyName`, `algorithm?`, `version?`) |
| `Location` | Geographic location (`address`, `city`, `state`, `country`, `zipCode`, `coordinates?`) |

## Data Encryption

Sensitive fields in this library are stored as `EncryptedValue` objects rather than plain strings. Encryption is performed by the consuming microservice, not by this library.

### EncryptedValue Type

```typescript
import { EncryptedValue } from '@cobranza-app/entities';

const encrypted: EncryptedValue = {
  encryptedData: 'U2FsdGVkX1+vupppZksvRf5pq5g5XjFRlipTg9+MvKLJmzJ...',
  keyName: 'client_pii_key',
  algorithm: 'AES-256-GCM',
  version: 1,
};
```

### Entities with Encrypted Fields

| Entity | Encrypted Fields | Hash Columns |
|--------|-----------------|--------------|
| `Company` | `businessName`, `taxId`, `contact`, `phone` | `taxIdHash`, `contactHash` |
| `User` | `fullName`, `phone` | none |
| `Client` | `fullName`, `taxId`, `email`, `phone` | `taxIdHash`, `emailHash` |
| `BankTransaction` | `description`, `reference` | `referenceHash` |
| `BankStatement` | `notes` | none |
| `Notification` | `to`, `from`, `subject`, `body` | none |
| `PaymentProof` | `notes` | none |

### Encryption Flow Across Microservices

1. **Ingress**: A microservice receives plain-text sensitive data via API, message queue, or event.
2. **Validation**: Data is validated against the entity DTO.
3. **Encryption**: The service encrypts sensitive fields using its configured key.
4. **Persistence**: The encrypted payload is stored as `EncryptedValue` (JSONB in the database).
5. **Egress**: When another microservice reads the entity, it receives the `EncryptedValue` and decrypts it using the same key name.

> Encryption and decryption always happen inside the microservice boundary, never in the database or in transit without TLS.

### Searchable Encrypted Fields (Hash Columns)

Fields that must support exact-match queries (e.g., tax ID lookup, email uniqueness check) have a parallel `xxxHash` column containing a SHA-256 hex digest of the plain-text value. The hash is computed **before** encryption and stored alongside the encrypted payload.

| Field | Hash Column | Use Case |
|-------|-------------|----------|
| `Client.taxId` | `Client.taxIdHash` | Exact-match client lookup by tax ID |
| `Client.email` | `Client.emailHash` | Uniqueness check and lookup |
| `Company.taxId` | `Company.taxIdHash` | Exact-match company lookup |
| `Company.contact` | `Company.contactHash` | Contact search |
| `BankTransaction.reference` | `BankTransaction.referenceHash` | Reference search and matching |

For implementation details, see [`docs/encryption-usage-guide.md`](docs/encryption-usage-guide.md).

## Available Entities

Entities are organized into 9 domain modules:

- **company** — `Company`, `CompanyPlan`, `CompanyUser`, `Role`, `User`
- **client** — `Client`
- **debt** — `Debt`, `DebtSchedule`
- **payment** — `Payment`, `PaymentAttempt`, `PaymentProof`
- **bank** — `BankStatement`, `BankTransaction`, `PaymentMatch`
- **invoice** — `Invoice`, `InvoiceTemplate`
- **receipt** — `Receipt`, `ReceiptTemplate`
- **notification** — `Notification`, `NotificationTemplate`
- **summary** — `ClientDebtSummary`, `CompanyMonthlySummary`

All entities are plain TypeScript interfaces. They contain no decorators or runtime logic, making them safe to import into any framework.

## DTOs (Data Transfer Objects)

Each entity has companion DTOs for API layer communication. They are co-located with their entity files and exported through the same barrel exports.

| DTO Type | Purpose |
|----------|---------|
| `CreateXxxDto` | Required fields for entity creation (omits `id`, audit timestamps, and system-managed fields) |
| `UpdateXxxDto` | Optional fields for entity updates (`Partial<CreateXxxDto>`) |
| `XxxResponse` | Full entity shape returned by API responses (extends the entity interface) |

DTOs use TypeScript utility types (`Omit`, `Partial`, `extends`) for type-safe, zero-overhead abstractions. Import them alongside entities:

```typescript
import { Client, CreateClientDto, UpdateClientDto } from '@cobranza-app/entities';

// Creating a new client
const payload: CreateClientDto = {
  name: 'Acme Corp',
  email: 'billing@acme.com',
  companyId: '550e8400-e29b-41d4-a716-446655440000',
};

// Updating an existing client
const updatePayload: UpdateClientDto = {
  email: 'new-billing@acme.com',
};
```

For full property definitions, see [`entities-definition.csv`](.agent/project-info/entities-definition.csv). For relationship diagrams, see [`entities-relationship-diagram-overview.md`](.agent/project-info/entities-relationship-diagram-overview.md).

## JSON Schemas

Each entity has a companion JSON Schema (Draft-07) file for runtime validation, dynamic form generation, OpenAPI spec generation, and AI agent integration.

Schemas are located in `src/schemas/` and are exported individually and as a grouped `schemas` object:

```typescript
import { debtSchema, clientSchema } from '@cobranza-app/entities';
// or grouped access
import { schemas } from '@cobranza-app/entities';
const debtValidationSchema = schemas.debt.debt;
```

### Domain Groups

| Domain | Schema Count |
|--------|-------------|
| company | 5 (Company, CompanyPlan, User, Role, CompanyUser) |
| client | 1 (Client) |
| debt | 2 (Debt, DebtSchedule) |
| payment | 3 (Payment, PaymentAttempt, PaymentProof) |
| bank | 3 (BankStatement, BankTransaction, PaymentMatch) |
| invoice | 2 (Invoice, InvoiceTemplate) |
| receipt | 2 (Receipt, ReceiptTemplate) |
| notification | 2 (Notification, NotificationTemplate) |
| summary | 2 (ClientDebtSummary, CompanyMonthlySummary) |

### Use Cases

- **Dynamic Forms** — drive form field generation from schema definitions
- **Runtime Validation** — validate incoming payloads against entity schemas
- **Swagger / OpenAPI** — generate API specifications from JSON Schemas
- **AI Agents** — provide structured entity contracts for LLM-based integrations

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
├── entities/          # Domain-organized entity interfaces and DTOs
│   ├── company/       # *.entity.ts, *.dto.ts, index.ts
│   ├── client/        # *.entity.ts, *.dto.ts, index.ts
│   ├── debt/          # *.entity.ts, *.dto.ts, index.ts
│   ├── payment/       # *.entity.ts, *.dto.ts, index.ts
│   ├── bank/          # *.entity.ts, *.dto.ts, index.ts
│   ├── invoice/       # *.entity.ts, *.dto.ts, index.ts
│   ├── receipt/       # *.entity.ts, *.dto.ts, index.ts
│   ├── notification/  # *.entity.ts, *.dto.ts, index.ts
│   └── summary/       # *.entity.ts, *.dto.ts, index.ts
├── enums/             # Custom enums (e.g., DebtStatus, PaymentStatus)
├── types/             # Shared types (e.g., UUID, Money)
├── interfaces/        # Base interfaces (e.g., BaseEntity)
├── schemas/           # JSON Schema files (one per entity)
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

### Basic Import

```typescript
import { Client, Debt, DebtStatus, Currency } from '@cobranza-app/entities';
```

### Extending an Entity in NestJS

Because the library exports plain interfaces, you can extend them with NestJS decorators in your consuming project without modifying the library:

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Debt as DebtBase } from '@cobranza-app/entities';

@Entity()
export class Debt implements DebtBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  clientId: string;

  @Column()
  description: string;

  @Column('decimal')
  totalAmount: string;

  @Column()
  currency: string;

  @Column()
  dueDate: Date;

  @Column()
  issueDate: Date;

  @Column()
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
```

### Using Types in an Angular Service

```typescript
import { Injectable } from '@angular/core';
import { Client, Debt } from '@cobranza-app/entities';

@Injectable({ providedIn: 'root' })
export class DebtService {
  async getClientDebts(clientId: string): Promise<Debt[]> {
    const response = await fetch(`/api/clients/${clientId}/debts`);
    return response.json();
  }

  async createClient(payload: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.json();
  }
}
```

### Working with Enums

```typescript
import { DebtStatus, PaymentStatus, Currency } from '@cobranza-app/entities';

function canCancelDebt(status: DebtStatus): boolean {
  return status === DebtStatus.PENDING || status === DebtStatus.OVERDUE;
}

function isPaymentCompleted(status: PaymentStatus): boolean {
  return status === PaymentStatus.COMPLETED;
}
```

## Usage Examples

For detailed, copy-paste-ready integration examples, see:

- [`docs/usage-nestjs.md`](docs/usage-nestjs.md) — Controllers, DTOs, services, and TypeORM patterns
- [`docs/usage-angular.md`](docs/usage-angular.md) — Services, components, reactive forms, and enum-driven UI
- [`docs/openapi-examples.md`](docs/openapi-examples.md) — Swagger/OpenAPI decorator usage with library interfaces

## Related Documentation

- [`brief.md`](.agent/project-info/brief.md) — Core requirements, entity list, and project goals
- [`product.md`](.agent/project-info/product.md) — Product vision, target users, and key flows
- [`architecture.md`](.agent/project-info/architecture.md) — Design patterns, package structure, and naming conventions
- [`tech.md`](.agent/project-info/tech.md) — Technology stack, build workflow, and constraints
- [`data-model-brief.md`](.agent/project-info/data-model-brief.md) — Detailed entity definitions and roles
- [`entities-definition.csv`](.agent/project-info/entities-definition.csv) — Full property definitions for all entities
- [`entities-relationship-diagram-overview.md`](.agent/project-info/entities-relationship-diagram-overview.md) — Entity relationship diagrams
- [`json-schema-usage.md`](/docs/json-schema-usage.md) — JSON Schema usage guide for Angular, NestJS, and tooling
- [`encryption-usage-guide.md`](/docs/encryption-usage-guide.md) — Encrypting, decrypting, and hashing in microservices
