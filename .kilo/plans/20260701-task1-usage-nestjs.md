# Plan — Task 1: Update `docs/usage-nestjs.md`

- **TODO file**: `.agent/todos/20260701/20260701-todo-0.md` (Task 1 — line 13/section)
- **Target file**: `docs/usage-nestjs.md`
- **Critical-Workflow step**: 4.1 Analysis & Planning (architect)
- **Goal**: Add a complete TypeORM `DebtEntity` example (§6) and a NATS + JetStream Microservices section (§7), aligned with the v0.5.0 broad-DTO philosophy already introduced in §0 of the doc.

---

## 1. Pre-Analysis & Technical Decisions

### 1.1 Current state of `docs/usage-nestjs.md`
- 198 lines, sections 0–5.
- §5 (TypeORM Repository Pattern) ends at line 198 with: "The `DebtEntity` class (with TypeORM decorators) lives in the consuming project. The library only provides the `Debt` interface contract."
- §0 already establishes the **broad-DTO philosophy** (`CreateDebtDto` omits only the 7 `BaseEntity` audit fields; narrow at the API boundary with `Omit<CreateDebtDto, 'debtCode' | 'status'>`).
- §3 already shows a `class-validator`-decorated `CreateDebtRequest` implementing the narrowed type — this is the canonical narrowing pattern; §7 consumer DTO must reuse it, not redefine a divergent one.

### 1.2 Confirmed library definitions (read directly from source)
- **`Debt`** (`src/entities/debt/debt.entity.ts`) extends `BaseEntity`:
  - `id: UUID`, `createdAt: Date`, `createdBy: UUID`, `updatedAt?: Date`, `updatedBy?: UUID`, `deletedAt?: Date`, `deletedBy?: UUID`
  - `companyId: UUID`, `clientId: UUID`, `debtScheduleId?: UUID`, `debtCode: string`, `description?: string`, `totalAmount: Decimal`, `currency: Currency`, `dueDate: Date`, `issueDate: Date`, `dailyInterestRate?: Decimal`, `status: DebtStatus`, `notes?: string`, `extraData?: JsonData`, `invoiceTemplateId?: UUID`
- **`CreateDebtDto`** (`src/entities/debt/debt.dto.ts`) = `Omit<Debt, 'id'|'createdAt'|'createdBy'|'updatedAt'|'updatedBy'|'deletedAt'|'deletedBy'>` (all 14 domain fields preserved, including `debtCode` and `status`).
- **`DebtStatus`** (`src/enums/debt-status.enum.ts`): `PENDING | OVERDUE | PARTIALLY_PAID | PAID | CANCELLED`.
- **`Currency`** (`src/enums/currency.enum.ts`): `ARS | USD`.
- **Exported via barrel** (`src/index.ts` → `src/entities/index.ts`): all enums, `Debt`, and `CreateDebtDto`/`UpdateDebtDto`/`DebtResponse` (DTOs exported as **types** via `export type { ... }`).

### 1.3 Technical & architecture decisions
1. **Insertion point**: append after §5 (line 198). New sections numbered **§6** and **§7** to preserve the existing 0–5 numbering and the doc's growing-section narrative (entity interface → DTO → validation → service → repository pattern → full entity class → microservice transport).
2. **§6 `DebtEntity`** must map **every** field of `Debt` (BaseEntity + domain), no field omitted. Decorators per the task spec:
   - `@Entity('debts')` (explicit table name avoids cross-service collisions; matches multi-tenant `companyId` scoping).
   - `@PrimaryGeneratedColumn('uuid')` for `id`.
   - `@CreateDateColumn()`, `@UpdateDateColumn()`, `@DeleteDateColumn()` for the lifecycle timestamps (auto-managed by TypeORM).
   - `@Column()` for required scalars (`company`-refs, `createdBy`, `debtCode`).
   - `@Column({ nullable: true })` for optional audit (`updatedBy`, `deletedBy`) and optional domain fields (`debtScheduleId`, `description`, `dailyInterestRate`, `notes`, `extraData`, `invoiceTemplateId`).
   - `@Column({ type: 'decimal' })` for `totalAmount` and `dailyInterestRate` (matches the library `Decimal = string` alias — keep string precision, no JS `number`).
   - `@Column({ type: 'enum', enum: DebtStatus })` for `status`, and `enum: Currency` for `currency`.
   - Dates (`dueDate`, `issueDate`) use `@Column({ type: 'timestamptz' })` since the interface types them as `Date`, not `DateString`.
   - `extraData` uses `@Column({ type: 'jsonb', nullable: true })` to match `JsonData`.
   - The class `implements Debt` — compile-time guarantee that every library field is mapped. `id`/`createdAt`/etc. are declared as class properties (TypeORM needs them on the instance), but marked `readonly` where the library treats them as managed.
