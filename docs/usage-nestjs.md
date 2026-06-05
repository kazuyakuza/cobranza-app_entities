# NestJS Usage Examples

Integration patterns for consuming `@cobranza-app/entities` in a NestJS microservice. These examples go beyond the basic TypeORM entity extension shown in the main README.

## 1. Importing Entities in a NestJS Controller

Use library types directly in controller signatures for type-safe request handling:

```typescript
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { Debt, DebtStatus, UUID } from '@cobranza-app/entities';

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
  create(@Body() dto: CreateDebtDto): Promise<Debt> {
    return this.debtService.create(dto);
  }
}
```

## 2. Creating DTOs by Extending Library Interfaces

Derive DTO types from library interfaces to stay in sync with the canonical model while excluding auto-generated or audit fields:

```typescript
import { Debt, Client, UUID, Decimal, Currency } from '@cobranza-app/entities';

type AuditFields = 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy';

export type CreateDebtDto = Omit<Debt, AuditFields | 'debtCode'>;

export type UpdateDebtDto = Partial<CreateDebtDto>;

export type CreateClientDto = Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'clientCode' | 'updatedBy'>;
```

Using derived types ensures that when the library adds or removes fields, your DTOs reflect the change at compile time.

## 3. Validation Pipe Integration

DTOs defined as TypeScript types have no runtime impact. In the consuming NestJS project, create **class-based DTOs** to enable `class-validator` and `class-transformer` decorators:

```typescript
import { IsEnum, IsUUID, IsString, IsOptional, IsDateString } from 'class-validator';
import { DebtStatus, Currency } from '@cobranza-app/entities';

export class CreateDebtRequest {
  @IsUUID()
  companyId!: string;

  @IsUUID()
  clientId!: string;

  @IsString()
  description!: string;

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
import { Debt, DebtStatus, UUID } from '@cobranza-app/entities';

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
import { Debt, DebtStatus } from '@cobranza-app/entities';

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
import { Debt, DebtStatus, UUID } from '@cobranza-app/entities';
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