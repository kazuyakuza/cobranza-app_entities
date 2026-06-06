# Task 1: Encryption Infrastructure — Implementation Plan

**Plan Date**: 2026-06-06
**Corresponding TODO**: `.agent/todos/20260605/20260605-todo-1.md` (Task 1)
**Branch**: `feat/encryption-and-location-types`

---

## 1. File Creation Steps

### 1.1 Create `src/types/encrypted.ts`

Create the file with the following exact content. This file defines the `EncryptedValue` interface used across all microservices for encrypted field storage.

```typescript
/**
 * Encrypted value container used for fields that must be stored encrypted.
 *
 * This is a pure type contract — no runtime encryption logic lives in this
 * library. Microservices are responsible for encrypting before persisting and
 * decrypting after retrieval.
 */
export interface EncryptedValue {
  /** Base64-encoded ciphertext produced by the encrypting microservice. */
  encryptedData: string;

  /**
   * Logical name of the encryption key used.
   * Examples: `client_pii_key`, `bank_data_key`, `notification_body_key`.
   * The actual key material is resolved from environment variables at runtime.
   */
  keyName: string;

  /**
   * Cryptographic algorithm identifier.
   * Default and recommended value: `AES-256-GCM`.
   */
  algorithm?: string;

  /**
   * Key version for future rotation support.
   * Incremented when data is re-encrypted with a new key.
   */
  version?: number;
}
```

**Rationale**: Each property carries JSDoc so consumers understand the contract without reading external docs. The file is intentionally small (~30 lines) to stay well under the 200-line limit.

### 1.2 Create `/docs/security-encryption-policy.md`

Create the file with the following structure and content.

```markdown
# Security Encryption Policy

This document defines how sensitive data is encrypted, stored, and decrypted across the Cobranza App microservices.

---

## 1. Encryption Flow Between Microservices

1. **Ingress**: A microservice receives plain-text sensitive data via API, message queue, or event.
2. **Validation**: Data is validated against the entity DTO (e.g., `CreateClientDto`).
3. **Encryption**: The service encrypts the sensitive fields using its configured encryption key.
4. **Persistence**: The encrypted payload is stored as an `EncryptedValue` object (JSONB in the database).
5. **Egress**: When another microservice reads the entity, it receives the `EncryptedValue` and decrypts it using the same key name.

> **Important**: Encryption and decryption always happen inside the microservice boundary, never in the database or in transit without TLS.

## 2. Key Management (`.env`)

- Encryption keys are **never** hardcoded in source code.
- Each microservice loads its keys from environment variables at startup.
- Key names (e.g., `client_pii_key`) are defined in this library as constants, but the actual key material resides in `.env`.
- Recommended `.env` pattern:
  ```

  ENCRYPTION_KEY_CLIENT_PII=<base64-or-hex-key>
  ENCRYPTION_KEY_BANK_DATA=<base64-or-hex-key>

  ```
- Key rotation is planned via the `EncryptedValue.version` field; old and new keys must both be available during the rotation window.

## 3. When to Encrypt vs When to Hash

| Operation | Use Case | Result Type |
|-----------|----------|-------------|
| **Encrypt** | Store sensitive data that must be recoverable later (PII, emails, phone numbers, bank references). | `EncryptedValue` |
| **Hash** | Store a non-reversible digest for exact-match searching or deduplication (tax ID lookup, email lookup). | `string` (hex digest) |

### Rules
- If a field is sensitive **and** must be displayed or used in business logic later → **encrypt** it.
- If a field is sensitive **and** must support exact-match queries (e.g., `SELECT * WHERE taxIdHash = ?`) → add a **hash companion column**.
- Passwords and tokens are out of scope for `EncryptedValue`; they must be hashed with bcrypt / Argon2 and never encrypted.

## 4. Decryption Rules

1. A microservice may only decrypt fields for which it has the corresponding key in its environment.
2. Decryption failures must be logged and treated as errors; partial decryption (some fields missing keys) is allowed if the use case permits it.
3. Decrypted data must not be cached in logs or error messages.
4. When returning decrypted data to a client, apply the principle of least privilege: only expose fields the caller is authorized to see.

## 5. Hash Companion Columns

Searchable encrypted fields have a parallel `xxxHash` column:

- `Client.taxId` → encrypted; `Client.taxIdHash` → SHA-256 hex digest for lookups.
- `Client.email` → encrypted; `Client.emailHash` → SHA-256 hex digest for uniqueness checks.
- `Company.taxId` → encrypted; `Company.taxIdHash` → SHA-256 hex digest.
- `BankTransaction.reference` → encrypted; `BankTransaction.referenceHash` → SHA-256 hex digest.

> The hash is computed from the **plain-text** value before encryption and stored alongside the encrypted payload.

## 6. Algorithm and Versioning

- Default algorithm: `AES-256-GCM`.
- The `algorithm` field in `EncryptedValue` allows future algorithm changes.
- The `version` field supports key rotation without breaking existing records.
- When rotating keys, increment `version`, re-encrypt with the new key, and keep the old key available for reads until all data is migrated.

## 7. Example

### Encrypted field in a Client entity

```json
{
  "fullName": {
    "encryptedData": "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRlipTg9+MvKLJmzJ...",
    "keyName": "client_pii_key",
    "algorithm": "AES-256-GCM",
    "version": 1
  },
  "taxIdHash": "a3f5c8..."
}
```

```

