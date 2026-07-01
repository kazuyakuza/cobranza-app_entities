# Plan — Task 2: Update `docs/usage-angular.md` (broad-DTO + class-transformer/class-validator)

> Critical Workflow 4.1 per-task plan. Architect sub-agent output.
> Target file: `docs/usage-angular.md` (229 lines).

## Goal

Align `docs/usage-angular.md` with the broad-DTO + narrowing pattern (replace hand-rolled `Omit<Entity, ...>`) and add a new §6 demonstrating `class-transformer` + `class-validator` in Angular using library DTOs.

## Verified Facts (from codebase)

- `CreateDebtDto` (`src/entities/debt/debt.dto.ts:7`) = `Omit<Debt, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'>`. Still includes `debtCode` and `status`.
- `CreateClientDto` (`src/entities/client/client.dto.ts:11`) = `Omit<Client, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'>`. Still includes `clientCode`.
- Both DTOs are re-exported publicly: `src/entities/debt/index.ts:4` and `src/entities/client/index.ts:3` → `src/index.ts:4` (`export * from './entities'`).
- Available at consumer import: `import { CreateDebtDto, CreateClientDto, Debt, Client, UUID, DebtStatus, Currency, Debt } from '@cobranza-apps/entities';`
- `Debt` fields (entity): `companyId, clientId, debtScheduleId?, debtCode, description?, totalAmount, currency, dueDate, issueDate, dailyInterestRate?, status, notes?, extraData?, invoiceTemplateId?` + BaseEntity audit fields.
- `Client` fields (entity): `companyId, clientCode, fullName?, email?, emailHash?, phone?, location?, taxId?, taxIdHash?, extraData?, active, notes?` + BaseEntity audit fields.

## Boundaries (no source code changes)

This task edits documentation only. No `src/` files, no build, no tests, no git branches. Files touched: exactly `docs/usage-angular.md`.

---

## Change 1 — §1 "Typed Angular Service with HttpClient" (lines 5–38)

### 1a. Fix imports (line 13)

Replace:
```typescript
import { Debt, Client, UUID, DebtStatus } from '@cobranza-apps/entities';
```
With:
```typescript
import { CreateDebtDto, Debt, UUID } from '@cobranza-apps/entities';
```
Rationale: drop unused `Client` and `DebtStatus`; add `CreateDebtDto`.

### 1b. Replace hand-rolled Omit payload types (lines 15–16)

Replace:
```typescript
type CreateDebtPayload = Omit<Debt, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'debtCode'>;
type UpdateDebtPayload = Partial<CreateDebtPayload>;
```
With:
```typescript
type ApiCreateDebtDto = Omit<CreateDebtDto, 'debtCode' | 'status'>;
type ApiUpdateDebtDto = Partial<ApiCreateDebtDto>;
```
Rationale: `CreateDebtDto` already excludes all audit fields (incl. `deletedAt`/`deletedBy`); the API additionally forbids clients from setting `debtCode` (server-generated) and `status` (server-managed lifecycle).

### 1c. Update method signatures (lines 28 and 32)

Replace line 28:
```typescript
  createDebt(payload: CreateDebtPayload): Observable<Debt> {
```
With:
```typescript
  createDebt(payload: ApiCreateDebtDto): Observable<Debt> {
```

Replace line 32:
```typescript
  updateDebt(id: UUID, payload: UpdateDebtPayload): Observable<Debt> {
```
With:
```typescript
  updateDebt(id: UUID, payload: ApiUpdateDebtDto): Observable<Debt> {
```

### 1d. Update closing sentence (line 38)

Replace:
```
All method signatures use library types (`Debt`, `UUID`, `DebtStatus`) ensuring the frontend stays in sync with the SSOT.
```
With:
```
All method signatures use library DTOs (`CreateDebtDto`, `ApiCreateDebtDto`) and types (`Debt`, `UUID`) ensuring the frontend stays in sync with the SSOT. Server-reserved fields (`debtCode`, `status`) are narrowed out of the payload type, so the compiler rejects any attempt to send them.
```

---

## Change 2 — §3 "Reactive Forms with Typed Models" (lines 91–142)

### 2a. Fix imports (line 98)

Replace:
```typescript
import { Client, UUID } from '@cobranza-apps/entities';
```
With:
```typescript
import { CreateClientDto } from '@cobranza-apps/entities';
```
Rationale: drop `Client` (no longer used after switch to DTO); drop unused `UUID`; add `CreateClientDto`.

### 2b. Replace form payload type (line 100)

Replace:
```typescript
type ClientFormPayload = Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'clientCode'>;
```
With:
```typescript
type ApiCreateClientDto = Omit<CreateClientDto, 'clientCode'>;
```
Rationale: `CreateClientDto` already strips all audit fields; `clientCode` is server-generated and must not be client-supplied.

### 2c. Update `getPayload` return type and cast (lines 129–131)

Replace:
```typescript
  getPayload(): ClientFormPayload {
    return this.form.value as ClientFormPayload;
  }
```
With:
```typescript
  getPayload(): ApiCreateClientDto {
    return this.form.value as ApiCreateClientDto;
  }
```

### 2d. Update closing sentence (line 142)

Replace:
```
The `ClientFormPayload` type derived via `Omit<Client, ...>` ensures you never send audit fields to the API.
```
With:
```
The `ApiCreateClientDto` type derived via `Omit<CreateClientDto, 'clientCode'>` ensures you never send audit fields nor the server-generated `clientCode` to the API.
```

---

## Change 3 — New §6 "class-transformer + class-validator in Angular" (append after line 229)

Append the entire block below as a new top-level section at end of file.

