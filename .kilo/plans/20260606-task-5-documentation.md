# Task 5 Plan: Documentation & Guidelines

**Global Plan**: [20260606-encryption-data-model-improvements.md](20260606-encryption-data-model-improvements.md)
**Task**: Update README.md with encryption section; create `/docs/encryption-usage-guide.md`

---

## Overview

This task produces two documentation deliverables:
1. A new **Encryption** section in the main `README.md` summarizing which entities have encrypted fields, how encryption works across microservices, and the hash-column pattern for searchable fields.
2. A new `/docs/encryption-usage-guide.md` file with copy-paste-ready code examples for encrypting, decrypting, and hashing in consuming microservices.

Both documents must be consistent with:
- The `EncryptedValue` interface in `src/types/encrypted.ts`
- The `Location` interface in `src/types/location.ts`
- The entity files updated in Tasks 2–3
- The existing `docs/security-encryption-policy.md`
- The existing README style and the `docs/usage-nestjs.md` / `docs/usage-angular.md` conventions

---

## 1. README.md — Encryption Section

### 1.1 Insert Location

Insert the new section **after** the "Types and Interfaces" section (line ~39) and **before** the "Available Entities" section (line ~40). This positions encryption as a type-level concern right after the shared types table.

### 1.2 Section Structure

```markdown
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
| `BankTransaction` | `reference`, `description` | `referenceHash` |
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
```

### 1.3 Exact Changes

- **Insert after line 39** (end of "Types and Interfaces" section, after the `SoftDeletable` table).
- **Before line 40** (`## Available Entities`).
- Add a link to the new guide in the "Related Documentation" section at the bottom of README:
  - `- [docs/encryption-usage-guide.md](/docs/encryption-usage-guide.md) — Encrypting, decrypting, and hashing in microservices`

---

## 2. `/docs/encryption-usage-guide.md` — New File

### 2.1 File Structure

```markdown
# Encryption Usage Guide

Practical patterns for encrypting, decrypting, and hashing sensitive data in microservices that consume `@cobranza-app/entities`.

---

## 1. Importing Encryption Types

```typescript
import { EncryptedValue, Client, Company, BankTransaction } from '@cobranza-app/entities';
```

## 2. Encrypting Data in a Microservice

### 2.1 Encryption Helper

```typescript
import { createCipheriv, randomBytes, scryptSync } from 'crypto';

interface EncryptionConfig {
  keyName: string;
  algorithm?: string;
}

function encryptValue(plainText: string, config: EncryptionConfig): EncryptedValue {
  const algorithm = config.algorithm ?? 'AES-256-GCM';
  const keyMaterial = process.env[`ENCRYPTION_KEY_${config.keyName.toUpperCase()}`];
  if (!keyMaterial) {
    throw new Error(`Missing encryption key for: ${config.keyName}`);
  }

  const key = scryptSync(keyMaterial, 'salt', 32);
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  const encryptedData = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'base64')]).toString('base64');

  return {
    encryptedData,
    keyName: config.keyName,
    algorithm,
    version: 1,
  };
}
```

### 2.2 Encrypting Before Persistence

```typescript
import { Injectable } from '@nestjs/common';
import { Client, EncryptedValue } from '@cobranza-app/entities';

@Injectable()
export class ClientEncryptionService {
  encryptClientPayload(payload: Record<string, unknown>): Record<string, unknown> {
    const encrypted = { ...payload };

    if (typeof payload.fullName === 'string') {
      encrypted.fullName = encryptValue(payload.fullName, { keyName: 'client_pii_key' });
    }
    if (typeof payload.taxId === 'string') {
      encrypted.taxId = encryptValue(payload.taxId, { keyName: 'client_pii_key' });
    }
    if (typeof payload.email === 'string') {
      encrypted.email = encryptValue(payload.email, { keyName: 'client_pii_key' });
    }
    if (typeof payload.phone === 'string') {
      encrypted.phone = encryptValue(payload.phone, { keyName: 'client_pii_key' });
    }

    return encrypted;
  }
}
```

## 3. Decrypting Data in a Microservice

### 3.1 Decryption Helper

```typescript
import { createDecipheriv, scryptSync } from 'crypto';