---

## 2. Barrel Export Updates

### 2.1 Update `src/types/index.ts`

Current content:
```typescript
export { UUID, Money, Decimal, JsonData, DateString } from './common';
```

Add the following line **after** the existing export:

```typescript
export { EncryptedValue } from './encrypted';
```

New content:

```typescript
export { UUID, Money, Decimal, JsonData, DateString } from './common';
export { EncryptedValue } from './encrypted';
```

**Rationale**: Keeps the barrel export pattern consistent. `EncryptedValue` is an interface, but `export { ... }` syntax is already used for type aliases in the same file and is valid TypeScript.

### 2.2 `src/index.ts` — no change required

`src/index.ts` already contains `export * from './types';`, so the new type will be re-exported automatically through the existing barrel chain.

---

## 3. Documentation Structure Outline

The documentation file `/docs/security-encryption-policy.md` follows this outline:

| Section | Purpose |
|---------|---------|
| 1. Encryption Flow Between Microservices | Step-by-step flow from ingress to egress |
| 2. Key Management (`.env`) | How keys are named, stored, and rotated |
| 3. When to Encrypt vs When to Hash | Decision matrix and rules |
| 4. Decryption Rules | Authorization, error handling, and caching rules |
| 5. Hash Companion Columns | Pattern explanation with entity examples |
| 6. Algorithm and Versioning | Defaults and future-proofing strategy |
| 7. Example | JSON example of an encrypted field |

---

## 4. Edge Cases and Considerations

1. **Nullability**: Some entity fields using `EncryptedValue` are optional (`?:`) and may also be nullable (`\| null`). The interface itself does not enforce nullability; each entity declaration decides that.
2. **Algorithm default**: `AES-256-GCM` is the documented default, but the `algorithm` property is optional (`?`) so existing records without it are still valid.
3. **Key rotation window**: During rotation, a microservice must support reading multiple `version` values. The docs explicitly call this out.
4. **No runtime code**: This library contains only interfaces. The actual encryption/decryption and hashing logic lives in the consuming microservices.
5. **Hash algorithm choice**: SHA-256 is recommended for companion hash columns. The docs mention SHA-256 explicitly to avoid ad-hoc choices in different services.
6. **DTO design**: `CreateXxxDto` will likely accept plain strings for fields that are encrypted in the entity. This is addressed in Task 4 (DTO Adjustments), not here.
7. **JSON Schema representation**: `EncryptedValue` fields in JSON Schema will be represented as objects with `encryptedData`, `keyName`, `algorithm`, and `version` properties. This is addressed in Tasks 2–3.
8. **File size limits**: `src/types/encrypted.ts` will be ~30 lines. `/docs/security-encryption-policy.md` will be ~90 lines. Both well within limits.
9. **Self-documenting code**: Property names (`encryptedData`, `keyName`, `algorithm`, `version`) are descriptive. JSDoc provides additional context without being redundant.

---

## 5. Verification Checklist

- [ ] File `src/types/encrypted.ts` exists and contains the `EncryptedValue` interface exactly as specified.
- [ ] Every property in `EncryptedValue` has JSDoc.
- [ ] `src/types/encrypted.ts` has no commented-out code.
- [ ] `src/types/encrypted.ts` is under 200 lines.
- [ ] `src/types/index.ts` includes `export { EncryptedValue } from './encrypted';`.
- [ ] `src/index.ts` re-exports `EncryptedValue` through `export * from './types'` (no edit needed, just verify).
- [ ] File `/docs/security-encryption-policy.md` exists and contains all 7 sections.
- [ ] Docs explain encryption flow, key management, encrypt-vs-hash rules, decryption rules, hash companion columns, algorithm/versioning, and an example.
- [ ] `npm run build` or `npx tsc --noEmit` compiles without errors.
- [ ] No `.gitignore`-matching files are staged.
- [ ] All changes are committed with a meaningful message (e.g., `feat: add EncryptedValue type and encryption policy docs`).

---

## Files Changed Summary

| Action | File |
|--------|------|
| Create | `src/types/encrypted.ts` |
| Edit | `src/types/index.ts` (add one export line) |
| Create | `/docs/security-encryption-policy.md` |

---

## 6. Code Review Fix — 2026-06-06

### Issue Found

**File**: `docs/security-encryption-policy.md`
**Severity**: Minor (markdown rendering)
**Description**: Missing closing triple-backtick fence (` ``` `) at the end of the JSON code block in Section 7 (Example). The file ends with `}` on the last line but lacks the closing fence, which breaks markdown rendering.

### Fix Instruction

Add a closing triple-backtick line after the last line of `docs/security-encryption-policy.md` (after the `}` on the last line), so the JSON code block in Section 7 is properly terminated.

**Current** (last 3 lines of file):
```
  "taxIdHash": "a3f5c8..."
}
```

**Fixed** (last 4 lines of file):
```
  "taxIdHash": "a3f5c8..."
}
```

(Where the final line is `` ``` `` — the closing fence.)
