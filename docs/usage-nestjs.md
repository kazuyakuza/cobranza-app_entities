# NestJS Usage Examples

Integration patterns for consuming `@cobranza-apps/entities` in a NestJS microservice. These examples go beyond the basic TypeORM entity extension shown in the main README.

## 0. DTO Philosophy (Event-Driven Microservices)

In an event-driven microservice architecture, a `Create*Dto` shipped with the entities library serves as a **broad inter-service contract**. It omits only the 7 `BaseEntity` audit fields — `id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `deletedAt`, `deletedBy` — while intentionally preserving every domain-settable field (e.g., `debtCode`, `status`, `clientCode`).

This broad contract means any microservice can accept the full creation payload. Each API boundary then **narrows** the contract to only the fields relevant to its context:

```typescript
import { CreateDebtDto } from '@cobranza-apps/entities';

// Narrow at the API boundary — reject fields the endpoint should not set
type ApiCreateDebtDto = Omit<CreateDebtDto, 'debtCode' | 'status'>;
```

This pattern keeps the library contract stable while letting each service enforce its own constraints.

## 1. Importing Entities in a NestJS Controller

Use library types directly in controller signatures for type-safe request handling:

```typescript
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { Debt, DebtStatus, UUID } from '@cobranza-apps/entities';
import { CreateDebtRequest } from './dto/create-debt.request';

@Controller('debts')
export class DebtController {
  constructor(private readonly debtService: DebtService) {}

  @Get()
  findByClient(
    @Query('clientId') clientId: UUID,
    @Query('status') status?: DebtStatus,
  ): Promise<Debt[]> {
    return this.debtService.findByClient(clientId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: UUID): Promise<Debt> {
    return this.debtService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDebtRequest): Promise<Debt> {
    return this.debtService.create(dto);
  }
}
```

## 2. Creating DTOs by Extending Library Interfaces

Derive DTO types from library interfaces to stay in sync with the canonical model while excluding auto-generated or audit fields:

```typescript
import { CreateDebtDto, CreateClientDto } from '@cobranza-apps/entities';

type ApiCreateDebtDto = Omit<CreateDebtDto, 'debtCode' | 'status'>;
export type UpdateDebtDto = Partial<ApiCreateDebtDto>;

type ApiCreateClientDto = Omit<CreateClientDto, 'clientCode'>;
```

Using derived types ensures that when the library adds or removes fields, your DTOs reflect the change at compile time.

## 3. Validation Pipe Integration

DTOs defined as TypeScript types have no runtime impact. In the consuming NestJS project, create **class-based DTOs** that implement the narrowed type to enable `class-validator` and `class-transformer` decorators:

```typescript
import { IsEnum, IsUUID, IsString, IsOptional, IsDateString } from 'class-validator';
import { CreateDebtDto, Currency } from '@cobranza-apps/entities';

type ApiCreateDebtDto = Omit<CreateDebtDto, 'debtCode' | 'status'>;

export class CreateDebtRequest implements ApiCreateDebtDto {
  @IsUUID()
  companyId!: string;

  @IsUUID()
  clientId!: string;

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
  notes?: string;
}
```

Enable validation globally in `main.ts`:

```typescript
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.listen(3000);
}
bootstrap();
```

## 4. Typed Service Layer

The service layer returns library interfaces, keeping the contract aligned with the SSOT:

```typescript
import { Injectable } from '@nestjs/common';
import { Debt, DebtStatus, UUID, CreateDebtDto } from '@cobranza-apps/entities';

@Injectable()
export class DebtService {
  constructor(private readonly debtRepository: Repository<DebtEntity>) {}

  async findByClient(clientId: UUID, status?: DebtStatus): Promise<Debt[]> {
    const where: Record<string, unknown> = { clientId };
    if (status) {
      where.status = status;
    }
    return this.debtRepository.find({ where });
  }

  async findOne(id: UUID): Promise<Debt> {
    return this.debtRepository.findOneOrFail({ where: { id } });
  }

  async create(dto: CreateDebtDto): Promise<Debt> {
    const entity = this.debtRepository.create(dto);
    return this.debtRepository.save(entity);
  }
}
```

Filter debts using enum values:

```typescript
import { Debt, DebtStatus } from '@cobranza-apps/entities';

function filterOverdueDebts(debts: Debt[]): Debt[] {
  return debts.filter(hasOverdueStatus);
}

function hasOverdueStatus(debt: Debt): boolean {
  return debt.status === DebtStatus.OVERDUE;
}
```

## 5. TypeORM Repository Pattern

Inject `Repository<DebtEntity>` where `DebtEntity` is a TypeORM class that **implements** the library's `Debt` interface:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debt, DebtStatus, UUID } from '@cobranza-apps/entities';
import { DebtEntity } from './debt.entity';

@Injectable()
export class DebtRepositoryService {
  constructor(
    @InjectRepository(DebtEntity)
    private readonly debtRepository: Repository<DebtEntity>,
  ) {}

  async findPendingByCompany(companyId: UUID): Promise<Debt[]> {
    return this.debtRepository.find({
      where: { companyId, status: DebtStatus.PENDING },
    });
  }

  async findOverdueByCompany(companyId: UUID): Promise<Debt[]> {
    return this.debtRepository.find({
      where: { companyId, status: DebtStatus.OVERDUE },
    });
  }
}
```

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
import { ClientsModule, Transport, ClientProxy } from '@nestjs/microservices';

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
  IsUUID,
  IsString,
  IsOptional,
  IsDateString,
  IsObject,
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
  @IsObject()
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
import { connect, NatsConnection, JsMsg, JetStreamClient, Consumer } from 'nats';

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

  private async consume(consumer: Consumer): Promise<void> {
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