3. **§7 NATS microservice** — pattern choices:
   - Transport: `Transport.NATS`, NOT a custom `ClientProxy`. Use `NestFactory.createMicroservice(AppModule, { transport: Transport.NATS, options: { url: process.env.NATS_URL ?? 'nats://localhost:4222' } })`.
   - Global `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true, transform: true` to enforce the narrowed contract and materialize class instances at the message boundary.
   - Producer: `ClientProxy` injected via `@Inject('NATS_CLIENT')` + `ClientsModule.register([{ name: 'NATS_CLIENT', transport: Transport.NATS }])`. Emit `CreateDebtDto` via `client.emit('debt.created', payload)` (event semantic — fire-and-forget). The producer sends the **broad** `CreateDebtDto`; the consumer narrows for validation.
   - Consumer: `@EventPattern('debt.created')` (not `@MessagePattern` — this is an event, not RPC). The handler DTO class `implements Omit<CreateDebtDto, 'debtCode' | 'status'>` and carries `class-validator` + `class-transformer` decorators. This **reuses** the exact narrowing from §0/§3 — consistency across the doc. The consumer then materializes `status = DebtStatus.PENDING` and generates `debtCode` internally (reinforcing *why* those two fields are omitted).
   - JetStream: provide a **second** snippet that subscribes via durable consumer (durable name, manual ack) using `nats` low-level client in an `OnModuleInit` lifecycle hook. Include an explicit **disclaimer**: "JetStream is optional; the plain core NATS `@EventPattern` above is the default. Use JetStream only when you need delivery guarantees / replay."
4. **Imports**: library types come from `@cobranza-apps/entities`. NestJS transport/clients from `@nestjs/microservices`. TypeORM decorators from `typeorm`. The snippet imports must be self-contained and compile-exact.
5. **Cross-doc consistency**: §7 producer/section references §3's narrowing (`Omit<CreateDebtDto, 'debtCode' | 'status'>`) so the doc tells one coherent story: §0 philosophy → §3 HTTP boundary DTO → §6 persistence → §7 event boundary DTO.
6. **No source-code changes**: this task only edits `docs/usage-nestjs.md`. No `src/` edits, no `package.json` dependency additions (NATS/JetStream snippets are illustrative — the consuming project owns those deps).
7. **Rule compliance**:
   - `max-lines-per-file` rule does **not** apply to docs (rule is `src/` only). The doc file may grow beyond 200 lines.
   - `markdown-generation-rule`: docs files may be created/modified by Plan Agent — this is generated by the architect sub-agent in step 4.1, which is permitted.
   - Snippets contain **no** commented-out code (only prose ellipsis `// ...persist via ...` placeholders, which are continuation hints, not disabled code).

### 1.4 Risks / edge cases handled
- `extraData` is `JsonData = Record<string, unknown>` → map to `jsonb`; passing `undefined` must not store `null` unless intended → `nullable: true` only where the interface marks optional.
- `dailyInterestRate` `Decimal(5,4)` precision chosen to match the JSDoc "0.0050 = 0.5% daily" example (max 0.9999). Document this choice with a one-line comment in the snippet.
- `createdBy` is **required** in `BaseEntity` but, in a microservice with a propagation context, may not yet be known at insert time → keep `@Column()` (non-nullable) and let the SQL layer reject if missing; do **not** silently make it optional in the entity (would drift from SSOT).
- JetStream durable name must be stable across restarts → hardcode `'debt-created-consumer'` constant.
- All snippets assume environment variable `NATS_URL` for portability across dev/prod.

---

## 2. High-Level Approach

1. Read current `docs/usage-nestjs.md` (done).
2. Confirm `Debt`/`CreateDebtDto`/enums (done).
3. Draft §6 markdown block (full `DebtEntity` class).
4. Draft §7 markdown block (NATS bootstrap → producer → consumer → JetStream optional).
5. Append both blocks after §5 (line 198) without modifying lines 1–198.
6. Verify post-edit structure (sections 0–7, code fences balanced, no commented code).
7. Commit with message `docs(usage-nestjs): add TypeORM entity example and NATS+JetStream microservice sections`.

---

## 3. Detailed, Atomic, Verifiable Steps

