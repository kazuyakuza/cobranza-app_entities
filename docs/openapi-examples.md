# OpenAPI / Swagger Decorator Examples

How to extend `@cobranza-app/entities` interfaces with NestJS Swagger/OpenAPI decorators to generate rich API documentation. The library itself contains no decorators, so all Swagger annotations are added in the consuming project.

## 1. Extending an Entity with `@ApiProperty()`

Create a class that **implements** the library interface and add `@ApiProperty()` to each field:

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Debt as DebtInterface, DebtStatus, Currency, UUID, Decimal } from '@cobranza-app/entities';

export class Debt implements DebtInterface {
  @ApiProperty({ format: 'uuid', description: 'Primary key' })
  id: UUID;

  @ApiProperty({ format: 'uuid', description: 'Company that owns the debt' })
  companyId: UUID;

  @ApiProperty({ format: 'uuid', description: 'Client who owes the debt' })
  clientId: UUID;

  @ApiProperty({
    type: String,
    description: 'Debt concept / description',
    example: 'Monthly service fee — June 2026',
  })
  description: string;

  @ApiProperty({
    type: String,
    description: 'Original amount as decimal string (precision-safe)',
    example: '15000.00',
  })
  totalAmount: Decimal;

  @ApiProperty({ enum: Currency, enumName: 'Currency', description: 'Currency code' })
  currency: Currency;

  @ApiProperty({ type: Date, description: 'Due date' })
  dueDate: Date;

  @ApiProperty({ type: Date, description: 'Issue date' })
  issueDate: Date;

  @ApiProperty({ enum: DebtStatus, enumName: 'DebtStatus', description: 'Current debt status' })
  status: DebtStatus;

  @ApiPropertyOptional({ format: 'uuid', description: 'Linked invoice/receipt template' })
  invoiceTemplateId?: UUID;

  @ApiPropertyOptional({ type: String, description: 'Additional notes' })
  notes?: string;
}
```

Each `@ApiProperty()` declaration includes `description`, `example`, `format`, or `enum` options. These map directly to OpenAPI Schema Object properties and produce rich Swagger UI documentation.

## 2. DTOs with Swagger Decorators

Annotate create/update DTOs with `@ApiProperty()` and `@ApiPropertyOptional()` for accurate request body schemas:

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DebtStatus, Currency, UUID, Decimal } from '@cobranza-app/entities';

export class CreateDebtDto {
  @ApiProperty({ format: 'uuid', description: 'Company ID' })
  companyId: UUID;

  @ApiProperty({ format: 'uuid', description: 'Client ID' })
  clientId: UUID;

  @ApiProperty({ description: 'Debt concept / description', example: 'Service fee' })
  description: string;

  @ApiProperty({
    type: String,
    description: 'Original amount as decimal string',
    example: '25000.00',
  })
  totalAmount: Decimal;

  @ApiProperty({ enum: Currency, enumName: 'Currency' })
  currency: Currency;

  @ApiProperty({ type: String, description: 'Due date (ISO 8601)', example: '2026-07-15' })
  dueDate: string;

  @ApiProperty({ type: String, description: 'Issue date (ISO 8601)', example: '2026-06-01' })
  issueDate: string;

  @ApiPropertyOptional({ type: String, description: 'Additional notes' })
  notes?: string;
}
```

For `Decimal` fields, always annotate with `type: String` and include a description clarifying that the value is a decimal string — this prevents Swagger from generating a `number` schema for a field that must preserve precision.

## 3. Controller-Level Decorators

Use `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiParam`, and `@ApiQuery` to document endpoints:

```typescript
import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Debt, DebtStatus, UUID } from '@cobranza-app/entities';

@ApiTags('Debts')
@Controller('debts')
export class DebtController {
  @Get()
  @ApiOperation({ summary: 'List debts, optionally filtered by status' })
  @ApiQuery({ name: 'clientId', required: true, format: 'uuid' })
  @ApiQuery({ name: 'status', enum: DebtStatus, required: false })
  @ApiResponse({ status: 200, description: 'List of debts', type: [Debt] })
  findByClient(
    @Query('clientId') clientId: UUID,
    @Query('status') status?: DebtStatus,
  ): Promise<Debt[]> {
    // delegate to service
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single debt by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Debt found', type: Debt })
  @ApiResponse({ status: 404, description: 'Debt not found' })
  findOne(@Param('id') id: UUID): Promise<Debt> {
    // delegate to service
  }

  @Post()
  @ApiOperation({ summary: 'Create a new debt' })
  @ApiResponse({ status: 201, description: 'Debt created', type: Debt })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() dto: CreateDebtDto): Promise<Debt> {
    // delegate to service
  }
}
```

Each decorator maps to an OpenAPI Operation Object property. Using library types (`Debt`, `UUID`, `DebtStatus`) in `type`, `format`, and `enum` keeps the generated spec in sync with the SSOT.

## 4. Enum Documentation

To render enums properly in Swagger UI, use `enumName` alongside `enum`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { DebtStatus } from '@cobranza-app/entities';

export class DebtFiltersDto {
  @ApiProperty({
    enum: DebtStatus,
    enumName: 'DebtStatus',
    description: 'Filter debts by status',
    required: false,
  })
  status?: DebtStatus;
}
```

Setting `enumName: 'DebtStatus'` ensures the Swagger spec defines a **named enum schema** (`DebtStatus`) rather than inlining the values. In Swagger UI, this renders as a dropdown with all enum members. Without `enumName`, NestJS would inline the values, producing a less maintainable spec.

## 5. Reusable Swagger Schemas

NestJS Swagger provides `PartialType`, `OmitType`, and `PickType` to build variant DTOs without duplicating decorators. These utility types work with the annotated entity classes from Section 1:

```typescript
import { OmitType, PartialType } from '@nestjs/swagger';

// Create DTO: omit auto-generated and audit fields
export class CreateDebtDto extends OmitType(Debt, [
  'id',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'debtCode',
] as const) {}

// Update DTO: all fields optional
export class UpdateDebtDto extends PartialType(CreateDebtDto) {}

// Partial filter DTO for GET queries
export class DebtQueryDto extends PartialType(
  OmitType(Debt, ['id', 'createdAt', 'updatedAt'] as const),
) {}
```

`OmitType` and `PartialType` carry forward all `@ApiProperty()` decorators from the base `Debt` class, so you only define decorators once. This is the recommended approach for maintaining Swagger documentation alongside the library's SSOT interfaces.