```markdown
## 6. class-transformer + class-validator in Angular

For forms that must be validated and transformed before HTTP submission, use `class-transformer` and `class-validator` together with the library DTOs. A form class **implements** the narrowed library DTO type so the compiler guarantees shape parity, while runtime decorators enforce field-level rules.

### Installation

```bash
npm install class-transformer class-validator
```

These libraries require decorator metadata. Ensure `tsconfig.json` (or `tsconfig.app.json`) has:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

And, if not already present, import the reflect-metadata polyfill once at app bootstrap (e.g., `main.ts`):

```typescript
import 'reflect-metadata';
```

### Form class implementing `Omit<CreateDebtDto, 'debtCode' | 'status'>`

`CreateDebtDto` is a type alias (a structural `Omit`), not a runtime class, so it cannot be passed directly to `plainToInstance`. Instead, declare a local class that both **implements** the narrowed DTO type (for compile-time shape safety) and carries validation decorators:

```typescript
import { plainToInstance } from 'class-transformer';
import {
  IsUUID,
  IsEnum,
  IsNumber,
  IsDateString,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  CreateDebtDto,
  Currency,
  Debt,
  DebtStatus,
  UUID,
  JsonData,
} from '@cobranza-apps/entities';

type ApiCreateDebtDto = Omit<CreateDebtDto, 'debtCode' | 'status'>;

export class CreateDebtForm implements ApiCreateDebtDto {
  @IsUUID()
  companyId!: UUID;

  @IsUUID()
  clientId!: UUID;

  @IsUUID()
  @IsOptional()
  debtScheduleId?: UUID;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalAmount!: number;

  @IsEnum(Currency)
  currency!: Currency;

  @IsDateString()
  dueDate!: Date;

  @IsDateString()
  issueDate!: Date;

  @IsNumber({ maxDecimalPlaces: 4 })
  @IsOptional()
  dailyInterestRate?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  extraData?: JsonData;

  @IsUUID()
  @IsOptional()
  invoiceTemplateId?: UUID;
}
```

Note: `status` and `debtCode` are intentionally absent — `implements ApiCreateDebtDto` would error if they were added, because they are excluded from the narrowed DTO. This is exactly the compile-time guarantee we want.

### Service: validate then submit

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Debt } from '@cobranza-apps/entities';

export class DebtFormValidationError extends Error {
  constructor(readonly errors: ValidationError[]) {
    super('Debt form validation failed');
    this.name = 'DebtFormValidationError';
  }
}

@Injectable({ providedIn: 'root' })
export class DebtSubmissionService {
  constructor(private http: HttpClient) {}

  async submitDebt(formValue: Record<string, unknown>): Promise<Observable<Debt>> {
    const instance = plainToInstance(CreateDebtForm, formValue);
    const errors = await validate(instance);
    if (errors.length > 0) {
      throw new DebtFormValidationError(errors);
    }
    return this.http.post<Debt>('/api/debts', instance);
  }
}
```

The component calls `submitDebt(form.getRawValue())`; validation runs before any HTTP call, and the posted body is guaranteed to conform to `ApiCreateDebtDto`. Use the thrown `DebtFormValidationError.errors` to surface field-level messages back to the form (e.g., map each `ValidationError` to its `constraints`).
```

### §6 sanity checks

- `CreateDebtForm implements ApiCreateDebtDto`: every required member of `ApiCreateDebtDto` is declared; optional members (`debtScheduleId`, `description`, `dailyInterestRate`, `notes`, `extraData`, `invoiceTemplateId`) are declared optional. `status` and `debtCode` are absent → valid because they are excluded by the `Omit`.
- `JsonData` is exported via `src/types` → `src/index.ts:3` (`export * from './types'`).
- `validate` returns `Promise<ValidationError[]>`; `errors.length > 0` is a single-section boolean condition (project rule compliant).
- `post<Debt>` uses the full library `Debt` response type, mirroring the §1 service pattern.
- No `&&`/multi-clause conditions; method bodies stay shallow.

---

## Execution Steps (for Implementer)

1. Read `.gitignore` and run `git status` (Gitignore Compliance Rule). This is a docs-only edit; no install dirs involved.
2. Apply Change 1 (§1): lines 13, 15–16, 28, 32, 38 of `docs/usage-angular.md`.
3. Apply Change 2 (§3): lines 98, 100, 129–131, 142.
4. Apply Change 3: append new §6 block after line 229.
5. Verify no stray `CreateDebtPayload`, `UpdateDebtPayload`, `ClientFormPayload`, `Omit<Debt,`, `Omit<Client,` references remain in the file (search).
6. Verify new identifiers `ApiCreateDebtDto`, `ApiUpdateDebtDto`, `ApiCreateClientDto` appear consistently.
7. Commit on the feature branch:
   - Message: `docs(angular): replace hand-rolled Omit with broad-DTO narrowing; add class-transformer/class-validator section`
   - Stage only `docs/usage-angular.md`.

## Verification Steps (for Step 4.5)

- Grep `docs/usage-angular.md` for `Omit<Debt,` and `Omit<Client,` → expect 0 matches.
- Grep for `CreateDebtPayload`, `UpdateDebtPayload`, `ClientFormPayload` → expect 0 matches.
- Grep for `ApiCreateDebtDto`, `ApiUpdateDebtDto`, `ApiCreateClientDto` → each ≥ 2 matches.
- Confirm §6 contains install cmd, tsconfig snippet, `reflect-metadata` import, `CreateDebtForm` class, and `DebtSubmissionService`.
- Snippets are syntactically valid TypeScript (no runtime deps required to be installed in the library repo; this is documentation).
- No change to `src/`, so `npm run build` / `npm test` unaffected by this task (covered by Task 4 global verification).