### Step 3.1 — Open the target file
- **Action**: `read` `docs/usage-nestjs.md` to confirm it still ends at line 198 with the §5 closing sentence.
- **Verify**: last visible line is `> The \`DebtEntity\` class (with TypeORM decorators) lives in the consuming project. The library only provides the \`Debt\` interface contract.`

### Step 3.2 — Append §6 (TypeORM Entity Example)
- **Tool**: `edit` with `oldString` = the §5 closing sentence (line 198, unique anchor) and `newString` = same sentence + the §6 block below. Do NOT rewrite the file.
- **Anchor `oldString`** (exact, unique in the file):
  ```
  The `DebtEntity` class (with TypeORM decorators) lives in the consuming project. The library only provides the `Debt` interface contract.
  ```
- **`newString`** = anchor + two blank lines + the full §6 markdown:

````markdown
The `DebtEntity` class (with TypeORM decorators) lives in the consuming project. The library only provides the `Debt` interface contract.


## 6. TypeORM Entity Example

§5 referenced `DebtEntity` without showing it. Below is a complete, persistence-ready implementation that **implements** the library `Debt` interface — a compile-time guarantee that every field of the SSOT is mapped. Place this class in the consuming NestJS project (e.g., `src/debts/infrastructure/debt.entity.ts`); the library never ships persistence decorators.

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Debt, DebtStatus, Currency, UUID, Decimal, JsonData } from '@cobranza-apps/entities';

@Entity('debts')
export class DebtEntity implements Debt {
  @PrimaryGeneratedColumn('uuid')
  id!: UUID;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'uuid' })
  createdBy!: UUID;

  @UpdateDateColumn()
  updatedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  updatedBy?: UUID;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  deletedBy?: UUID;

  @Column({ type: 'uuid' })
  companyId!: UUID;

  @Column({ type: 'uuid' })
  clientId!: UUID;

  @Column({ type: 'uuid', nullable: true })
  debtScheduleId?: UUID;

  @Column()
  debtCode!: string;

  @Column({ nullable: true })
  description?: string;

  // totalAmount is the library `Decimal` (string) to preserve precision.
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  totalAmount!: Decimal;

  @Column({ type: 'enum', enum: Currency })
  currency!: Currency;

  @Column({ type: 'timestamptz' })
  dueDate!: Date;

  @Column({ type: 'timestamptz' })
  issueDate!: Date;

  // Decimal(5,4): max 0.9999, matches dailyInterestRate JSDoc "0.0050 = 0.5%".
  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  dailyInterestRate?: Decimal;

  @Column({ type: 'enum', enum: DebtStatus })
  status!: DebtStatus;

  @Column({ nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  extraData?: JsonData;

  @Column({ type: 'uuid', nullable: true })
  invoiceTemplateId?: UUID;
}
```

Notes:
- `implements Debt` makes a forgotten column a **compile error**. If the library adds a field, the consuming project fails to build until the column is added — the SSOT enforcement propagates to the persistence layer.
- `decimal` columns keep the library `Decimal = string` alias; do **not** coerce to JS `number` — floating-point would corrupt monetary precision.
- `@CreateDateColumn` / `@UpdateDateColumn` / `@DeleteDateColumn` are auto-managed by TypeORM; do not assign them in `repository.create(dto)`.
- `createdBy` is required by `BaseEntity`, so the column is non-nullable. Resolve it from the authenticated user context before persisting.
````

### Step 3.3 — Append §7 (NATS + JetStream Microservices)
- **Tool**: `edit` with `oldString` = the last line of the §6 "Notes" bullet block (`- \`createdBy\` is required by \`BaseEntity\`, so the column is non-nullable. Resolve it from the authenticated user context before persisting.`) and `newString` = that same line + two blank lines + §7 block:

````markdown
- `createdBy` is required by `BaseEntity`, so the column is non-nullable. Resolve it from the authenticated user context before persisting.


## 7. NATS + JetStream Microservices

The broad-DTO philosophy (§0) shines over the wire: the library publishes the **broad** `CreateDebtDto`, and each consumer **narrows** it at its own boundary (§3). Below is a complete NATS transport setup.

### 7.1 Microservice bootstrap (`main.ts`)

```typescript
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        url: process.env.NATS_URL ?? 'nats://localhost:4222',
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  await app.listen();
}
bootstrap();
```

`transform: true` converts the inbound plain NATS payload into the validated class instance so the consumer DTO's `class-validator` decorators run.

### 7.2 Producer (publishing `CreateDebtDto`)

