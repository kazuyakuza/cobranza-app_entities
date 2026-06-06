# Task 3 Plan: Entity Updates — Encryption

**Plan File**: `.kilo/plans/20260606-task-3-entity-encryption.md`  
**Date**: 2026-06-06  
**Depends On**: Task 1 (`EncryptedValue` type), Task 2 (`Location` type, `address` → `location` rename)

---

## Overview

Apply `EncryptedValue` types and add hash columns to sensitive fields across 7 entities (Company, User, Client, BankTransaction, BankStatement, Notification, PaymentProof). Update corresponding DTOs and JSON Schemas. Review 6 additional entities for encryption needs.

---

## Common Patterns

### Type Change Rule
- Optional field was `field?: string` → becomes `field?: EncryptedValue | null`
- Required field was `field: string` → becomes `field: EncryptedValue`
- Add import: `import type { EncryptedValue } from '../../types/encrypted'`

### Hash Column Rule
- Add new property `fieldNameHash?: string | null` directly after the encrypted field it relates to
- JSDoc: `/** Hash of fieldName for indexed search/lookup. */`

### DTO Inheritance Rule
- All DTOs in this project use `Omit<Entity, ...>` and `Partial<CreateXxxDto>` patterns
- Because they reference the Entity interface directly, changing the Entity type propagates automatically
- No DTO code changes are required for type-only updates (unless Create DTOs need to accept plain strings — this is deferred to Task 4)

### JSON Schema EncryptedValue Shape
Every encrypted field in JSON Schema must use the following object definition:

```json
{
  "type": "object",
  "properties": {
    "encryptedData": { "type": "string" },
    "keyName": { "type": "string" },
    "algorithm": { "type": "string" },
    "version": { "type": "integer" }
  },
  "required": ["encryptedData", "keyName"]
}
```

For optional encrypted fields (`field?: EncryptedValue | null`), the schema type becomes `["object", "null"]`:

```json
{
  "type": ["object", "null"],
  "properties": {
    "encryptedData": { "type": "string" },
    "keyName": { "type": "string" },
    "algorithm": { "type": "string" },
    "version": { "type": "integer" }
  },
  "required": ["encryptedData", "keyName"]
}
```

For hash columns (`fieldNameHash?: string | null`), the schema type becomes `["string", "null"]` and the property is NOT added to `required`:

```json
{
  "type": ["string", "null"]
}
```

---

## A. Company

### A.1 Entity File: `src/entities/company/company.entity.ts`

**Before:**
```typescript
import type { UUID } from '../../types/common';
import type { JsonData } from '../../types/common';
import type { Location } from '../../types/location';

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

  /** Physical location of the company. */
  location?: Location;

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

**After:**
```typescript
import type { UUID } from '../../types/common';
import type { JsonData } from '../../types/common';
import type { Location } from '../../types/location';
import type { EncryptedValue } from '../../types/encrypted';

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
  businessName?: EncryptedValue | null;

  /** Tax ID (e.g., CUIT, RUC, etc.). */
  taxId?: EncryptedValue | null;

  /** Hash of taxId for indexed search/lookup. */
  taxIdHash?: string | null;

  /** Email or contact information to be displayed to the end client. */
  contact: EncryptedValue;

  /** Hash of contact for indexed search/lookup. */
  contactHash?: string | null;

  /** Contact phone. */
  phone?: EncryptedValue | null;

  /** Physical location of the company. */
  location?: Location;

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

### A.2 DTO File: `src/entities/company/company.dto.ts`

No code changes required. `CreateCompanyDto` uses `Omit<Company, ...>` which inherits the new types automatically. `UpdateCompanyDto` uses `Partial<CreateCompanyDto>` which also inherits automatically.

### A.3 JSON Schema: `src/schemas/company.schema.json`

