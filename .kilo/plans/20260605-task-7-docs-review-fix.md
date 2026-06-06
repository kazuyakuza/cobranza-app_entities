# Fix Plan: JSON-SCHEMA-USAGE.md Code Review

## Review Summary

Review of `JSON-SCHEMA-USAGE.md` against implementation plan (`.kilo/plans/20260605-task-7-docs.md`). Document is solid overall — all 22 schemas correctly listed, import paths verified against actual barrel exports, type mappings accurate, and referenced docs exist. The following issues require fixes:

---

## Warnings

### W1 - Mixed type/value imports in Section 3.1 (NestJS Swagger example)

**File**: `JSON-SCHEMA-USAGE.md`  
**Location**: Section 3.1, NestJS Swagger decorator example (approx. line 100-114)

**Issue**: The import combines type-only exports (`Debt` interface, `UUID` type alias, `Decimal` type alias) with runtime value exports (`DebtStatus` enum, `Currency` enum):

```typescript
import { Debt as DebtInterface, DebtStatus, Currency, UUID, Decimal } from '@cobranza-app/entities';
```

In projects using `verbatimModuleSyntax` or strict `isolatedModules`, TypeScript will emit an error for importing type-only symbols with a regular import statement.

**Fix**: Split into runtime and type-only imports:

```typescript
import { DebtStatus, Currency } from '@cobranza-app/entities';
import type { Debt as DebtInterface, UUID, Decimal } from '@cobranza-app/entities';
```

---

### W2 - Unused import `ApiPropertyOptional` in Section 3.1

**File**: `JSON-SCHEMA-USAGE.md`  
**Location**: Section 3.1, NestJS Swagger decorator example (approx. line 100)

**Issue**: `ApiPropertyOptional` is imported but never used in the shown code example. This is a lint violation and may confuse readers expecting its usage.

**Fix**: Either remove `ApiPropertyOptional` from the import, or add an example that uses it (e.g., on optional fields like `notes` or `dailyInterestRate`):

```typescript
@ApiPropertyOptional({ description: 'Additional notes' })
notes?: string;
```

---

### W3 - `Record<string, unknown>` type annotation in Angular form builder

**File**: `JSON-SCHEMA-USAGE.md`  
**Location**: Section 2.2, `buildFormFromSchema` function (approx. line 73)

**Issue**: The `group` variable is typed as `Record<string, unknown>` but `FormBuilder.group()` expects `{ [key: string]: any }`. With strict TypeScript settings, `unknown` values cannot be assigned to `any` parameter positions without explicit casts, and the form control config arrays `['', validators]` may not satisfy the `unknown` type constraint.

**Fix**: Change the type to `Record<string, any>`:

```typescript
const group: Record<string, any> = {};
```

---

## Suggestions

### S1 - Add `DateString` to Type Mapping Reference (Section 6)

**File**: `JSON-SCHEMA-USAGE.md`  
**Location**: Section 6, Type Mapping Reference table

**Issue**: The type mapping table lists `UUID`, `Decimal`/`Money`, `Date`, `JsonData`, `boolean`, `string`, and enums, but omits `DateString` which is defined in `src/types/common.ts` as `type DateString = string`. While not currently used in any schema, it's part of the project's type system and could appear in future schemas.

**Fix**: Add a row to the type mapping table:

```
| `DateString` | `{ "type": "string" }` (no format, or `format: date` for date-only) |
```

---

### S2 - Add Notes column to Available Schemas Reference (Section 7)

**File**: `JSON-SCHEMA-USAGE.md`  
**Location**: Section 7, Available Schemas Reference table

**Issue**: The implementation plan specified a "Notes" column (5 columns: Domain | Entity | File Name | Schema Title | Notes). The document has only 4 columns, omitting Notes.

**Fix**: Add a Notes column with relevant annotations. Suggested entries:
- `CompanyUser` — "Does not extend BaseEntity"
- `PaymentProof` — "Only has createdAt/createdBy, no updatedAt"
- `PaymentMatch` — "Does not extend BaseEntity; has matchedAt instead of createdAt"
- `Role` — "Minimal schema: id, name, description, createdAt only"

---

### S3 - Generalize `buildFormFromSchema` parameter type (Section 2.2)

**File**: `JSON-SCHEMA-USAGE.md`  
**Location**: Section 2.2, `buildFormFromSchema` function signature

**Issue**: `typeof debtSchema` restricts the function's parameter to only the Debt schema type. Since the function body uses only `schema.properties` and `schema.required` (generic JSON Schema features), the type could be more general.

**Fix**: Replace with an interface or inline type for any JSON Schema object:

```typescript
interface JsonSchemaObject {
  properties: Record<string, { format?: string; type?: string; enum?: string[] }>;
  required?: string[];
}

function buildFormFromSchema(schema: JsonSchemaObject, fb: FormBuilder): FormGroup {
```