Register a `ClientProxy` and emit the **broad** library DTO. The producer does not narrow — that is the consumer's responsibility.

```typescript
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

export const NATS_CLIENT = 'NATS_CLIENT';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: NATS_CLIENT,
        transport: Transport.NATS,
        options: { url: process.env.NATS_URL ?? 'nats://localhost:4222' },
      },
    ]),
  ],
  providers: [
    {
      provide: 'DEBT_PRODUCER',
      useFactory: (client: ClientProxy) => new DebtProducer(client),
      inject: [NATS_CLIENT],
    },
  ],
  exports: ['DEBT_PRODUCER'],
})
export class DebtProducerModule {}
```

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateDebtDto } from '@cobranza-apps/entities';
import { NATS_CLIENT } from './debt-producer.module';

@Injectable()
export class DebtProducer {
  constructor(@Inject(NATS_CLIENT) private readonly client: ClientProxy) {}

  publishCreated(dto: CreateDebtDto): void {
    // Event semantic (fire-and-forget). Use client.send() for request/response RPC.
    this.client.emit('debt.created', dto);
  }
}
```

### 7.3 Consumer (validating with the narrowed DTO)

The consumer narrows exactly as in §0/§3: `Omit<CreateDebtDto, 'debtCode' | 'status'>`. Those two fields are **server-owned** — the consumer materializes them internally (`status` defaults to `DebtStatus.PENDING`, `debtCode` is generated from the sequence).

```typescript
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  IsEnum,
  IsUUID,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { CreateDebtDto, Currency, DebtStatus } from '@cobranza-apps/entities';

type ApiCreateDebtDto = Omit<CreateDebtDto, 'debtCode' | 'status'>;

export class DebtCreatedEvent implements ApiCreateDebtDto {
  @IsUUID()
  companyId!: string;

  @IsUUID()
  clientId!: string;

  @IsOptional()
  @IsUUID()
  debtScheduleId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  totalAmount!: string;

  @IsEnum(Currency)
  currency!: Currency;

  @IsDateString()
  dueDate!: string;

  @IsDateString()
  issueDate!: string;

  @IsOptional()
  @IsString()
  dailyInterestRate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  extraData?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  invoiceTemplateId?: string;
}

@Controller()
export class DebtConsumer {
  @EventPattern('debt.created')
  async handleDebtCreated(@Payload() event: DebtCreatedEvent): Promise<void> {
    // debtCode and status are intentionally absent from the payload contract.
    const materialized = {
      ...event,
      debtCode: this.generateDebtCode(event),
      status: DebtStatus.PENDING,
    };

    // Persist via DebtRepositoryService (§5) — implementation omitted for brevity.
    void materialized;
  }

  private generateDebtCode(event: Readonly<DebtCreatedEvent>): string {
    return `DEUD-${new Date(event.issueDate).getFullYear()}-${Date.now()}`;
  }
}
```

### 7.4 JetStream consumer (optional durability)

> **Disclaimer**: JetStream is **optional**. The `@EventPattern` consumer in §7.3 is the default and is sufficient for most services. Use JetStream only when you need delivery guarantees, replay, or durable subscriptions. This snippet assumes the consuming project installed the `nats` npm package and that the NATS server has JetStream enabled.

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { connect, NatsConnection, JsMsg, JetStreamClient } from 'nats';

const JETSTREAM_STREAM = 'DEBT_EVENTS';
const DURABLE_CONSUMER = 'debt-created-consumer';
const FILTER_SUBJECT = 'debt.created';

@Injectable()
export class DebtJetStreamConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DebtJetStreamConsumer.name);
  private nc!: NatsConnection;

  async onModuleInit(): Promise<void> {
    this.nc = await connect({
      servers: process.env.NATS_URL ?? 'nats://localhost:4222',
    });

    const js: JetStreamClient = this.nc.jetstream();
    const consumer = await js.consumers.get(JETSTREAM_STREAM, {
      durable_name: DURABLE_CONSUMER,
      filter_subject: FILTER_SUBJECT,
    });

    void this.consume(consumer);
  }

  private async consume(consumer: ReturnType<JetStreamClient['consumers']['get']>): Promise<void> {
    const messages = await consumer.consume();
    for await (const message of messages) {
      try {
        this.handle(message);
        message.ack(); // Manual ack — only after successful processing.
      } catch (error) {
        this.logger.error(`debt.created handling failed: ${(error as Error).message}`);
        message.nak(); // Requeue for retry.
      }
    }
  }

  private handle(message: JsMsg): void {
    const payload = JSON.parse(message.string()) as unknown;
    this.logger.log(`Received debt.created: ${JSON.stringify(payload)}`);
    // Audit-field assignment, persistence, etc.
  }

  async onModuleDestroy(): Promise<void> {
    await this.nc?.close();
  }
}
```