**Before:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Company",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "friendlyUrl": { "type": "string" },
    "name": { "type": "string" },
    "businessName": { "type": "string" },
    "taxId": { "type": "string" },
    "contact": { "type": "string" },
    "phone": { "type": "string" },
    "location": {
      "type": "object",
      "properties": {
        "address": {
          "type": "object",
          "properties": {
            "addressLine1": { "type": "string" },
            "addressLine2": { "type": "string" }
          },
          "required": ["addressLine1"]
        },
        "city": { "type": "string" },
        "state": { "type": "string" },
        "zipCode": { "type": "string" },
        "country": { "type": "string" }
      },
      "required": ["address"]
    },
    "logoUrl": { "type": "string" },
    "active": { "type": "boolean" },
    "settings": { "type": "object" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  },
  "required": [
    "id",
    "friendlyUrl",
    "name",
    "contact",
    "active",
    "createdAt",
    "updatedAt"
  ]
}
```

**After:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Company",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "friendlyUrl": { "type": "string" },
    "name": { "type": "string" },
    "businessName": {
      "type": ["object", "null"],
      "properties": {
        "encryptedData": { "type": "string" },
        "keyName": { "type": "string" },
        "algorithm": { "type": "string" },
        "version": { "type": "integer" }
      },
      "required": ["encryptedData", "keyName"]
    },
    "taxId": {
      "type": ["object", "null"],
      "properties": {
        "encryptedData": { "type": "string" },
        "keyName": { "type": "string" },
        "algorithm": { "type": "string" },
        "version": { "type": "integer" }
      },
      "required": ["encryptedData", "keyName"]
    },
    "taxIdHash": { "type": ["string", "null"] },
    "contact": {
      "type": "object",
      "properties": {
        "encryptedData": { "type": "string" },
        "keyName": { "type": "string" },
        "algorithm": { "type": "string" },
        "version": { "type": "integer" }
      },
      "required": ["encryptedData", "keyName"]
    },
    "contactHash": { "type": ["string", "null"] },
    "phone": {
      "type": ["object", "null"],
      "properties": {
        "encryptedData": { "type": "string" },
        "keyName": { "type": "string" },
        "algorithm": { "type": "string" },
        "version": { "type": "integer" }
      },
      "required": ["encryptedData", "keyName"]
    },
    "location": {
      "type": "object",
      "properties": {
        "address": {
          "type": "object",
          "properties": {
            "addressLine1": { "type": "string" },
            "addressLine2": { "type": "string" }
          },
          "required": ["addressLine1"]
        },
        "city": { "type": "string" },
        "state": { "type": "string" },
        "zipCode": { "type": "string" },
        "country": { "type": "string" }
      },
      "required": ["address"]
    },
    "logoUrl": { "type": "string" },
    "active": { "type": "boolean" },
    "settings": { "type": "object" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  },
  "required": [
    "id",
    "friendlyUrl",
    "name",
    "contact",
    "active",
    "createdAt",
    "updatedAt"
  ]
}
```

---

## B. User

### B.1 Entity File: `src/entities/company/user.entity.ts`

**Before:**
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

**After:**
```typescript
import type { UUID } from '../../types/common';
import type { EncryptedValue } from '../../types/encrypted';

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
  fullName?: EncryptedValue | null;

  /** Phone number. */
  phone?: EncryptedValue | null;

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

### B.2 DTO File: `src/entities/company/user.dto.ts`

No code changes required. Types propagate via `Omit` and `Partial`.

### B.3 JSON Schema: `src/schemas/user.schema.json`

**Before:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "User",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "email": { "type": "string" },
    "passwordHash": { "type": "string" },
    "passwordUpdatedAt": { "type": "string", "format": "date-time" },
    "fullName": { "type": "string" },
    "phone": { "type": "string" },
    "active": { "type": "boolean" },
    "emailVerified": { "type": "boolean" },
    "lastLoginAt": { "type": "string", "format": "date-time" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  },
  "required": [
    "id",
    "email",
    "active",
    "emailVerified",
    "createdAt",
    "updatedAt"
  ]
}
```

