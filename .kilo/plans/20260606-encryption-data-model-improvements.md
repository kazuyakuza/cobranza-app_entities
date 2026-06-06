# Global Plan: Encryption & Data Model Improvements

**TODO File**: `.agent/todos/20260605/20260605-todo-1.md`
**Date**: 2026-06-06

## Overview

Six tasks covering encryption infrastructure, Location type introduction, entity encryption updates, DTO adjustments, JSON Schema updates, documentation, and CSV updates.

## JSON Schema Updates (Cross-Cutting)

Every entity change in this plan MUST be reflected in the corresponding JSON Schema file under `src/schemas/`. The affected schemas are:

| Schema File | Triggered By | Changes |
|---|---|---|
| `company.schema.json` | Task 2, Task 3 | `address` → `location` (Location type); encrypt `businessName`, `taxId`, `contact`, `phone`; add `taxIdHash`, `contactHash` |
| `user.schema.json` | Task 3 | encrypt `fullName`, `phone` |
| `client.schema.json` | Task 2, Task 3 | `address` → `location` (Location type); encrypt `fullName`, `taxId`, `email`, `phone`; add `taxIdHash`, `emailHash` |
| `bank-transaction.schema.json` | Task 3 | encrypt `reference`, `description`; add `referenceHash` |
| `bank-statement.schema.json` | Task 3 | encrypt `notes` |
| `notification.schema.json` | Task 3 | encrypt `to`, `from`, `subject`, `body` |
| `payment-proof.schema.json` | Task 3 | encrypt `notes` |

Schema updates happen within each task's implementation step, not as a separate task. Each task's 4.1 analysis plan MUST list the exact schema files and property changes required.

---

## Pre-Analysis: Key Design Decisions

### 1. `EncryptedValue` type placement
- New file: `src/types/encrypted.ts`
- Will export `EncryptedValue` interface and be re-exported from `src/types/index.ts`

### 2. `Location` type and field renaming
- New file: `src/types/location.ts`
- `address?: string` is renamed to `location?: Location` on Company and Client entities
- This is a **BREAKING CHANGE** — property name changes from `address` to `location`
- DTOs and JSON Schemas must also be updated

### 3. Encrypted field pattern
- Sensitive string fields become `EncryptedValue | null` (optional fields) or `EncryptedValue` (required fields)
- Searchable encrypted fields get separate `xxxHash: string | null` companion columns
- Primary strategy: the encrypting microservice sets the hash; decrypting microservices use keys from `.env`

### 4. Entities affected by encryption (from TODO)

| Entity | Fields to Encrypt | Hash Columns |
|--------|------------------|--------------|
| Company | `businessName`, `taxId`, `contact`, `phone`, `location` | `taxIdHash`, `contactHash` |
| User | `fullName`, `phone` | none (email already handled by auth) |
| Client | `fullName`, `taxId`, `email`, `phone`, `location` | `taxIdHash`, `emailHash` |
| BankTransaction | `reference`, `description` | `referenceHash` |
| BankStatement | `notes` | none |
| Notification | `to`, `from`, `subject`, `body` | none |
| PaymentProof | `notes` (evaluate) | none |

### 5. Entities needing review for sensitive data
- `Debt.notes`, `Invoice.notes`, `Receipt.notes`, `Payment.notes`, `PaymentAttempt.rejectionReason`, `PaymentMatch.notes` — these may contain incidental sensitive data but are primarily admin-facing operational fields.

---

## Step 2: Git Feature Branch Setup
**Sub-agent**: `implementer`

- Commit any unstaged files with meaningful message
- Switch to `main`, create branch `feat/encryption-and-location-types`
- Switch to new branch

---

## Step 3: Version Update
**Sub-agent**: `implementer`

- Bump version in `package.json` (minor bump since this is a feature: `0.0.1` → `0.1.0`)
- Commit as `chore: bump version to 0.1.0`

---

## Task 1: Encryption Infrastructure

### 4.1 Analysis & Planning
**Sub-agent**: `architect`

