# Angular Usage Examples

Integration patterns for consuming `@cobranza-apps/entities` in an Angular application. These examples go beyond the basic `fetch`-based service shown in the main README.

## 1. Typed Angular Service with HttpClient

Use Angular's `HttpClient` (not `fetch`) for proper injection, interceptors, and testability, while keeping all return types aligned with library interfaces:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Debt, Client, UUID, DebtStatus } from '@cobranza-apps/entities';

type CreateDebtPayload = Omit<Debt, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'debtCode'>;
type UpdateDebtPayload = Partial<CreateDebtPayload>;

@Injectable({ providedIn: 'root' })
export class DebtApiService {
  private readonly apiUrl = '/api/debts';

  constructor(private http: HttpClient) {}

  getDebtsByClient(clientId: UUID): Observable<Debt[]> {
    return this.http.get<Debt[]>(`${this.apiUrl}?clientId=${clientId}`);
  }

  createDebt(payload: CreateDebtPayload): Observable<Debt> {
    return this.http.post<Debt>(this.apiUrl, payload);
  }

  updateDebt(id: UUID, payload: UpdateDebtPayload): Observable<Debt> {
    return this.http.patch<Debt>(`${this.apiUrl}/${id}`, payload);
  }
}
```

All method signatures use library types (`Debt`, `UUID`, `DebtStatus`) ensuring the frontend stays in sync with the SSOT.

## 2. Using Entities in an Angular Component

Inject the typed service into a component and leverage `async` pipe for subscription management:

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { Client, UUID } from '@cobranza-apps/entities';

type ClientFormPayload = Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'clientCode'>;

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

  getPayload(): ClientFormPayload {
    return this.form.value as ClientFormPayload;
  }

  onSubmit(): void {
    if (this.form.valid) {
      const payload = this.getPayload();
      // submit payload
    }
  }
}
```

The `ClientFormPayload` type derived via `Omit<Client, ...>` ensures you never send audit fields to the API.

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
