# Task 6: Update CSV File — Implementation Plan

**Source**: Global Plan Task 6 (`.kilo/plans/20260606-encryption-data-model-improvements.md`)
**Target File**: `.agent/project-info/entities-definition.csv`
**Date**: 2026-06-06

## 1. JSONB Format String

For every encrypted property, append the following JSONB structure to the `comments` column:

```
{ encryptedData: string; keyName: string; algorithm?: string; version?: number; }
```

If the existing comment is empty, use the format string alone.
If the existing comment is non-empty, append it: `<existing comment>. EncryptedValue: { encryptedData: string; keyName: string; algorithm?: string; version?: number; }`

## 2. Type Changes: String/Text → JSONB

The following rows change their `type` column from `String` or `Text` to `JSONB`.

### 2.1 Company

| Line | Property | Current Type | New Type | Current Comment | New Comment |
|------|----------|--------------|----------|-----------------|-------------|
| 6 | `business_name` | `String` | `JSONB` | `Legal business name` | `Legal business name. EncryptedValue: { encryptedData: string; keyName: string; algorithm?: string; version?: number; }` |
| 7 | `tax_id` | `String` | `JSONB` | `Tax ID (e.g., CUIT, RUC, etc.)` | `Tax ID (e.g., CUIT, RUC, etc.). EncryptedValue: { encryptedData: string; keyName: string; algorithm?: string; version?: number; }` |
| 8 | `contact` | `String` | `JSONB` | `Email or contact information to be displayed to the end client` | `Email or contact information to be displayed to the end client. EncryptedValue: { encryptedData: string; keyName: string; algorithm?: string; version?: number; }` |
| 9 | `phone` | `String` | `JSONB` | `Contact phone` | `Contact phone. EncryptedValue: { encryptedData: string; keyName: string; algorithm?: string; version?: number; }` |

### 2.2 User

| Line | Property | Current Type | New Type | Current Comment | New Comment |
|------|----------|--------------|----------|-----------------|-------------|
| 36 | `full_name` | `String` | `JSONB` | `Optional (can be completed later)` | `Optional (can be completed later). EncryptedValue: { encryptedData: string; keyName: string; algorithm?: string; version?: number; }` |
| 37 | `phone` | `String` | `JSONB` | (empty) | `{ encryptedData: string; keyName: string; algorithm?: string; version?: number; }` |

### 2.3 Client

| Line | Property | Current Type | New Type | Current Comment | New Comment |
|------|----------|--------------|----------|-----------------|-------------|
| 63 | `full_name` | `String` | `JSONB` | `Full name of the debtor` | `Full name of the debtor. EncryptedValue: { encryptedData: string; keyName: string; algorithm?: string; version?: number; }` |
| 64 | `email` | `String` | `JSONB` | `Highly recommended` | `Highly recommended. EncryptedValue: { encryptedData: string; keyName: string; algorithm?: string; version?: number; }` |
| 65 | `phone` | `String` | `JSONB` | (empty) | `{ encryptedData: string; keyName: string; algorithm?: string; version?: number; }` |
| 67 | `tax_id` | `String` | `JSONB` | `National ID / Tax ID of the end client (e.g., DNI, CUIT)` | `National ID / Tax ID of the end client (e.g., DNI, CUIT). EncryptedValue: { encryptedData: string; keyName: string; algorithm?: string; version?: number; }` |

### 2.4 BankTransaction

| Line | Property | Current Type | New Type | Current Comment | New Comment |
|------|----------|--------------|----------|-----------------|-------------|
| 231 | `description` | `String` | `JSONB` | `Full bank description` | `Full bank description. EncryptedValue: { encryptedData: string; keyName: string; algorithm?: string; version?: number; }` |
| 232 | `reference` | `String` | `JSONB` | `Reference / operation / CBU / alias number` | `Reference / operation / CBU / alias number. EncryptedValue: { encryptedData: string; keyName: string; algorithm?: string; version?: number; }` |

### 2.5 BankStatement

| Line | Property | Current Type | New Type | Current Comment | New Comment |
|------|----------|--------------|----------|-----------------|-------------|
| 217 | `notes` | `Text` | `JSONB` | `Notes (useful for parsing errors)` | `Notes (useful for parsing errors). EncryptedValue: { encryptedData: string; keyName: string; algorithm?: string; version?: number; }` |

### 2.6 Notification

