# @cobranza-apps/entities — Cobranza App Entities Library

Central data model definitions (entities, enums, types) for the **Cobranza App** system — a multi-tenant SaaS for debt management and payment reconciliation. This package serves as the **Single Source of Truth (SSOT)** for all data models across the ecosystem.

## Table of Contents

- [About](#about)
  - [Core Principles](#core-principles)
- [Types and Interfaces](#types-and-interfaces)
- [Data Encryption](#data-encryption)
  - [EncryptedValue Type](#encryptedvalue-type)
  - [Entities with Encrypted Fields](#entities-with-encrypted-fields)
  - [Encryption Flow Across Microservices](#encryption-flow-across-microservices)
  - [Searchable Encrypted Fields (Hash Columns)](#searchable-encrypted-fields-hash-columns)
- [Available Entities](#available-entities)
  - [Entity Audit & Optionality Notes](#entity-audit--optionality-notes)
- [DTOs (Data Transfer Objects)](#dtos-data-transfer-objects)
- [JSON Schemas](#json-schemas)
  - [Domain Groups](#domain-groups)
  - [Use Cases](#use-cases)
- [Tech Stack](#tech-stack)
- [Installation & Usage](#installation--usage)
  - [Extending an Entity in NestJS](#extending-an-entity-in-nestjs)
  - [Using Types in an Angular Service](#using-types-in-an-angular-service)
  - [Working with Enums](#working-with-enums)
- [Usage Examples](#usage-examples)
- [Related Documentation](#related-documentation)

## About

The primary goal of this repository is to provide a clean, structured, and authoritative source of truth for all data models in the Cobranza App platform.

By centralizing entity definitions in one versioned TypeScript package, we ensure consistency across:

- NestJS backend microservices
- Angular frontend applications
- Future services (mobile apps, scripts, etc.)

### Core Principles

- **TypeScript First** — All definitions are in modern TypeScript with strict mode.
- **Multi-Tenancy Ready** — Every major entity includes `companyId` for tenant isolation.
- **Audit & Soft Delete** — Standard audit and soft-delete fields (`createdAt`, `createdBy`, `updatedAt?`, `updatedBy?`, `deletedAt?`, `deletedBy?`) built into `BaseEntity`.
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
| `BaseEntity` | Base interface with `id`, `createdAt`, `createdBy` (required), `updatedAt?`, `updatedBy?`, `deletedAt?`, `deletedBy?` (optional) |
| `EncryptedValue` | Container for encrypted fields (`encryptedData`, `keyName`, `algorithm?`, `version?`) |
| `Location` | Geographic location (`address`, `city`, `state`, `country`, `zipCode`, `coordinates?`) |

## Data Encryption

Sensitive fields in this library are stored as `EncryptedValue` objects rather than plain strings. Encryption is performed by the consuming microservice, not by this library.

All encrypted fields accept `EncryptedValue | string | null` (or `EncryptedValue | string` for non-nullable fields). This allows microservices to pass raw strings before encryption, and the encryption layer will convert them to `EncryptedValue` objects at persistence time.

### EncryptedValue Type

```typescript
import { EncryptedValue } from '@cobranza-apps/entities';

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

For implementation details, see [`encryption-usage-guide.md`](docs/encryption-usage-guide.md).

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

## DTOs (Data Transfer Objects)

Each entity has companion DTOs for API layer communication. They are co-located with their entity files and exported through the same barrel exports.

A `Create*Dto` acts as a **broad inter-service contract** — it omits only the 7 `BaseEntity` audit fields while intentionally keeping all domain-settable fields (such as `debtCode` or `status`). This allows any microservice in the event-driven architecture to accept the full creation payload. Individual API boundaries then **narrow** the contract via `Omit` to reject fields the endpoint should not set:

```typescript
import { CreateDebtDto } from '@cobranza-apps/entities';

// Narrow at the API boundary
type ApiCreateDebtDto = Omit<CreateDebtDto, 'debtCode' | 'status'>;
```

| DTO Type | Purpose |
|----------|---------|
| `CreateXxxDto` | Required fields for entity creation (omits only the `BaseEntity` audit fields) |
| `UpdateXxxDto` | Optional fields for entity updates (`Partial<CreateXxxDto>`) |
| `XxxResponse` | Full entity shape returned by API responses (extends the entity interface) |

DTOs use TypeScript utility types (`Omit`, `Partial`, `extends`) for type-safe, zero-overhead abstractions. Import them alongside entities:

```typescript
import { Client, CreateClientDto, UpdateClientDto } from '@cobranza-apps/entities';

// Creating a new client
const payload: CreateClientDto = {
  clientCode: 'CLI-00001',
  companyId: '550e8400-e29b-41d4-a716-446655440000',
  active: true,
  fullName: 'Acme Corp',
};

// Updating an existing client
const updatePayload: UpdateClientDto = {
  email: 'new-billing@acme.com',
};
```

If your API surface must restrict client-writable fields, narrow the DTO with `Omit`:

```typescript
import { CreateDebtDto } from '@cobranza-apps/entities';

// Accept all CreateDebtDto fields except debtCode and status
type ApiCreateDebtDto = Omit<CreateDebtDto, 'debtCode' | 'status'>;
```

For full property definitions, see [`entities-definition.csv`](.agent/project-info/entities-definition.csv). For relationship diagrams, see [`entities-relationship-diagram-overview.md`](.agent/project-info/entities-relationship-diagram-overview.md).

## JSON Schemas

Each entity has a companion JSON Schema (Draft-07) file for runtime validation, dynamic form generation, OpenAPI spec generation, and AI agent integration.

Schemas are located in `src/schemas/` and are exported individually and as a grouped `schemas` object:

```typescript
import { debtSchema, clientSchema } from '@cobranza-apps/entities';
// or grouped access
import { schemas } from '@cobranza-apps/entities';
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
| **Node.js** >= 22.x LTS | Build tooling runtime |
| **npm** >= 10.x | Package manager and publish tool |

Zero runtime dependencies. The library exports only TypeScript interfaces, types, and enums — no services, no side effects, no network calls.

## Installation & Usage

Install the package via npm:

```bash
npm install @cobranza-apps/entities
```

Import directly into your project:

```typescript
import { Client, Debt, DebtStatus, Currency } from '@cobranza-apps/entities';
```

### Extending an Entity in NestJS

Because the library exports plain interfaces, you can extend them with NestJS decorators in your consuming project without modifying the library:

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Debt as DebtBase } from '@cobranza-apps/entities';

@Entity()
export class Debt implements DebtBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  clientId: string;

  @Column({ nullable: true })
  description?: string;

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
import { Client, Debt, CreateClientDto } from '@cobranza-apps/entities';

@Injectable({ providedIn: 'root' })
export class DebtService {
  async getClientDebts(clientId: string): Promise<Debt[]> {
    const response = await fetch(`/api/clients/${clientId}/debts`);
    return response.json();
  }

  async createClient(payload: CreateClientDto): Promise<Client> {
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
import { DebtStatus, PaymentStatus, Currency } from '@cobranza-apps/entities';

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

- [`data-model-brief.md`](.agent/project-info/data-model-brief.md) — Detailed entity definitions and roles
- [`entities-definition.csv`](.agent/project-info/entities-definition.csv) — Full property definitions for all entities
- [`entities-relationship-diagram-overview.md`](.agent/project-info/entities-relationship-diagram-overview.md) — Entity relationship diagrams
- [`json-schema-usage.md`](docs/json-schema-usage.md) — JSON Schema usage guide for Angular, NestJS, and tooling
- [`encryption-usage-guide.md`](docs/encryption-usage-guide.md) — Encrypting, decrypting, and hashing in microservices
