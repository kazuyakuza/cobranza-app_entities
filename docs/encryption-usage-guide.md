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

  const encryptedData = Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, 'base64'),
  ]).toString('base64');

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
  encryptClientPayload(
    payload: Record<string, unknown>,
  ): Record<string, unknown> {
    const encrypted = { ...payload };

    if (typeof payload.fullName === 'string') {
      encrypted.fullName = encryptValue(payload.fullName as string, {
        keyName: 'client_pii_key',
      });
    }
    if (typeof payload.taxId === 'string') {
      encrypted.taxId = encryptValue(payload.taxId as string, {
        keyName: 'client_pii_key',
      });
    }
    if (typeof payload.email === 'string') {
      encrypted.email = encryptValue(payload.email as string, {
        keyName: 'client_pii_key',
      });
    }
    if (typeof payload.phone === 'string') {
      encrypted.phone = encryptValue(payload.phone as string, {
        keyName: 'client_pii_key',
      });
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

function buildClientPayload(
  input: ClientCreateInput,
): Record<string, unknown> {
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

```text
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