**After:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "User",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "email": { "type": "string" },
    "passwordHash": { "type": "string" },
    "passwordUpdatedAt": { "type": "string", "format": "date-time" },
    "fullName": {
      "type": ["object", "null"],
      "properties": {
        "encryptedData": { "type": "string" },
        "keyName": { "type": "string" },
        "algorithm": { "type": "string" },
        "version": { "type": "integer" }
      },
      "required": ["encryptedData", "keyName"]
    },
    "phone": {
      "type": ["object", "null"],
      "properties": {
        "encryptedData": { "type": "string" },
        "keyName": { "type": "string" },
        "algorithm": { "type": "string" },
        "version": { "type": "integer" }
      },
      "required": ["encryptedData", "keyName"]
    },
    "active": { "type": "boolean" },
    "emailVerified": { "type": "boolean" },
    "lastLoginAt": { "type": "string", "format": "date-time" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  },
  "required": [
    "id",
    "email",
    "active",
    "emailVerified",
    "createdAt",
    "updatedAt"
  ]
}
```

---

## C. Client

### C.1 Entity File: `src/entities/client/client.entity.ts`

**Before:**
```typescript
import type { UUID } from '../../types/common';
import type { JsonData } from '../../types/common';
import type { Location } from '../../types/location';

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

  /** Physical location of the client. */
  location?: Location;

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

**After:**
```typescript
import type { UUID } from '../../types/common';
import type { JsonData } from '../../types/common';
import type { Location } from '../../types/location';
import type { EncryptedValue } from '../../types/encrypted';

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
  fullName: EncryptedValue;

  /** Email. Highly recommended. */
  email?: EncryptedValue | null;

  /** Hash of email for indexed search/lookup. */
  emailHash?: string | null;

  /** Phone number. */
  phone?: EncryptedValue | null;

  /** Physical location of the client. */
  location?: Location;

  /** National ID / Tax ID of the end client (e.g., DNI, CUIT). */
  taxId?: EncryptedValue | null;

  /** Hash of taxId for indexed search/lookup. */
  taxIdHash?: string | null;

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

### C.2 DTO File: `src/entities/client/client.dto.ts`

No code changes required.

### C.3 JSON Schema: `src/schemas/client.schema.json`

**Before:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Client",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "companyId": { "type": "string", "format": "uuid" },
    "clientCode": { "type": "string" },
    "fullName": { "type": "string" },
    "email": { "type": "string" },
    "phone": { "type": "string" },
    "location": {
      "type": "object",
      "properties": {
        "address": {
          "type": "object",
          "properties": {
            "addressLine1": { "type": "string" },
            "addressLine2": { "type": "string" }
          },
          "required": ["addressLine1"]
        },
        "city": { "type": "string" },
        "state": { "type": "string" },
        "zipCode": { "type": "string" },
        "country": { "type": "string" }
      },
      "required": ["address"]
    },
    "taxId": { "type": "string" },
    "extraData": { "type": "object" },
    "active": { "type": "boolean" },
    "notes": { "type": "string" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" },
    "updatedBy": { "type": "string", "format": "uuid" }
  },
  "required": [
    "id",
    "companyId",
    "clientCode",
    "fullName",
    "active",
    "createdAt",
    "updatedAt"
  ]
}
```