| Line | Property | Current Type | New Type | Current Comment | New Comment |
|------|----------|--------------|----------|-----------------|-------------|
| 255 | `to` | `String` | `JSONB` | `Destination email / phone / WhatsApp` | `Destination email / phone / WhatsApp. EncryptedValue: { encryptedData: string; keyName: string; algorithm?: string; version?: number; }` |
| 256 | `from` | `String` | `JSONB` | `Sender (e.g., no-reply@conciliador.app)` | `Sender (e.g., no-reply@conciliador.app). EncryptedValue: { encryptedData: string; keyName: string; algorithm?: string; version?: number; }` |
| 258 | `subject` | `String` | `JSONB` | `Final subject` | `Final subject. EncryptedValue: { encryptedData: string; keyName: string; algorithm?: string; version?: number; }` |
| 259 | `body` | `Text` | `JSONB` | `Final content (HTML or text)` | `Final content (HTML or text). EncryptedValue: { encryptedData: string; keyName: string; algorithm?: string; version?: number; }` |

### 2.7 PaymentProof

| Line | Property | Current Type | New Type | Current Comment | New Comment |
|------|----------|--------------|----------|-----------------|-------------|
| 166 | `notes` | `Text` | `JSONB` | `Additional notes entered by the client when uploading` | `Additional notes entered by the client when uploading. EncryptedValue: { encryptedData: string; keyName: string; algorithm?: string; version?: number; }` |

## 3. Hash Column Insertions

Insert new rows immediately after the property they hash. All hash columns are type `String`, required `No`.

### 3.1 Company

- **Insert after line 7 (`tax_id`)**:
  `,,tax_id_hash,String,No,Hash of tax_id for searchability`
- **Insert after line 8 (`contact`)**:
  `,,contact_hash,String,No,Hash of contact for searchability`

### 3.2 Client

- **Insert after line 64 (`email`)**:
  `,,email_hash,String,No,Hash of email for searchability`
- **Insert after line 67 (`tax_id`)**:
  `,,tax_id_hash,String,No,Hash of tax_id for searchability`

### 3.3 BankTransaction

- **Insert after line 232 (`reference`)**:
  `,,reference_hash,String,No,Hash of reference for searchability`

## 4. Address → Location Renames

The `address` property on Company and Client is renamed to `location` and its type changes from `String` to `JSONB` (structured object). These rows do **not** receive the encrypted JSON format comment because `location` is not an encrypted field.

### 4.1 Company

| Line | Property | Current | New |
|------|----------|---------|-----|
| 10 | `address` → `location` | `,,address,String,No,Address` | `,,location,JSONB,No,Structured location object (address, city, province, country, postalCode)` |

### 4.2 Client

| Line | Property | Current | New |
|------|----------|---------|-----|
| 66 | `address` → `location` | `,,address,String,No,` | `,,location,JSONB,No,Structured location object (address, city, province, country, postalCode)` |

## 5. CSV Quoting Notes

- Comments that contain commas MUST be wrapped in double quotes (`"..."`).
- The JSONB format string itself contains no commas (uses semicolons), so it does not require quoting on its own.
- When appending the JSONB format to an existing comment that contains commas, the entire combined comment must be quoted.

## 6. Summary of All Changes

| # | Action | Entity | Property / New Row | Line |
|---|--------|--------|-------------------|------|
| 1 | Type change + comment | Company | `business_name` | 6 |
| 2 | Type change + comment | Company | `tax_id` | 7 |
| 3 | Insert row | Company | `tax_id_hash` | after 7 |
| 4 | Type change + comment | Company | `contact` | 8 |
| 5 | Insert row | Company | `contact_hash` | after 8 |
| 6 | Type change + comment | Company | `phone` | 9 |
| 7 | Rename + type change | Company | `address` → `location` | 10 |
| 8 | Type change + comment | User | `full_name` | 36 |
| 9 | Type change + comment | User | `phone` | 37 |
| 10 | Type change + comment | Client | `full_name` | 63 |
| 11 | Type change + comment | Client | `email` | 64 |
| 12 | Insert row | Client | `email_hash` | after 64 |
| 13 | Type change + comment | Client | `phone` | 65 |
| 14 | Rename + type change | Client | `address` → `location` | 66 |
| 15 | Type change + comment | Client | `tax_id` | 67 |
| 16 | Insert row | Client | `tax_id_hash` | after 67 |
| 17 | Type change + comment | PaymentProof | `notes` | 166 |
| 18 | Type change + comment | BankStatement | `notes` | 217 |
| 19 | Type change + comment | BankTransaction | `description` | 231 |
| 20 | Type change + comment | BankTransaction | `reference` | 232 |
| 21 | Insert row | BankTransaction | `reference_hash` | after 232 |
| 22 | Type change + comment | Notification | `to` | 255 |
| 23 | Type change + comment | Notification | `from` | 256 |
| 24 | Type change + comment | Notification | `subject` | 258 |
| 25 | Type change + comment | Notification | `body` | 259 |

**Total**: 25 discrete changes (20 modifications + 5 insertions).