Generate a detailed implementation plan covering:
1. Create `src/types/encrypted.ts` with `EncryptedValue` interface (as specified in TODO), with JSDoc explaining encryption flow
2. Update `src/types/index.ts` to re-export `EncryptedValue`
3. Create `/docs/security-encryption-policy.md` explaining:
   - Encryption flow between microservices
   - Key management via `.env`
   - When to encrypt vs when to hash
   - Decryption rules
4. Save plan to `.kilo/plans/20260606-task-1-encryption-infra.md`

### 4.2 Implementation
**Sub-agent**: `implementer`

- Follow the task-1 plan; create files; commit changes

### 4.3 Code Review
**Sub-agent**: `code-reviewer`

- Review for correctness, completeness, rule compliance
- Generate fix plan if needed; assign fix to `implementer`

### 4.4 Documentation
**Sub-agent**: `docs-specialist`

- Ensure JSDoc on `EncryptedValue` is comprehensive
- Verify `/docs/security-encryption-policy.md` is clear

### 4.5 Verification
**Sub-agent**: `implementer`

- Verify plan adherence; commit any unstaged files

### 4.6 Task Completion
**Sub-agent**: `implementer`

- Mark task 1 as `[DONE]` in TODO file

---

## Task 2: Common Types & Structures

### 4.1 Analysis & Planning
**Sub-agent**: `architect`

Generate a detailed implementation plan covering:
1. Create `src/types/location.ts` with `Location` and `Address` interfaces (as specified in TODO)
2. Update `src/types/index.ts` to re-export `Location` and `Address`
3. Identify ALL files that reference `address` property on Company and Client:
   - Entity files: `company.entity.ts`, `client.entity.ts`
   - DTO files: `company.dto.ts`, `client.dto.ts`
   - JSON Schema files: `company.schema.json`, `client.schema.json`
4. Plan the rename from `address` to `location` and type change from `string` to `Location`
5. Plan JSON Schema changes for `company.schema.json` and `client.schema.json`: change `address` property to `location` with nested Location/Address schema
6. Save plan to `.kilo/plans/20260606-task-2-location-types.md`

### 4.2 Implementation
**Sub-agent**: `implementer`

- Follow the task-2 plan; update entity files, DTOs, AND JSON Schema files; commit changes

### 4.3 Code Review
**Sub-agent**: `code-reviewer`

- Review; generate fix plan if needed; assign fix to `implementer`

### 4.4 Documentation
**Sub-agent**: `docs-specialist`

- JSDoc on Location/Address types

### 4.5 Verification
**Sub-agent**: `implementer`

- Verify plan adherence; commit unstaged

### 4.6 Task Completion
**Sub-agent**: `implementer`

- Mark task 2 as `[DONE]` in TODO file

---

## Task 3: Entity Updates - Encryption

### 4.1 Analysis & Planning
**Sub-agent**: `architect`

Generate a detailed implementation plan covering:

**A. Company entity**
- `businessName?: string` → `businessName?: EncryptedValue | null`
- `taxId?: string` → `taxId?: EncryptedValue | null`
- `contact: string` → `contact: EncryptedValue`
- `phone?: string` → `phone?: EncryptedValue | null`
- `address?: string` → `location?: Location` (already done in Task 2)
- Add hash columns: `taxIdHash?: string | null`, `contactHash?: string | null`
- Update `company.dto.ts` accordingly
- Update `company.schema.json`

**B. User entity**
- `fullName?: string` → `fullName?: EncryptedValue | null`
- `phone?: string` → `phone?: EncryptedValue | null`
- Update `user.dto.ts`
- Update `user.schema.json`

**C. Client entity**
- `fullName: string` → `fullName: EncryptedValue`
- `taxId?: string` → `taxId?: EncryptedValue | null`
- `email?: string` → `email?: EncryptedValue | null`
- `phone?: string` → `phone?: EncryptedValue | null`
- `address?: string` → `location?: Location` (already done in Task 2)
- Add hash columns: `taxIdHash?: string | null`, `emailHash?: string | null`
- Update `client.dto.ts`
- Update `client.schema.json`