**After:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Client",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "companyId": { "type": "string", "format": "uuid" },
    "clientCode": { "type": "string" },
    "fullName": {
      "type": "object",
      "properties": {
        "encryptedData": { "type": "string" },
        "keyName": { "type": "string" },
        "algorithm": { "type": "string" },
        "version": { "type": "integer" }
      },
      "required": ["encryptedData", "keyName"]
    },
    "email": {
      "type": ["object", "null"],
      "properties": {
        "encryptedData": { "type": "string" },
        "keyName": { "type": "string" },
        "algorithm": { "type": "string" },
        "version": { "type": "integer" }
      },
      "required": ["encryptedData", "keyName"]
    },
    "emailHash": { "type": ["string", "null"] },
    "phone": {
      "type": ["object", "null"],
      "properties": {
        "encryptedData": { "type": "string" },
        "keyName": { "type": "string" },
        "algorithm": { "type": "string" },
        "version": { "type": "integer" }
      },
      "required": ["encryptedData", "keyName"]
    },
    "location": {
      "type": "object",
      "properties": {
        "address": {
          "type": "object",
          "properties": {
            "addressLine1": { "type": "string" },
            "addressLine2": { "type": "string" }
          },
          "required": ["addressLine1"]
        },
        "city": { "type": "string" },
        "state": { "type": "string" },
        "zipCode": { "type": "string" },
        "country": { "type": "string" }
      },
      "required": ["address"]
    },
    "taxId": {
      "type": ["object", "null"],
      "properties": {
        "encryptedData": { "type": "string" },
        "keyName": { "type": "string" },
        "algorithm": { "type": "string" },
        "version": { "type": "integer" }
      },
      "required": ["encryptedData", "keyName"]
    },
    "taxIdHash": { "type": ["string", "null"] },
    "extraData": { "type": "object" },
    "active": { "type": "boolean" },
    "notes": { "type": "string" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" },
    "updatedBy": { "type": "string", "format": "uuid" }
  },
  "required": [
    "id",
    "companyId",
    "clientCode",
    "fullName",
    "active",
    "createdAt",
    "updatedAt"
  ]
}
```

---

## D. BankTransaction

### D.1 Entity File: `src/entities/bank/bank-transaction.entity.ts`

**Before:**
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

**After:**
```typescript
import type { UUID } from '../../types/common';
import type { Decimal } from '../../types/common';
import { Currency } from '../../enums/currency.enum';
import { BankTransactionStatus } from '../../enums/bank-transaction-status.enum';
import type { EncryptedValue } from '../../types/encrypted';

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
  description: EncryptedValue;

  /** Reference / operation / CBU / alias number. */
  reference?: EncryptedValue | null;

  /** Hash of reference for indexed search/lookup. */
  referenceHash?: string | null;

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

### D.2 DTO File: `src/entities/bank/bank-transaction.dto.ts`

No code changes required.

### D.3 JSON Schema: `src/schemas/bank-transaction.schema.json`

**Before:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "BankTransaction",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "bankStatementId": { "type": "string", "format": "uuid" },
    "companyId": { "type": "string", "format": "uuid" },
    "clientId": { "type": "string", "format": "uuid" },
    "transactionDate": { "type": "string", "format": "date-time" },
    "amount": { "type": "string" },
    "currency": { "type": "string", "enum": ["ARS", "USD"] },
    "description": { "type": "string" },
    "reference": { "type": "string" },
    "balanceAfter": { "type": "string" },
    "status": { "type": "string", "enum": ["UNMATCHED", "MATCHED", "IGNORED"] },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  },
  "required": [
    "id",
    "bankStatementId",
    "companyId",
    "transactionDate",
    "amount",
    "currency",
    "description",
    "status",
    "createdAt",
    "updatedAt"
  ]
}
```

**After:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "BankTransaction",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "bankStatementId": { "type": "string", "format": "uuid" },
    "companyId": { "type": "string", "format": "uuid" },
    "clientId": { "type": "string", "format": "uuid" },
    "transactionDate": { "type": "string", "format": "date-time" },
    "amount": { "type": "string" },
    "currency": { "type": "string", "enum": ["ARS", "USD"] },
    "description": {
      "type": "object",
      "properties": {
        "encryptedData": { "type": "string" },
        "keyName": { "type": "string" },
        "algorithm": { "type": "string" },
        "version": { "type": "integer" }
      },
      "required": ["encryptedData", "keyName"]
    },
    "reference": {
      "type": ["object", "null"],
      "properties": {
        "encryptedData": { "type": "string" },
        "keyName": { "type": "string" },
        "algorithm": { "type": "string" },
        "version": { "type": "integer" }
      },
      "required": ["encryptedData", "keyName"]
    },
    "referenceHash": { "type": ["string", "null"] },
    "balanceAfter": { "type": "string" },
    "status": { "type": "string", "enum": ["UNMATCHED", "MATCHED", "IGNORED"] },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  },
  "required": [
    "id",
    "bankStatementId",
    "companyId",
    "transactionDate",
    "amount",
    "currency",
    "description",
    "status",
    "createdAt",
    "updatedAt"
  ]
}
```

