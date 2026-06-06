# Task 6 CSV Review — Fix Plan

**Date**: 2026-06-06
**Issue**: Encrypted property comments missing `EncryptedValue: ` label and period separator

## Problem

The plan specifies encrypted property comments should follow this format:

- **Non-empty original comment**: `<original>. EncryptedValue: { encryptedData: string; keyName: string; algorithm?: string; version?: number; }`
- **Empty original comment**: `{ encryptedData: string; keyName: string; algorithm?: string; version?: number; }`

Current CSV has: `<original> { encryptedData: string; keyName: string; algorithm?: string; version?: number; }` — missing the period and `EncryptedValue: ` label.

## Fix

For each of the 16 affected rows, update the `comments` column by inserting `. EncryptedValue:` between the original description text and the JSONB structure.

### Company (rows 6, 7, 9, 11)

| Line | Property | Current Comment | Fixed Comment |
|------|----------|-----------------|---------------|
| 6 | `business_name` | `Legal business name { encryptedData: ... }` | `Legal business name. EncryptedValue: { encryptedData: ... }` |
| 7 | `tax_id` | `Tax ID (e.g., CUIT, RUC, etc.) { encryptedData: ... }` | `Tax ID (e.g., CUIT, RUC, etc.). EncryptedValue: { encryptedData: ... }` |
| 9 | `contact` | `Email or contact information to be displayed to the end client { encryptedData: ... }` | `Email or contact information to be displayed to the end client. EncryptedValue: { encryptedData: ... }` |
| 11 | `phone` | `Contact phone { encryptedData: ... }` | `Contact phone. EncryptedValue: { encryptedData: ... }` |

### User (row 38)

| Line | Property | Current Comment | Fixed Comment |
|------|----------|-----------------|---------------|
| 38 | `full_name` | `Optional (can be completed later) { encryptedData: ... }` | `Optional (can be completed later). EncryptedValue: { encryptedData: ... }` |

### Client (rows 65, 66, 70)

| Line | Property | Current Comment | Fixed Comment |
|------|----------|-----------------|---------------|
| 65 | `full_name` | `Full name of the debtor { encryptedData: ... }` | `Full name of the debtor. EncryptedValue: { encryptedData: ... }` |
| 66 | `email` | `Highly recommended { encryptedData: ... }` | `Highly recommended. EncryptedValue: { encryptedData: ... }` |
| 70 | `tax_id` | `National ID / Tax ID of the end client (e.g., DNI, CUIT) { encryptedData: ... }` | `National ID / Tax ID of the end client (e.g., DNI, CUIT). EncryptedValue: { encryptedData: ... }` |

### PaymentProof (row 170)

| Line | Property | Current Comment | Fixed Comment |
|------|----------|-----------------|---------------|
| 170 | `notes` | `Additional notes entered by the client when uploading { encryptedData: ... }` | `Additional notes entered by the client when uploading. EncryptedValue: { encryptedData: ... }` |

### BankStatement (row 221)

| Line | Property | Current Comment | Fixed Comment |
|------|----------|-----------------|---------------|
| 221 | `notes` | `Notes (useful for parsing errors) { encryptedData: ... }` | `Notes (useful for parsing errors). EncryptedValue: { encryptedData: ... }` |

### BankTransaction (rows 235, 236)

| Line | Property | Current Comment | Fixed Comment |
|------|----------|-----------------|---------------|
| 235 | `description` | `Full bank description { encryptedData: ... }` | `Full bank description. EncryptedValue: { encryptedData: ... }` |
| 236 | `reference` | `Reference / operation / CBU / alias number { encryptedData: ... }` | `Reference / operation / CBU / alias number. EncryptedValue: { encryptedData: ... }` |

### Notification (rows 260, 261, 263, 264)

| Line | Property | Current Comment | Fixed Comment |
|------|----------|-----------------|---------------|
| 260 | `to` | `Destination email / phone / WhatsApp { encryptedData: ... }` | `Destination email / phone / WhatsApp. EncryptedValue: { encryptedData: ... }` |
| 261 | `from` | `Sender (e.g., no-reply@conciliador.app) { encryptedData: ... }` | `Sender (e.g., no-reply@conciliador.app). EncryptedValue: { encryptedData: ... }` |
| 263 | `subject` | `Final subject { encryptedData: ... }` | `Final subject. EncryptedValue: { encryptedData: ... }` |
| 264 | `body` | `Final content (HTML or text) { encryptedData: ... }` | `Final content (HTML or text). EncryptedValue: { encryptedData: ... }` |

## Verification

After fix, confirm:
- All 16 rows have `. EncryptedValue:` between original text and JSONB structure
- Rows with originally empty comments (User `phone` line 39, Client `phone` line 68) remain unchanged
- No other rows are modified