**D. BankTransaction entity**
- `reference?: string` → `reference?: EncryptedValue | null`
- `description: string` → `description: EncryptedValue`
- Add hash column: `referenceHash?: string | null`
- Update `bank-transaction.dto.ts`
- Update `bank-transaction.schema.json`

**E. BankStatement entity**
- `notes?: string` → `notes?: EncryptedValue | null`
- Update `bank-statement.dto.ts`
- Update `bank-statement.schema.json`

**F. Notification entity**
- `to: string` → `to: EncryptedValue`
- `from?: string` → `from?: EncryptedValue | null`
- `subject: string` → `subject: EncryptedValue`
- `body: string` → `body: EncryptedValue`
- Update `notification.dto.ts`
- Update `notification.schema.json`

**G. PaymentProof entity**
- `notes?: string` → `notes?: EncryptedValue | null`
- Update `payment-proof.dto.ts`
- Update `payment-proof.schema.json`

**H. Other entities review**
- Evaluate: Debt.notes, Invoice.notes, Receipt.notes, Payment.notes, PaymentAttempt.rejectionReason, PaymentMatch.notes
- Determine if any require encryption

**I. JSON Schema updates for ALL affected entities**
- For each entity modified (A-G above), update its corresponding JSON Schema file under `src/schemas/`
- EncryptedValue fields: schema must reflect the `{ encryptedData, keyName, algorithm?, version? }` object shape
- Hash fields: add as `type: "string", nullable: true` properties
- Location fields: embed the nested Location/Address schema
- Update `src/schemas/index.ts` if any new imports or re-exports are needed (likely none)

Save plan to `.kilo/plans/20260606-task-3-entity-encryption.md`

### 4.2 Implementation
**Sub-agent**: `implementer`

- Follow the task-3 plan; update ALL entity files, DTO files, AND JSON Schema files; commit changes

### 4.3 Code Review
**Sub-agent**: `code-reviewer`

- Review; generate fix plan if needed; max 3 cycles

### 4.4 Documentation
**Sub-agent**: `docs-specialist`

- Verify JSDoc `// Encrypted field` comments on all encrypted properties

### 4.5 Verification
**Sub-agent**: `implementer`

- Verify plan adherence; commit unstaged; run `npx tsc --noEmit` if possible

### 4.6 Task Completion
**Sub-agent**: `implementer`

- Mark task 3 as `[DONE]` in TODO file

---

## Task 4: DTO Adjustments

### 4.1 Analysis & Planning
**Sub-agent**: `architect`

Generate a detailed implementation plan covering:
1. Review ALL DTO files for all entities modified in tasks 2-3:
   - Ensure `CreateXxxDto` and `UpdateXxxDto` correctly handle new `Location` and `EncryptedValue` types
   - The current DTO pattern uses `Omit<Entity, 'id' | ...>` which should automatically inherit type changes, but `EncryptedValue` fields may need special handling in Create/Update contexts
2. Review ALL JSON Schema files for entities modified in tasks 2-3:
   - Ensure schema properties match the updated entity types
   - Verify `required` arrays are correct after type changes
   - Ensure nested object schemas (Location, EncryptedValue) are properly defined or referenced
3. Consider whether `CreateXxxDto` should accept plain strings for encrypted fields (to be encrypted by the service) or `EncryptedValue` directly
4. Review helper types and barrel exports

**Design Decision**: Create DTOs should likely accept plain strings for fields that get encrypted, while entity types use `EncryptedValue`. This needs discussion during analysis. A recommended approach:
   - Entity stays with `EncryptedValue` type
   - `CreateXxxDto` accepts plain strings (before encryption)
   - Response DTOs may return `EncryptedValue` (already encrypted)

Save plan to `.kilo/plans/20260606-task-4-dto-adjustments.md`

### 4.2 Implementation
**Sub-agent**: `implementer`

- Follow the task-4 plan; update DTO files AND JSON Schema files; commit changes

### 4.3 Code Review
**Sub-agent**: `code-reviewer`

- Review; generate fix plan if needed

