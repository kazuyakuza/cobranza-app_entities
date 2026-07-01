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