function decryptValue(encrypted: EncryptedValue): string {
  const algorithm = encrypted.algorithm ?? 'AES-256-GCM';
  const keyMaterial = process.env[`ENCRYPTION_KEY_${encrypted.keyName.toUpperCase()}`];
  if (!keyMaterial) {
    throw new Error(`Missing decryption key for: ${encrypted.keyName}`);
  }

  const key = scryptSync(keyMaterial, 'salt', 32);
  const buffer = Buffer.from(encrypted.encryptedData, 'base64');
  const iv = buffer.subarray(0, 16);
  const authTag = buffer.subarray(16, 32);
  const ciphertext = buffer.subarray(32);

  const decipher = createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, undefined, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

### 3.2 Decrypting After Retrieval

```typescript
import { Injectable } from '@nestjs/common';
import { Client } from '@cobranza-app/entities';

@Injectable()
export class ClientDecryptionService {
  decryptClient(client: Client): Record<string, unknown> {
    const decrypted = { ...client } as Record<string, unknown>;

    if (client.fullName) {
      decrypted.fullName = decryptValue(client.fullName);
    }
    if (client.taxId) {
      decrypted.taxId = decryptValue(client.taxId);
    }
    if (client.email) {
      decrypted.email = decryptValue(client.email);
    }
    if (client.phone) {
      decrypted.phone = decryptValue(client.phone);
    }

    return decrypted;
  }
}
```

## 4. Generating and Using Hashes for Searchable Fields

### 4.1 Hash Helper

```typescript
import { createHash } from 'crypto';

function generateHash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
```

### 4.2 Hash Companion Columns

Searchable encrypted fields require a parallel hash column. The hash is computed from the **plain-text** value before encryption and stored alongside the encrypted payload.

```typescript
interface ClientCreateInput {
  fullName: string;
  taxId?: string;
  email?: string;
  phone?: string;
}

function buildClientPayload(input: ClientCreateInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    fullName: encryptValue(input.fullName, { keyName: 'client_pii_key' }),
  };

  if (input.taxId) {
    payload.taxId = encryptValue(input.taxId, { keyName: 'client_pii_key' });
    payload.taxIdHash = generateHash(input.taxId);
  }

  if (input.email) {
    payload.email = encryptValue(input.email, { keyName: 'client_pii_key' });
    payload.emailHash = generateHash(input.email);
  }

  if (input.phone) {
    payload.phone = encryptValue(input.phone, { keyName: 'client_pii_key' });
  }

  return payload;
}
```

### 4.3 Querying by Hash in TypeORM

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientEntity } from './client.entity';

@Injectable()
export class ClientRepositoryService {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepo: Repository<ClientEntity>,
  ) {}

  async findByTaxId(taxId: string): Promise<ClientEntity | null> {
    const taxIdHash = generateHash(taxId);
    return this.clientRepo.findOne({ where: { taxIdHash } });
  }

  async findByEmail(email: string): Promise<ClientEntity | null> {
    const emailHash = generateHash(email);
    return this.clientRepo.findOne({ where: { emailHash } });
  }
}
```

## 5. TypeORM Column Mapping for EncryptedValue

Map `EncryptedValue` fields as `jsonb` (PostgreSQL) or `json` (MySQL) columns in TypeORM:

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Client, EncryptedValue } from '@cobranza-app/entities';

@Entity()
export class ClientEntity implements Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  clientCode: string;

  @Column({ type: 'jsonb' })
  fullName: EncryptedValue;

  @Column({ type: 'jsonb', nullable: true })
  email: EncryptedValue | null;

  @Column({ type: 'varchar', nullable: true })
  emailHash: string | null;

  @Column({ type: 'jsonb', nullable: true })
  phone: EncryptedValue | null;

  @Column({ type: 'jsonb', nullable: true })
  taxId: EncryptedValue | null;

  @Column({ type: 'varchar', nullable: true })
  taxIdHash: string | null;

  // ... remaining fields
}
```

## 6. DTO Pattern for Encrypted Fields

