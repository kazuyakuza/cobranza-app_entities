# Task 2 Plan: Common Types & Structures (Location / Address)

**Source**: Global plan `.kilo/plans/20260606-encryption-data-model-improvements.md`  
**Task**: Introduce `Location` and `Address` types, rename `address` → `location` on Company and Client entities, and update corresponding JSON Schemas.

---

## 1. Current State

### Entities with `address?: string`
- `src/entities/company/company.entity.ts` line 30: `address?: string;`
- `src/entities/client/client.entity.ts` line 27: `address?: string;`

### DTOs
- `src/entities/company/company.dto.ts`: uses `Omit<Company, ...>` and `extends Company` — will auto-inherit the rename/type change.
- `src/entities/client/client.dto.ts`: same — will auto-inherit.

### JSON Schemas
- `src/schemas/company.schema.json` line 13: `"address": { "type": "string" }`
- `src/schemas/client.schema.json` line 12: `"address": { "type": "string" }`

### Barrel exports
- `src/types/index.ts`: currently exports from `common` and `encrypted`; needs `Location` and `Address` re-exports.
- `src/entities/index.ts`: `export *` from entity folders — no change needed.
- `src/index.ts`: `export *` from `./types` — no change needed.
- `src/schemas/index.ts`: imports and re-exports schema objects — no structural change needed (schema objects themselves will be updated).

### Other references
- Grep across `src/` found only 4 matches for `address` (the two entity files and two schema files). No other entities, tests, or types reference the `address` field directly.

---

## 2. Plan Steps

### Step 2.1 — Create `src/types/location.ts`

Create new file with exact content:

```typescript
/**
 * Structured postal address.
 */
export interface Address {
  /** Primary street address line. */
  addressLine1: string;

  /** Secondary street address line (apartment, suite, floor, etc.). */
  addressLine2?: string;
}

/**
 * Location represents a physical place associated with an entity.
 * Contains a structured address plus optional geographic/administrative fields.
 */
export interface Location {
  /** Structured postal address. */
  address: Address;

  /** City or locality name. */
  city?: string;

  /** State, province, or region. */
  state?: string;

  /** Postal or ZIP code. */
  zipCode?: string;

  /** ISO country name or code. */
  country?: string;
}
```

### Step 2.2 — Update `src/types/index.ts`

Add re-exports for `Location` and `Address`:

**Before** (line 1-2):
```typescript
export { UUID, Money, Decimal, JsonData, DateString } from './common';
export { EncryptedValue } from './encrypted';
```

**After**:
```typescript
export { UUID, Money, Decimal, JsonData, DateString } from './common';
export { EncryptedValue } from './encrypted';
export { Location, Address } from './location';
```

### Step 2.3 — Update `src/entities/company/company.entity.ts`

**Before** (lines 1-2):
```typescript
import type { UUID } from '../../types/common';
import type { JsonData } from '../../types/common';
```

**After**:
```typescript
import type { UUID } from '../../types/common';
import type { JsonData } from '../../types/common';
import type { Location } from '../../types/location';
```

**Before** (lines 29-30):
```typescript
  /** Address. */
  address?: string;
```

**After**:
```typescript
  /** Physical location of the company. */
  location?: Location;
```

### Step 2.4 — Update `src/entities/client/client.entity.ts`

**Before** (lines 1-2):
```typescript
import type { UUID } from '../../types/common';
import type { JsonData } from '../../types/common';
```

**After**:
```typescript
import type { UUID } from '../../types/common';
import type { JsonData } from '../../types/common';
import type { Location } from '../../types/location';
```

**Before** (lines 26-27):
```typescript
  /** Address. */
  address?: string;
```

**After**:
```typescript
  /** Physical location of the client. */
  location?: Location;
```

### Step 2.5 — Verify DTOs (no code changes required)

- `company.dto.ts`:
  - `CreateCompanyDto = Omit<Company, 'id' | 'createdAt' | 'updatedAt'>` → automatically includes `location?: Location` instead of `address?: string`.
  - `UpdateCompanyDto = Partial<CreateCompanyDto>` → auto-inherits.
  - `CompanyResponse extends Company` → auto-inherits.
- `client.dto.ts`:
  - `CreateClientDto = Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>` → auto-inherits.
  - `UpdateClientDto = Partial<CreateClientDto>` → auto-inherits.
  - `ClientResponse extends Client` → auto-inherits.

No edits needed for DTO files.

### Step 2.6 — Update `src/schemas/company.schema.json`

**Before** (line 13):
```json
    "address": { "type": "string" },
```

**After** (replace the `address` property with `location`):
```json
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
```

> Note: `location` is NOT added to the `required` array because it is optional on the entity.

### Step 2.7 — Update `src/schemas/client.schema.json`

**Before** (line 12):
```json
    "address": { "type": "string" },
```

**After** (same nested structure as company schema):
```json
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
```

> Note: `location` is NOT added to the `required` array because it is optional on the entity.

---

## 3. Files NOT Changing

- `src/entities/company/company.dto.ts` — auto-inherits via `Omit`/`extends`.
- `src/entities/client/client.dto.ts` — auto-inherits via `Omit`/`extends`.
- `src/entities/company/index.ts` — no change (re-exports from `.entity` and `.dto`).
- `src/entities/client/index.ts` — no change.
- `src/entities/index.ts` — no change.
- `src/index.ts` — no change.
- `src/schemas/index.ts` — no change (schema object references stay the same).

---

## 4. Verification Checklist

- [ ] `src/types/location.ts` exists and exports `Address` and `Location`.
- [ ] `src/types/index.ts` re-exports `Location` and `Address`.
- [ ] `src/entities/company/company.entity.ts` has `import type { Location }` and property `location?: Location` (no `address` field remains).
- [ ] `src/entities/client/client.entity.ts` has `import type { Location }` and property `location?: Location` (no `address` field remains).
- [ ] `src/schemas/company.schema.json` has `location` property with nested `address` object; no `address` property remains.
- [ ] `src/schemas/client.schema.json` has `location` property with nested `address` object; no `address` property remains.
- [ ] `company.schema.json` `required` array does NOT include `location`.
- [ ] `client.schema.json` `required` array does NOT include `location`.
- [ ] No `address` string references remain in `src/entities/company/` or `src/entities/client/`.
- [ ] `npx tsc --noEmit` passes (if available).

---

## 5. Git Commit

Commit all changes with message:

```
feat: introduce Location and Address types, rename address to location

- Add src/types/location.ts with Address and Location interfaces
- Update Company and Client entities to use location?: Location
- Update company.schema.json and client.schema.json with nested location schema
```
