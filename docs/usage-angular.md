# Angular Usage Examples

Integration patterns for consuming `@cobranza-apps/entities` in an Angular application. These examples go beyond the basic `fetch`-based service shown in [the main README](../README.md).

## 1. Typed Angular Service with HttpClient

Use Angular's `HttpClient` (not `fetch`) for proper injection, interceptors, and testability, while keeping all return types aligned with library interfaces:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateDebtDto, Debt, UUID } from '@cobranza-apps/entities';

type ApiCreateDebtDto = Omit<CreateDebtDto, 'debtCode' | 'status'>;
type ApiUpdateDebtDto = Partial<ApiCreateDebtDto>;

@Injectable({ providedIn: 'root' })
export class DebtApiService {
  private readonly apiUrl = '/api/debts';

  constructor(private http: HttpClient) {}

  getDebtsByClient(clientId: UUID): Observable<Debt[]> {
    return this.http.get<Debt[]>(`${this.apiUrl}?clientId=${clientId}`);
  }

  createDebt(payload: ApiCreateDebtDto): Observable<Debt> {
    return this.http.post<Debt>(this.apiUrl, payload);
  }

  updateDebt(id: UUID, payload: ApiUpdateDebtDto): Observable<Debt> {
    return this.http.patch<Debt>(`${this.apiUrl}/${id}`, payload);
  }
}
```

All method signatures use library DTOs (`CreateDebtDto`, `ApiCreateDebtDto`) and types (`Debt`, `UUID`) ensuring the frontend stays in sync with the Single Source of Truth (SSOT). Server-reserved fields (`debtCode`, `status`) are narrowed out of the payload type, so the compiler rejects any attempt to send them.

## 2. Using Entities in an Angular Component

Inject the typed service into a component and leverage `async` pipe for subscription management:

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Debt, DebtStatus, UUID } from '@cobranza-apps/entities';
import { DebtApiService } from './debt-api.service';

@Component({
  selector: 'app-debt-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ul>
      <li *ngFor="let debt of debts$ | async">
        {{ debt.description }} — {{ debt.totalAmount }} ({{ debt.status }})
      </li>
    </ul>
  `,
})
export class DebtListComponent implements OnInit {
  debts$!: Observable<Debt[]>;

  constructor(private debtApi: DebtApiService) {}

  ngOnInit(): void {
    this.debts$ = this.debtApi.getDebtsByClient(this.clientId);
  }

  get clientId(): UUID {
    return '00000000-0000-0000-0000-000000000001';
  }
}
```

Filter overdue debts in component logic using the enum:

```typescript
import { Debt, DebtStatus } from '@cobranza-apps/entities';

function filterOverdue(debts: Debt[]): Debt[] {
  return debts.filter(isDebtOverdue);
}

function isDebtOverdue(debt: Debt): boolean {
  return debt.status === DebtStatus.OVERDUE;
}
```

## 3. Reactive Forms with Typed Models

Build type-safe `FormGroup` controls mapped to library entity fields:

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CreateClientDto } from '@cobranza-apps/entities';

type ApiCreateClientDto = Omit<CreateClientDto, 'clientCode'>;

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="fullName" placeholder="Full Name" />
      <input formControlName="email" placeholder="Email" />
      <input formControlName="phone" placeholder="Phone" />
      <input formControlName="taxId" placeholder="Tax ID" />
      <input formControlName="companyId" placeholder="Company ID" />
      <button type="submit">Save</button>
    </form>
  `,
})
export class ClientFormComponent {
  form: FormGroup = this.fb.group({
    fullName: [''],
    email: ['', Validators.email],
    phone: [''],
    taxId: [''],
    companyId: ['', Validators.required],
    active: [true],
  });

  constructor(private fb: FormBuilder) {}

  getPayload(): ApiCreateClientDto {
    return this.form.value as ApiCreateClientDto;
  }

  onSubmit(): void {
    if (this.form.valid) {
      const payload = this.getPayload();
      // submit payload
    }
  }
}
```

The `ApiCreateClientDto` type derived via `Omit<CreateClientDto, 'clientCode'>` ensures you never send audit fields nor the server-generated `clientCode` to the API.

## 4. Enum-Driven UI Patterns

Use library enums to drive dropdowns, badge colors, and conditional UI logic:

```typescript
import { DebtStatus } from '@cobranza-apps/entities';

const debtStatusOptions = Object.values(DebtStatus).map((value) => ({
  label: value,
  value,
}));
```

Template for a status dropdown:

```html
<select [formControl]="statusControl">
  <option *ngFor="let option of statusOptions" [value]="option.value">
    {{ option.label }}
  </option>
</select>
```

Badge color map for Angular Material:

```typescript
import { DebtStatus } from '@cobranza-apps/entities';

const statusColorMap: Record<DebtStatus, string> = {
  [DebtStatus.PENDING]: 'warn',
  [DebtStatus.OVERDUE]: 'accent',
  [DebtStatus.PARTIALLY_PAID]: 'primary',
  [DebtStatus.PAID]: 'primary',
  [DebtStatus.CANCELLED]: '',
};

function getStatusColor(status: DebtStatus): string {
  return statusColorMap[status];
}
```

Guard for button visibility:

```typescript
import { DebtStatus } from '@cobranza-apps/entities';

function canCancelDebt(status: DebtStatus): boolean {
  return status === DebtStatus.PENDING || status === DebtStatus.OVERDUE;
}
```

## 5. Type-Safe Route Params / Query Params

Type route parameters using the library's `UUID` alias instead of raw `string`:

```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { UUID, Debt } from '@cobranza-apps/entities';
import { DebtApiService } from './debt-api.service';

@Component({
  selector: 'app-debt-detail',
  standalone: true,
  template: `<pre>{{ debt | json }}</pre>`,
})
export class DebtDetailComponent implements OnInit {
  debt!: Debt;

  constructor(
    private route: ActivatedRoute,
    private debtApi: DebtApiService,
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(switchMap((params) => this.debtApi.getDebtsByClient(params['id'] as UUID)))
      .subscribe((debts) => {
        this.debt = debts[0];
      });
  }
}
```

Using `UUID` consistently across routing and services eliminates `any` from parameter chains.

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
import { plainToInstance, Type } from 'class-transformer';
import {
  IsUUID,
  IsEnum,
  IsDate,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  CreateDebtDto,
  Currency,
  Decimal,
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

  @IsString()
  totalAmount!: Decimal;

  @IsEnum(Currency)
  currency!: Currency;

  @Type(() => Date)
  @IsDate()
  dueDate!: Date;

  @Type(() => Date)
  @IsDate()
  issueDate!: Date;

  @IsString()
  @IsOptional()
  dailyInterestRate?: Decimal;

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
    // CreateDebtForm is the class defined in the snippet above
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
