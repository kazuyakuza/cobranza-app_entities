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