---

## E. BankStatement

### E.1 Entity File: `src/entities/bank/bank-statement.entity.ts`

**Before:**
```typescript
import type { UUID } from '../../types/common';
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

**After:**
```typescript
import type { UUID } from '../../types/common';
import { Bank } from '../../enums/bank.enum';
import { BankStatementFormat } from '../../enums/bank-statement-format.enum';
import { BankStatementStatus } from '../../enums/bank-statement-status.enum';
import type { BaseEntity } from '../../interfaces/base-entity.interface';
import type { EncryptedValue } from '../../types/encrypted';

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
  notes?: EncryptedValue | null;
}
```

### E.2 DTO File: `src/entities/bank/bank-statement.dto.ts`

No code changes required.

### E.3 JSON Schema: `src/schemas/bank-statement.schema.json`

**Before:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "BankStatement",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "companyId": { "type": "string", "format": "uuid" },
    "bank": { "type": "string", "enum": ["GALICIA", "BBVA", "SANTANDER", "BRUBANK", "MERCADOPAGO"] },
    "format": { "type": "string", "enum": ["PDF_TEXT", "PDF_TABLA", "EXCEL", "CSV", "API"] },
    "fileUrl": { "type": "string" },
    "fileName": { "type": "string" },
    "periodFrom": { "type": "string", "format": "date-time" },
    "periodTo": { "type": "string", "format": "date-time" },
    "status": { "type": "string", "enum": ["UPLOADED", "PARSING", "PROCESSED", "FAILED", "MANUALLY_REVIEWED"] },
    "totalTransactions": { "type": "integer" },
    "notes": { "type": "string" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" },
    "createdBy": { "type": "string", "format": "uuid" },
    "updatedBy": { "type": "string", "format": "uuid" }
  },
  "required": [
    "id",
    "companyId",
    "bank",
    "format",
    "fileUrl",
    "fileName",
    "status",
    "createdAt",
    "updatedAt"
  ]
}
```

**After:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "BankStatement",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "companyId": { "type": "string", "format": "uuid" },
    "bank": { "type": "string", "enum": ["GALICIA", "BBVA", "SANTANDER", "BRUBANK", "MERCADOPAGO"] },
    "format": { "type": "string", "enum": ["PDF_TEXT", "PDF_TABLA", "EXCEL", "CSV", "API"] },
    "fileUrl": { "type": "string" },
    "fileName": { "type": "string" },
    "periodFrom": { "type": "string", "format": "date-time" },
    "periodTo": { "type": "string", "format": "date-time" },
    "status": { "type": "string", "enum": ["UPLOADED", "PARSING", "PROCESSED", "FAILED", "MANUALLY_REVIEWED"] },
    "totalTransactions": { "type": "integer" },
    "notes": {
      "type": ["object", "null"],
      "properties": {
        "encryptedData": { "type": "string" },
        "keyName": { "type": "string" },
        "algorithm": { "type": "string" },
        "version": { "type": "integer" }
      },
      "required": ["encryptedData", "keyName"]
    },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" },
    "createdBy": { "type": "string", "format": "uuid" },
    "updatedBy": { "type": "string", "format": "uuid" }
  },
  "required": [
    "id",
    "companyId",
    "bank",
    "format",
    "fileUrl",
    "fileName",
    "status",
    "createdAt",
    "updatedAt"
  ]
}
```

---

## F. Notification

### F.1 Entity File: `src/entities/notification/notification.entity.ts`

**Before:**
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

**After:**
```typescript
import type { UUID } from '../../types/common';
import { NotificationType } from '../../enums/notification-type.enum';
import { NotificationChannel } from '../../enums/notification-channel.enum';
import { NotificationStatus } from '../../enums/notification-status.enum';
import type { EncryptedValue } from '../../types/encrypted';

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
  to: EncryptedValue;

  /** Sender (e.g., no-reply@conciliador.app). */
  from?: EncryptedValue | null;

  /** Type of notification. */
  type: NotificationType;

  /** Final subject. */
  subject: EncryptedValue;

  /** Final content (HTML or text). */
  body: EncryptedValue;

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

