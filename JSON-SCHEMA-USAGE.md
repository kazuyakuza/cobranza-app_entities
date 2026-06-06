# JSON Schema Usage Guide

`@cobranza-app/entities` ships 22 JSON Schema (Draft-07) files alongside its TypeScript interfaces. Each schema lives in `src/schemas/` and provides a runtime contract for validation, dynamic form generation, OpenAPI spec generation, and AI-agent integrations.

This guide covers:

- **Schema Sync Strategy** — keeping schemas aligned with entity interfaces
- **Angular Integration** — dynamic forms and runtime validation
- **NestJS Integration** — Swagger/OpenAPI, validation pipes, and AI agent contracts
- **Tools & Generation** — automated schema generation and validation libraries
- **Import Patterns** — how to import schemas in consuming projects
- **Available Schemas Reference** — complete listing of all 22 schemas

### Prerequisites

- Node.js >= 20
- TypeScript >= 5.x
- `resolveJsonModule: true` in the consuming project's `tsconfig.json`

---

## 1. Schema Sync Strategy

Schemas are currently hand-written. When an entity interface changes, the corresponding `.schema.json` file must be updated to match.

### 1.1 Manual Maintenance Checklist

When modifying an entity in `src/entities/<domain>/<entity>.entity.ts`, update the matching schema in `src/schemas/<entity>.schema.json`:

1. **Add/remove properties** in the `properties` object
2. **Update the `required` array** to reflect mandatory fields
3. **Update `enum` values** if enum members change
4. **Update `type` / `format`** if field types change (e.g., `Date` → `string` with `format: date-time`)

Example — adding a `priority` field to the `Debt` entity:

```typescript
// src/entities/debt/debt.entity.ts — TypeScript change
export interface Debt extends BaseEntity {
  // ... existing fields ...
  priority: DebtPriority;
}
```

```json
// src/schemas/debt.schema.json — corresponding schema change
{
  "properties": {
    "...existing properties...": "...",
    "priority": { "type": "string", "enum": ["LOW", "MEDIUM", "HIGH"] }
  },
  "required": ["...existing fields...", "priority"]
}
```

**Rule of thumb**: Any time you modify an entity interface, immediately update its schema file. A missing property or stale `required` field produces silent validation gaps.

### 1.2 Automated Generation (Recommended Future Path)

The project currently has zero runtime dependencies and no generation pipeline. Consider adding a schema generation tool as a dev dependency to reduce manual sync drift.