Key JetStream notes:
- `durable_name` must be **stable across restarts** — never derive it from a random/process id, or you lose replay.
- `message.ack()` is **manual**; call it only after the handler fully succeeds so the broker redelivers on crash.
- `message.nak()` explicitly signals failure and triggers redelivery per the stream's ack-policy.
````

### Step 3.4 — Verify the edited file
- **Tool**: `read` `docs/usage-nestjs.md` fully.
- **Verify**:
  - Section headers in order: `## 0.` → `## 5.` → `## 6. TypeORM Entity Example` → `## 7. NATS + JetStream Microservices` → `### 7.1` → `### 7.2` → `### 7.3` → `### 7.4`.
  - Code fences balanced (every opening ```` ``` ```` has a matching close).
  - No commented-out code inside snippets (the `// ...persist ...` / `// Audit-field assignment ...` lines are prose ellipsis continuations, not disabled statements).
  - No `name` field appears (the TODO's README consistency concern lists "no outdated `name` field references" — verify here too).
  - Every field of `Debt` is present in `DebtEntity` (cross-check the 21 fields: 7 BaseEntity + 14 Debt).
  - `DebtCreatedEvent` `implements Omit<CreateDebtDto, 'debtCode' | 'status'>` and only declares fields from `ApiCreateDebtDto` (no `debtCode`, no `status`, no `id`, no audit fields).
- **Tool**: `vscode-mcp-server_get_diagnostics_code` on `docs/usage-nestjs.md` (informational only — markdown diagnostics, but confirms no malformed fences/anchors).

### Step 3.5 — Git actions
- **Read** `.gitignore` + run `git status` (gitignore-compliance rule): confirm only `docs/usage-nestjs.md` is modified; nothing gitignored staged.
- **Stage**: `git add docs/usage-nestjs.md`.
- **Commit**: `git commit -m "docs(usage-nestjs): add TypeORM entity example and NATS+JetStream microservice sections"`.
- **No push** (push happens at the end of the Critical Workflow TODO-file step, to `origin` only).

### Step 3.6 — Documentation cross-reference check
- Confirm `README.md` cross-link to `docs/usage-nestjs.md` (if any) still resolves — no path renames in this task.
- No changes to other docs files in this task (Tasks 2/3 own `usage-angular.md` and `README.md`).

### Step 3.7 — Hand-off summary
- Return: plan file path, list of sections added, confirmation no `src/` files touched.

---

## 4. Verification Matrix (vs. TODO Task 1 sub-items)

| TODO Task 1 requirement | Satisfied by |
|---|---|
| 1. TypeORM `DebtEntity` class with decorators implementing `Debt` | §6 — `DebtEntity implements Debt`, `@Entity`/`@PrimaryGeneratedColumn('uuid')`/`@Column()`/`@Column({ nullable: true })`/`@Column({ type: 'decimal' })`/`@Column({ type: 'enum', enum: DebtStatus })`/`@CreateDateColumn`/`@UpdateDateColumn`/`@DeleteDateColumn` all present, every `Debt` field mapped |
| 2. NATS transport microservice | §7.1 — `NestFactory.createMicroservice` + `Transport.NATS` + `ValidationPipe` |
| 2. Producer sending library DTOs | §7.2 — `ClientProxy` via `ClientsModule`, `client.emit('debt.created', dto: CreateDebtDto)` |
| 2. Consumer validating with `class-validator` | §7.3 — `@EventPattern('debt.created')` handler + `DebtCreatedEvent` class with `class-validator` decorators |
| 2. DTO `implements` narrowed library DTO alias | §7.3 — `class DebtCreatedEvent implements Omit<CreateDebtDto, 'debtCode' | 'status'>` |
| JetStream durable + manual ack + disclaimer | §7.4 — durable name constant, `message.ack()`/`message.nak()`, explicit disclaimer block |

---

## 5. Out of Scope (explicitly NOT done in this task)
- No edits to `docs/usage-angular.md` (Task 2).
- No edits to `README.md` (Task 3).
- No edits to any `src/` file — library code is untouched.
- No `npm run build` / `npm test` for this task alone (TODO Task 4 owns the verification step for the whole TODO file).
- Architect sub-agent returns the plan path + summary to the Plan Agent for approval; no implementation is executed.