### F.2 DTO File: `src/entities/notification/notification.dto.ts`

No code changes required.

### F.3 JSON Schema: `src/schemas/notification.schema.json`

**Before:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Notification",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "companyId": { "type": "string", "format": "uuid" },
    "clientId": { "type": "string", "format": "uuid" },
    "userId": { "type": "string", "format": "uuid" },
    "notificationTemplateId": { "type": "string", "format": "uuid" },
    "to": { "type": "string" },
    "from": { "type": "string" },
    "type": { "type": "string", "enum": ["PAYMENT_UPLOADED", "PAYMENT_APPROVED", "PAYMENT_REJECTED", "DEBT_OVERDUE"] },
    "subject": { "type": "string" },
    "body": { "type": "string" },
    "channel": { "type": "string", "enum": ["EMAIL", "WHATSAPP", "SMS"] },
    "status": { "type": "string", "enum": ["PENDING", "SENT", "FAILED", "CANCELLED"] },
    "sentAt": { "type": "string", "format": "date-time" },
    "createdAt": { "type": "string", "format": "date-time" }
  },
  "required": [
    "id",
    "companyId",
    "to",
    "type",
    "subject",
    "body",
    "channel",
    "status",
    "createdAt"
  ]
}
```

**After:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Notification",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "companyId": { "type": "string", "format": "uuid" },
    "clientId": { "type": "string", "format": "uuid" },
    "userId": { "type": "string", "format": "uuid" },
    "notificationTemplateId": { "type": "string", "format": "uuid" },
    "to": {
      "type": "object",
      "properties": {
        "encryptedData": { "type": "string" },
        "keyName": { "type": "string" },
        "algorithm": { "type": "string" },
        "version": { "type": "integer" }
      },
      "required": ["encryptedData", "keyName"]
    },
    "from": {
      "type": ["object", "null"],
      "properties": {
        "encryptedData": { "type": "string" },
        "keyName": { "type": "string" },
        "algorithm": { "type": "string" },
        "version": { "type": "integer" }
      },
      "required": ["encryptedData", "keyName"]
    },
    "type": { "type": "string", "enum": ["PAYMENT_UPLOADED", "PAYMENT_APPROVED", "PAYMENT_REJECTED", "DEBT_OVERDUE"] },
    "subject": {
      "type": "object",
      "properties": {
        "encryptedData": { "type": "string" },
        "keyName": { "type": "string" },
        "algorithm": { "type": "string" },
        "version": { "type": "integer" }
      },
      "required": ["encryptedData", "keyName"]
    },
    "body": {
      "type": "object",
      "properties": {
        "encryptedData": { "type": "string" },
        "keyName": { "type": "string" },
        "algorithm": { "type": "string" },
        "version": { "type": "integer" }
      },
      "required": ["encryptedData", "keyName"]
    },
    "channel": { "type": "string", "enum": ["EMAIL", "WHATSAPP", "SMS"] },
    "status": { "type": "string", "enum": ["PENDING", "SENT", "FAILED", "CANCELLED"] },
    "sentAt": { "type": "string", "format": "date-time" },
    "createdAt": { "type": "string", "format": "date-time" }
  },
  "required": [
    "id",
    "companyId",
    "to",
    "type",
    "subject",
    "body",
    "channel",
    "status",
    "createdAt"
  ]
}
```

---

## G. PaymentProof

### G.1 Entity File: `src/entities/payment/payment-proof.entity.ts`

**Before:**
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

**After:**
```typescript
import type { UUID } from '../../types/common';
import type { EncryptedValue } from '../../types/encrypted';

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
  notes?: EncryptedValue | null;

  /** Timestamp when the entity was created. */
  createdAt: Date;

  /** ID of the Client or System who created this proof. */
  createdBy?: UUID;
}
```

### G.2 DTO File: `src/entities/payment/payment-proof.dto.ts`

No code changes required.

### G.3 JSON Schema: `src/schemas/payment-proof.schema.json`