**Recommended tool**: `typescript-json-schema` ([YousefED/typescript-json-schema](https://github.com/YousefED/typescript-json-schema))

```bash
npx typescript-json-schema src/entities/debt/debt.entity.ts Debt --required --out src/schemas/debt.schema.json
```

**Caveats**:

- TypeScript `Date` becomes `string` without `format: date-time` — requires post-processing
- `Decimal` (a string type alias) becomes `string` without `format` hints
- Enum names are not preserved in the output; enum values are inlined

**Post-generation cleanup script** (to add in a future iteration):

```bash
# Inject format hints for known type patterns
node scripts/fix-schema-formats.js src/schemas/debt.schema.json
```

---

## 2. Angular Usage

### 2.1 Importing Schemas

```typescript
// Individual named imports
import { debtSchema, clientSchema } from '@cobranza-app/entities';

// Grouped access by domain
import { schemas } from '@cobranza-app/entities';
const debtValidationSchema = schemas.debt.debt;
const clientValidationSchema = schemas.client.client;
```

Reference: `src/schemas/index.ts` for barrel exports, `src/index.ts` for root re-exports.

### 2.2 Dynamic Form Generation

Use JSON Schema properties to build `FormGroup` definitions with Angular's `ReactiveFormsModule`:

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { schemas } from '@cobranza-app/entities';

interface JsonSchemaObject {
  properties: Record<string, { format?: string; type?: string; enum?: string[] }>;
  required?: string[];
}

function buildFormFromSchema(
  schema: JsonSchemaObject,
  fb: FormBuilder,
): FormGroup {
  const group: Record<string, any> = {};
  for (const [key, prop] of Object.entries(schema.properties)) {
    const validators = schema.required?.includes(key) ? [Validators.required] : [];
    if ((prop as { format?: string }).format === 'email') {
      validators.push(Validators.email);
    }
    group[key] = ['', validators];
  }
  return fb.group(group);
}
```

This mapper reads each property's type and format from the schema, maps required fields to `Validators.required`, and applies format-specific validators (e.g., `email`). Extend the mapper to handle `enum` fields as dropdowns, `format: uuid` fields with UUID validators, etc.

Reference: [`docs/usage-angular.md`](docs/usage-angular.md) — Section 3 (Reactive Forms with Typed Models)

### 2.3 Runtime Validation with Ajv

Install `ajv` in the Angular project for client-side payload validation:

```bash
npm install ajv
```

```typescript
import Ajv from 'ajv';
import { schemas } from '@cobranza-app/entities';

const ajv = new Ajv({ allErrors: true });
const validateDebt = ajv.compile(schemas.debt.debt);

const isValid = validateDebt(formPayload);
if (!isValid) {
  console.error(validateDebt.errors);
}
```

`ajv` is Draft-07 compliant, lightweight, and works in browser bundles. Use it to validate form payloads before sending API requests, or to validate API responses in interceptors.

---

## 3. NestJS Usage

### 3.1 Swagger / OpenAPI Integration

NestJS Swagger can consume JSON Schemas to produce OpenAPI specifications. Register schemas programmatically:

```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { schemas } from '@cobranza-app/entities';

const config = new DocumentBuilder()
  .setTitle('Cobranza API')
  .setVersion('1.0')
  .build();

const document = SwaggerModule.createDocument(app, config);

// Add JSON schemas as components in the spec
Object.values(schemas).forEach((domain) => {
  Object.values(domain).forEach((schema) => {
    document.components = document.components || {};
    document.components.schemas = document.components.schemas || {};
    document.components.schemas[schema.title] = schema;
  });
});
```

For decorator-based DTO documentation, reference the schema properties in `@ApiProperty()`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { DebtStatus, Currency } from '@cobranza-app/entities';
import type { Debt as DebtInterface, UUID, Decimal } from '@cobranza-app/entities';

export class Debt implements DebtInterface {
  @ApiProperty({ format: 'uuid', description: 'Primary key' })
  id: UUID;

  @ApiProperty({ enum: Currency, enumName: 'Currency', description: 'Currency code' })
  currency: Currency;

  @ApiProperty({ enum: DebtStatus, enumName: 'DebtStatus', description: 'Current debt status' })
  status: DebtStatus;
}
```

Reference: [`docs/openapi-examples.md`](docs/openapi-examples.md) — Sections 1–3

### 3.2 Validation Pipes

JSON Schemas define the contract; `class-validator` decorators implement runtime enforcement on class-based DTOs. Use both together: the schema is the authoritative shape, and the class-validator DTO is the NestJS runtime enforcer.

```typescript
import { IsEnum, IsUUID, IsString, IsOptional, IsDateString } from 'class-validator';
import { DebtStatus, Currency } from '@cobranza-app/entities';

export class CreateDebtRequest {
  @IsUUID()
  companyId!: string;

  @IsUUID()
  clientId!: string;

  @IsString()
  description!: string;

  @IsString()
  totalAmount!: string;

  @IsEnum(Currency)
  currency!: Currency;

  @IsDateString()
  dueDate!: string;

  @IsDateString()
  issueDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

Enable validation globally in `main.ts`:

```typescript
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.listen(3000);
}
bootstrap();
```

Reference: [`docs/usage-nestjs.md`](docs/usage-nestjs.md) — Section 3 (Validation Pipe Integration)

### 3.3 AI Agent Integration

JSON Schemas provide structured contracts for LLM-based agents. Use them directly as function-calling parameter definitions:

```typescript
import { schemas } from '@cobranza-app/entities';

const createDebtTool = {
  type: 'function',
  function: {
    name: 'createDebt',
    description: 'Create a new debt record',
    parameters: schemas.debt.debt,
  },
};
```

This pattern works with OpenAI function calling, Anthropic tool use, and other LLM providers that accept JSON Schema for structured output.

### 3.4 Postman Collection Generation

Import JSON Schemas directly into Postman for response validation in collection tests:

```javascript
// Postman test script
const debtSchema = JSON.parse(pm.collectionVariables.get('debtSchema'));
pm.response.to.have.jsonSchema(debtSchema);
```

Store schemas as collection variables by importing the schema JSON files, then reference them in test scripts to validate API responses against the canonical entity shape.

---

## 4. Tools and Generation Methods

### 4.1 Manual Editing

Current state. Use VS Code with JSON Schema support — the `$schema` header (`http://json-schema.org/draft-07/schema#`) enables autocomplete and validation automatically.

### 4.2 TypeScript-to-JSON-Schema Generators

| Tool | Command | Pros | Cons |
|------|---------|------|------|
| `typescript-json-schema` | `npx typescript-json-schema tsconfig.json Debt --required --out src/schemas/debt.schema.json` | Zero config, works with interfaces | May emit `Date` as `string` without `format`; may not preserve enum names |
| `ts-json-schema-generator` | `npx ts-json-schema-generator --path tsconfig.json --type Debt --out src/schemas/debt.schema.json` | Better type alias resolution | Slightly more complex config |

**Post-generation cleanup**: After generating schemas, run a script to inject `format: 'uuid'` for UUID fields, `format: 'date-time'` for Date fields, and `enum` arrays for enum-backed strings.

### 4.3 JSON-Schema-to-TypeScript (`json-schema-to-typescript`)

For the reverse direction — generating TypeScript types from schemas:

```bash
npx json-schema-to-typescript src/schemas/debt.schema.json -o src/entities/debt/debt.entity.ts
```

Useful for projects that start with JSON Schema as the source of truth and need TypeScript types derived from it. This project uses the opposite direction (TypeScript → JSON Schema), so this tool is listed for reference only.

### 4.4 Validation Libraries

| Platform | Library | Use Case |
|----------|---------|----------|
| Angular / Browser | `ajv` | Client-side form and payload validation (Draft-07 compliant) |
| Node.js / NestJS | `ajv` | Server-side request validation; also `fast-json-stringify` for serialization performance |
| Testing | `jest-json-schema` or `ajv` | Schema conformance assertions in test suites |

---

## 5. Import Patterns

All examples in one place for quick reference:

```typescript
// Individual schema import
import { debtSchema } from '@cobranza-app/entities';

// Grouped schemas object — access by domain and entity name
import { schemas } from '@cobranza-app/entities';
const debt = schemas.debt.debt;
const client = schemas.client.client;
const company = schemas.company.company;

// TypeScript types alongside schemas
import { Debt, CreateDebtDto, DebtStatus } from '@cobranza-app/entities';
```

Reference: `src/schemas/index.ts` for the `schemas` object structure, `src/index.ts` for root barrel re-exports.

---

## 6. Type Mapping Reference

The JSON Schema type system maps from TypeScript as follows:

| TypeScript Type | JSON Schema Representation |
|-----------------|---------------------------|
| `UUID` | `{ "type": "string", "format": "uuid" }` |
| `Decimal` / `Money` | `{ "type": "string" }` |
| `Date` | `{ "type": "string", "format": "date-time" }` |
| `JsonData` | `{ "type": "object" }` |
| `boolean` | `{ "type": "boolean" }` |
| `string` | `{ "type": "string" }` |
| Enums (e.g., `DebtStatus`) | `{ "type": "string", "enum": ["PENDING", "OVERDUE", ...] }` |
| `DateString` | `{ "type": "string" }` (no format, or `format: date` for date-only) |

---

## 7. Available Schemas Reference

| Domain | Entity | File Name | Schema Title | Notes |
|--------|--------|-----------|--------------|-------|
| company | Company | `company.schema.json` | Company | |
| company | CompanyPlan | `company-plan.schema.json` | CompanyPlan | |
| company | User | `user.schema.json` | User | |
| company | Role | `role.schema.json` | Role | Minimal schema: id, name, description, createdAt only |
| company | CompanyUser | `company-user.schema.json` | CompanyUser | Does not extend BaseEntity |
| client | Client | `client.schema.json` | Client | |
| debt | Debt | `debt.schema.json` | Debt | |
| debt | DebtSchedule | `debt-schedule.schema.json` | DebtSchedule | |
| invoice | Invoice | `invoice.schema.json` | Invoice | |
| invoice | InvoiceTemplate | `invoice-template.schema.json` | InvoiceTemplate | |
| receipt | Receipt | `receipt.schema.json` | Receipt | |
| receipt | ReceiptTemplate | `receipt-template.schema.json` | ReceiptTemplate | |
| payment | PaymentProof | `payment-proof.schema.json` | PaymentProof | Only has createdAt/createdBy, no updatedAt |
| payment | PaymentAttempt | `payment-attempt.schema.json` | PaymentAttempt | |
| payment | Payment | `payment.schema.json` | Payment | |
| bank | BankStatement | `bank-statement.schema.json` | BankStatement | |
| bank | BankTransaction | `bank-transaction.schema.json` | BankTransaction | |
| bank | PaymentMatch | `payment-match.schema.json` | PaymentMatch | Does not extend BaseEntity; has matchedAt instead of createdAt |
| notification | Notification | `notification.schema.json` | Notification | |
| notification | NotificationTemplate | `notification-template.schema.json` | NotificationTemplate | |
| summary | ClientDebtSummary | `client-debt-summary.schema.json` | ClientDebtSummary | |
| summary | CompanyMonthlySummary | `company-monthly-summary.schema.json` | CompanyMonthlySummary | |

All 22 schemas use `"$schema": "http://json-schema.org/draft-07/schema#"` and `"type": "object"`. Each schema defines `properties`, `required`, and `enum` where applicable.

---

## 8. Related Documentation

- [`README.md`](README.md) — General usage and installation
- [`docs/usage-angular.md`](docs/usage-angular.md) — Angular service patterns, reactive forms, enum-driven UI
- [`docs/usage-nestjs.md`](docs/usage-nestjs.md) — NestJS controllers, DTOs, services, TypeORM patterns
- [`docs/openapi-examples.md`](docs/openapi-examples.md) — Swagger/OpenAPI decorator usage with library interfaces
- [`.agent/project-info/entities-definition.csv`](.agent/project-info/entities-definition.csv) — Full property definitions for all entities