The library's `CreateXxxDto` types reflect the **canonical encrypted entity shape**. In practice, microservices should define API-level input DTOs that accept plain strings and perform encryption at the service layer.

```typescript
// API-level input DTO (in the consuming microservice)
export class CreateClientRequest {
  fullName: string;
  taxId?: string;
  email?: string;
  phone?: string;
  companyId: string;
}

// Service layer transforms plain strings to EncryptedValue
@Injectable()
export class ClientService {
  async create(request: CreateClientRequest): Promise<Client> {
    const encryptedPayload = buildClientPayload(request);
    const entity = this.clientRepo.create(encryptedPayload);
    return this.clientRepo.save(entity);
  }
}
```

## 7. Key Environment Variables

```
ENCRYPTION_KEY_CLIENT_PII=<base64-or-hex-key>
ENCRYPTION_KEY_BANK_DATA=<base64-or-hex-key>
```

> Keys are never hardcoded. Each microservice loads its keys from `.env` at startup.

## 8. Algorithm and Versioning

- Default algorithm: `AES-256-GCM`.
- The `algorithm` field in `EncryptedValue` allows future algorithm changes.
- The `version` field supports key rotation without breaking existing records.
- When rotating keys, increment `version`, re-encrypt with the new key, and keep the old key available for reads until all data is migrated.

## Related Documentation

- [`security-encryption-policy.md`](security-encryption-policy.md) — Policy-level encryption rules and decisions
- [`README.md`](../README.md) — Library overview and entity list
```

### 2.2 Content Notes

- Use `Record<string, unknown>` instead of `any` to keep examples type-safe.
- The encryption/decryption helpers use Node.js `crypto` — no external dependencies.
- Examples show NestJS patterns (`@Injectable`, TypeORM) because that is the primary framework for this ecosystem.
- The hash helper uses SHA-256 to match the policy document.
- Include a TypeORM `jsonb` column mapping example because encrypted fields are stored as JSONB.
- Include the DTO pattern note because the library's `CreateXxxDto` types use `EncryptedValue`, but real-world API inputs use plain strings.

---

## 3. Style Consistency Checklist

Both documents must match the existing style:

| Convention | Applied |
|-----------|---------|
| Sentence case for headings | Yes |
| Backticks around code identifiers (`EncryptedValue`, `Client`) | Yes |
| Tables for structured data | Yes |
| `> **Important**` callouts for warnings | Yes |
| Code blocks with `typescript` language tag | Yes |
| Relative links to other docs files | Yes |
| No trailing blank lines at EOF | Yes |
| Max line length ~100 characters | Yes |

---

## 4. Verification Steps

1. After implementation, run `npx prettier --check README.md docs/encryption-usage-guide.md`.
2. Verify all internal links resolve:
   - `docs/encryption-usage-guide.md` from README
   - `security-encryption-policy.md` from usage guide
   - `../README.md` from usage guide
3. Verify all entity/field names match the current entity files exactly.
4. Verify all code snippets are syntactically valid TypeScript.

---

## 5. Git Actions

- Branch: `feat/encryption-and-location-types` (already created in Step 2 of global plan)
- Commit message for README update: `docs: add encryption section to README`
- Commit message for new guide: `docs: add encryption usage guide with code examples`

---

## 6. Deliverables Summary

| Deliverable | File Path | Description |
|-------------|-----------|-------------|
| Updated README section | `README.md` (lines ~40) | Encryption overview, entity table, flow diagram, hash pattern summary |
| New usage guide | `docs/encryption-usage-guide.md` | Encrypt/decrypt/hash helpers, TypeORM mapping, DTO pattern, env vars |

---

## 7. Mapping to TODO Task 5

From `.agent/todos/20260605/20260605-todo-1.md`:

> 5. Update documentation
>    - Update main `README.md` with encryption section explaining:
>      - Which entities have encrypted fields
>      - How encryption works across microservices
>      - The hash-column pattern for searchable fields
>    - Add examples of how to encrypt/decrypt in services in a /docs file
>    - Document recommended pattern for searchable encrypted fields (individual hash columns)

This plan covers all three bullet points.