**Before:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PaymentProof",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "companyId": { "type": "string", "format": "uuid" },
    "clientId": { "type": "string", "format": "uuid" },
    "fileUrl": { "type": "string" },
    "fileName": { "type": "string" },
    "fileType": { "type": "string" },
    "notes": { "type": "string" },
    "createdAt": { "type": "string", "format": "date-time" },
    "createdBy": { "type": "string", "format": "uuid" }
  },
  "required": [
    "id",
    "companyId",
    "clientId",
    "fileUrl",
    "fileName",
    "createdAt"
  ]
}
```

**After:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PaymentProof",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "companyId": { "type": "string", "format": "uuid" },
    "clientId": { "type": "string", "format": "uuid" },
    "fileUrl": { "type": "string" },
    "fileName": { "type": "string" },
    "fileType": { "type": "string" },
    "notes": {
      "type": ["object", "null"],
      "properties": {
        "encryptedData": { "type": "string" },
        "keyName": { "type": "string" },
        "algorithm": { "type": "string" },
        "version": { "type": "integer" }
      },
      "required": ["encryptedData", "keyName"]
    },
    "createdAt": { "type": "string", "format": "date-time" },
    "createdBy": { "type": "string", "format": "uuid" }
  },
  "required": [
    "id",
    "companyId",
    "clientId",
    "fileUrl",
    "fileName",
    "createdAt"
  ]
}
```

---

## H. Other Entities Review

Evaluate whether the following entities contain sensitive data fields that require encryption.

### H.1 Debt (`src/entities/debt/debt.entity.ts`)
- **Field**: `notes?: string`
- **Assessment**: Operational/admin notes about a debt. Primarily used for internal tracking (e.g., "Called client on 2026-05-01"). May incidentally contain PII but is not designed to store guaranteed sensitive data.
- **Recommendation**: **Leave as-is**. These are operational notes, not dedicated PII fields. If a future security audit requires it, address separately.

### H.2 Invoice (`src/entities/invoice/invoice.entity.ts`)
- **Field**: `notes?: string`
- **Assessment**: Additional notes on a formal invoice document. Typically used for terms, conditions, or payment instructions visible to the client.
- **Recommendation**: **Leave as-is**. Operational/document-level field.

### H.3 Receipt (`src/entities/receipt/receipt.entity.ts`)
- **Field**: `notes?: string`
- **Assessment**: Additional notes on a formal receipt document. Similar to Invoice.notes.
- **Recommendation**: **Leave as-is**. Operational/document-level field.

### H.4 Payment (`src/entities/payment/payment.entity.ts`)
- **Field**: `notes?: string`
- **Assessment**: Notes on a confirmed payment record. Typically used for reconciliation comments.
- **Recommendation**: **Leave as-is**. Operational/admin field.

### H.5 PaymentAttempt (`src/entities/payment/payment-attempt.entity.ts`)
- **Field**: `rejectionReason?: string`
- **Assessment**: Reason provided by a company user when manually rejecting a payment attempt. Could contain free-text commentary.
- **Recommendation**: **Leave as-is**. Rejection reasons are operational workflow data, not guaranteed PII. The free-text nature carries some risk, but encryption is not justified at this time.

### H.6 PaymentMatch (`src/entities/bank/payment-match.entity.ts`)
- **Field**: `notes?: string`
- **Assessment**: Notes explaining how a match was made (e.g., "match by amount + reference"). Purely operational metadata.
- **Recommendation**: **Leave as-is**. Operational metadata field with no expected PII.

---

## DTO Summary Table

All DTO files in this task use the standard pattern:

```typescript
export type CreateXxxDto = Omit<Xxx, 'id' | 'createdAt' | 'updatedAt' | ...>;
export type UpdateXxxDto = Partial<CreateXxxDto>;
export interface XxxResponse extends Xxx {}
```

Because they derive directly from the Entity interface, the `EncryptedValue` type changes propagate automatically. **No manual DTO edits are required in this task.**