### 4.4 Documentation
**Sub-agent**: `docs-specialist`

- Ensure DTO JSDoc comments explain encryption flow

### 4.5 Verification
**Sub-agent**: `implementer`

- Verify plan adherence; commit unstaged

### 4.6 Task Completion
**Sub-agent**: `implementer`

- Mark task 4 as `[DONE]` in TODO file

---

## Task 5: Documentation & Guidelines

### 4.1 Analysis & Planning
**Sub-agent**: `architect`

Generate a detailed implementation plan covering:
1. Update main `README.md` with encryption section explaining:
   - Which entities have encrypted fields
   - How encryption works across microservices
   - The hash-column pattern for searchable fields
2. Create `/docs/encryption-usage-guide.md` with code examples of:
   - How to encrypt data in a microservice
   - How to decrypt data in a microservice
   - How to generate and use hashes for searchable fields
   - Recommended import patterns from this library
3. Document the pattern for searchable encrypted fields (individual hash columns)

Save plan to `.kilo/plans/20260606-task-5-documentation.md`

### 4.2 Implementation
**Sub-agent**: `implementer`

- Follow the task-5 plan; update/create docs; commit changes

### 4.3 Code Review
**Sub-agent**: `code-reviewer`

- Review docs for accuracy

### 4.4 Documentation
**Sub-agent**: `docs-specialist`

**Note**: This IS the documentation task — the sub-agent should verify completeness

### 4.5 Verification
**Sub-agent**: `implementer`

- Verify plan adherence; commit unstaged

### 4.6 Task Completion
**Sub-agent**: `implementer`

- Mark task 5 as `[DONE]` in TODO file

---

## Task 6: Update CSV File

### 4.1 Analysis & Planning
**Sub-agent**: `architect`

Generate a detailed implementation plan covering:
1. Update `.agent/project-info/entities-definition.csv` for every property changed to `JSONB`:
   - For each encrypted property, change type from `String` to `JSONB`
   - Add to the `comments` column the JSON format: `{ encryptedData: string; keyName: string; algorithm?: string; version?: number; }`
2. For new hash columns, add new rows with type `String` and appropriate comments
3. For `address` → `location` rename, update the CSV row(s)
4. Map of all CSV changes needed (one change per affected row)

Save plan to `.kilo/plans/20260606-task-6-csv-update.md`

### 4.2 Implementation
**Sub-agent**: `implementer`

- Follow the task-6 plan; update CSV; commit changes

### 4.3 Code Review
**Sub-agent**: `code-reviewer`

- Review CSV changes for accuracy against entity changes

### 4.4 Documentation
**Sub-agent**: `docs-specialist`

- Not applicable (CSV is data); verify formatting consistency

### 4.5 Verification
**Sub-agent**: `implementer`

- Verify all CSV changes match entity updates from tasks 2-3

### 4.6 Task Completion
**Sub-agent**: `implementer`

- Mark task 6 as `[DONE]` in TODO file

---

## Step 5: TODO File Completion
**Sub-agent**: `implementer`

- Rename TODO file to `.agent/todos/20260605/20260605-todo-1-DONE.md`
- Commit all remaining changes in feature branch
- Merge feature branch to `main`
- Push `main` to `origin`

---

## Execution Order

Tasks must execute sequentially (each depends on prior tasks):
1. Task 1 (Encryption Infrastructure) — introduces `EncryptedValue` type
2. Task 2 (Location Types) — introduces `Location` type, renames `address` → `location`, updates `company.schema.json` + `client.schema.json`
3. Task 3 (Entity Updates) — applies encrypted types to entities, DTOs, and ALL 7 JSON Schema files (depends on Tasks 1 & 2)
4. Task 4 (DTO & Schema Adjustments) — cross-cutting review of DTOs and JSON Schemas for correctness (depends on Task 3)
5. Task 5 (Documentation) — writes docs (depends on Tasks 1-4)
6. Task 6 (CSV Update) — updates CSV (depends on Tasks 2-3)

Total sub-agent invocations: ~42 (2 + 6 × ~7 per task + 1 final step)