| Entity | DTO File | Change Required |
|--------|----------|-----------------|
| Company | `src/entities/company/company.dto.ts` | None (Omit inherits) |
| User | `src/entities/company/user.dto.ts` | None (Omit inherits) |
| Client | `src/entities/client/client.dto.ts` | None (Omit inherits) |
| BankTransaction | `src/entities/bank/bank-transaction.dto.ts` | None (Omit inherits) |
| BankStatement | `src/entities/bank/bank-statement.dto.ts` | None (Omit inherits) |
| Notification | `src/entities/notification/notification.dto.ts` | None (Omit inherits) |
| PaymentProof | `src/entities/payment/payment-proof.dto.ts` | None (Omit inherits) |

**Note for Task 4**: `CreateXxxDto` accepting plain strings for fields that get encrypted (to be encrypted by the service layer) should be evaluated there. This task only updates entity and schema types.

---

## File Change Summary

| # | File Path | Action |
|---|-----------|--------|
| 1 | `src/entities/company/company.entity.ts` | Add `EncryptedValue` import; update 4 fields; add 2 hash columns |
| 2 | `src/entities/company/user.entity.ts` | Add `EncryptedValue` import; update 2 fields |
| 3 | `src/entities/client/client.entity.ts` | Add `EncryptedValue` import; update 4 fields; add 2 hash columns |
| 4 | `src/entities/bank/bank-transaction.entity.ts` | Add `EncryptedValue` import; update 2 fields; add 1 hash column |
| 5 | `src/entities/bank/bank-statement.entity.ts` | Add `EncryptedValue` import; update 1 field |
| 6 | `src/entities/notification/notification.entity.ts` | Add `EncryptedValue` import; update 4 fields |
| 7 | `src/entities/payment/payment-proof.entity.ts` | Add `EncryptedValue` import; update 1 field |
| 8 | `src/schemas/company.schema.json` | Update 4 properties to EncryptedValue; add 2 hash properties |
| 9 | `src/schemas/user.schema.json` | Update 2 properties to EncryptedValue |
| 10 | `src/schemas/client.schema.json` | Update 4 properties to EncryptedValue; add 2 hash properties |
| 11 | `src/schemas/bank-transaction.schema.json` | Update 2 properties to EncryptedValue; add 1 hash property |
| 12 | `src/schemas/bank-statement.schema.json` | Update 1 property to EncryptedValue |
| 13 | `src/schemas/notification.schema.json` | Update 4 properties to EncryptedValue |
| 14 | `src/schemas/payment-proof.schema.json` | Update 1 property to EncryptedValue |
| 15 | `src/schemas/index.ts` | Verify no changes needed (schemas already imported by path) |

---

## Implementation Steps

1. **Apply entity changes** in order: Company → User → Client → BankTransaction → BankStatement → Notification → PaymentProof
2. **Apply JSON Schema changes** in the same order
3. **Verify `src/schemas/index.ts`** requires no updates (it imports schemas by relative path; property changes inside JSON files do not affect the index)
4. **Run type check** if available: `npx tsc --noEmit`
5. **Commit**: `feat: encrypt sensitive fields across 7 entities`

---

## Verification Checklist

- [ ] All 7 entity files have `import type { EncryptedValue } from '../../types/encrypted'`
- [ ] All specified fields changed from `string` to `EncryptedValue` or `EncryptedValue | null`
- [ ] All hash columns added immediately after their corresponding encrypted field
- [ ] All hash columns have the JSDoc `/** Hash of fieldName for indexed search/lookup. */`
- [ ] All 7 JSON Schema files updated with EncryptedValue object shape
- [ ] All hash properties in schemas use `"type": ["string", "null"]` and are NOT in `required`
- [ ] All encrypted optional properties in schemas use `"type": ["object", "null"]`
- [ ] All encrypted required properties in schemas use `"type": "object"`
- [ ] No DTO files were modified (Omit inheritance is sufficient for this task)
- [ ] `src/schemas/index.ts` unchanged
- [ ] `src/types/encrypted.ts` and `src/types/index.ts` unchanged (Task 1 created them)
- [ ] Other entities (Debt, Invoice, Receipt, Payment, PaymentAttempt, PaymentMatch) left unchanged per H review

(End of plan)
