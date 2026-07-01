# Global Plan — Documentation Updates (Post-DTO Review)

## Source

`.agent/todos/20260701/20260701-todo-0.md`

## Overview

Align `docs/usage-nestjs.md`, `docs/usage-angular.md`, and `README.md` with the v0.5.0 broad-DTO philosophy. Add NATS+JetStream microservice patterns, Angular class-transformer/class-validator examples, and a README table of contents.

## Pre-Analysis

### Current State

- `docs/usage-nestjs.md` (198 lines): Has §0 broad-DTO philosophy, §1-5 controller/DTO/service/TypeORM patterns. Missing: detailed TypeORM entity decorator example, NATS+JetStream microservice patterns.
- `docs/usage-angular.md` (229 lines): Uses hand-rolled `Omit<Debt, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'debtCode'>` in §1 and `Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'clientCode'>` in §3. These contradict the broad-DTO philosophy. Missing: class-transformer/class-validator frontend examples.
- `README.md` (328 lines): No table of contents. Contains broad-DTO philosophy paragraph. DTO examples already use broad-DTO + narrowing. Encryption section already mentions `EncryptedValue | string | null`. No outdated `name` field references found. Cross-references to `docs/*.md` are accurate.

### Technical Decisions

1. **TypeORM Entity Example**: Show a complete `DebtEntity` class with `@Entity()`, `@PrimaryGeneratedColumn('uuid')`, `@Column()`, `@Column({ nullable: true })`, `@Column({ type: 'enum', enum: DebtStatus })`, `@CreateDateColumn()`, `@UpdateDateColumn()`, etc., implementing the library `Debt` interface. This demonstrates how consuming microservices map plain library interfaces to ORM-decorated classes.
2. **NATS+JetStream**: Use `@nestjs/microservices` with NATS transport (`Transport.NATS`). Show both a `ClientProxy` producer and an `@EventPattern()` consumer. The consumer's DTO class will `implements` the narrowed library DTO alias (e.g., `class CreateDebtEventDto implements Omit<CreateDebtDto, 'debtCode' | 'status'>`), which is valid TypeScript for object-type aliases.
3. **Angular class-transformer/class-validator**: Create a local class in the Angular project that `implements` the narrowed library DTO type alias, add `class-validator` and `class-transformer` decorators, then use `plainToInstance` and `validate` on outgoing payloads before HTTP submission. Incoming response validation is out of scope.
4. **README TOC**: Anchored markdown list linking to each `##` heading, placed immediately after the main title paragraph.

### Open Questions (Resolved)

**NATS+JetStream pattern scope**: Cover request-reply (`@MessagePattern`), pub/sub events (`@EventPattern`), and JetStream streams/consumers (ack, durable names). Include a disclaimer that these are **examples, not requirements**.

**class-transformer/class-validator in Angular**: Validate **outgoing payloads only** before HTTP submission. Incoming response validation is out of scope.

## Step-by-Step Plan

### Step 2 — Git Feature Branch Setup

**Agent**: `implementer`

- Run `git status`. Commit any unstaged files with meaningful message (per Gitignore Compliance Rule).
- Switch to `main`. If not on `main`, ask user to merge current branch.
- Create and switch to branch: `feat/docs-updates-post-dto-review`.

### Step 3 — Version Update

**Agent**: `implementer`

- No version bump needed; this is a documentation-only patch.

---

### Task 1 — Update `docs/usage-nestjs.md`

#### 4.1 Analysis & Planning

**Agent**: `architect`

- Confirm exact fields of `Debt` entity (`debt.entity.ts`) and `DebtStatus` enum to produce syntactically valid TypeORM snippet.
- Confirm `CreateDebtDto` is `Omit<Debt, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'>`.
- Save per-task plan to `.kilo/plans/20260701-task1-usage-nestjs.md`.

#### 4.2 Implementation

**Agent**: `implementer`

- **Add §6 — TypeORM Entity Example** after existing §5:
  - Show complete `DebtEntity` class implementing `Debt`.
  - Map all fields: `id` (uuid PK), `companyId`, `clientId`, `debtScheduleId` (nullable), `debtCode`, `description` (nullable), `totalAmount` (decimal), `currency`, `dueDate` (date), `issueDate` (date), `dailyInterestRate` (decimal, nullable), `status` (enum), `notes` (nullable), `extraData` (json, nullable), `invoiceTemplateId` (nullable).
  - Include `@Entity()`, `@PrimaryGeneratedColumn('uuid')`, `@Column()`, `@Column({ nullable: true })`, `@Column({ type: 'decimal' })`, `@Column({ type: 'enum', enum: DebtStatus })`, `@CreateDateColumn()`, `@UpdateDateColumn()`, plus optional `@DeleteDateColumn()` and `@Column({ nullable: true })` for soft-delete/audit fields.
  - Add note: "The library only provides the `Debt` interface; the TypeORM-decorated class lives in the consuming project."

- **Add §7 — NATS + JetStream Microservices** after new §6:
  - Sub-section: **Microservice Bootstrap** — show `main.ts` using `NestFactory.createMicroservice` with `Transport.NATS` and `ValidationPipe`.
  - Sub-section: **Producer (ClientProxy)** — show injecting `ClientNats`, sending `CreateDebtDto` via `client.emit('debt.created', payload)` or `client.send('debt.create', payload)`.
  - Sub-section: **Consumer (EventPattern)** — show `@EventPattern('debt.created')` handler. Define `class CreateDebtEventDto implements Omit<CreateDebtDto, 'debtCode' | 'status'>` with `class-validator` decorators (`@IsUUID`, `@IsString`, `@IsOptional`, `@IsEnum`, etc.). Use `@Payload()` decorator.
  - Sub-section: **JetStream Consumer** — show durable consumer config (`durableName`, `deliverGroup`, manual ack) with a disclaimer that these are patterns, not requirements.
  - Ensure all imports reference `@cobranza-apps/entities` and `@nestjs/microservices`.

#### 4.3 Code Review

**Agent**: `code-reviewer`

- Review for TypeScript syntax errors in snippets, broken markdown, and adherence to broad-DTO philosophy.
- If issues found, generate fix plan and assign to `implementer` (max 1 review cycle).

#### 4.4 Documentation

**Agent**: `docs-specialist`

- Ensure new sections have clear headings, inline comments explaining intent, and cross-links to README where appropriate.
- Verify JSDoc style comments in code snippets are minimal and self-documenting.

#### 4.5 Verification

**Agent**: `architect`

- Compare final file against per-task plan. Report any deviations.
- Confirm all code snippets are syntactically valid (no missing imports, correct decorators).

#### 4.6 Task Completion

**Agent**: `implementer`

- Append `[DONE]` to the Task 1 heading in `.agent/todos/20260701/20260701-todo-0.md`.
- Commit with meaningful message (e.g., `docs(usage-nestjs): add TypeORM entity and NATS+JetStream examples`).

---

### Task 2 — Update `docs/usage-angular.md`

#### 4.1 Analysis & Planning

**Agent**: `architect`

- Confirm `CreateDebtDto` omits BaseEntity fields and preserves `debtCode`/`status`.
- Confirm `CreateClientDto` omits BaseEntity fields and preserves `clientCode`.
- Save per-task plan to `.kilo/plans/20260701-task2-usage-angular.md`.

#### 4.2 Implementation

**Agent**: `implementer`

- **§1 — Replace hand-rolled `Omit<Debt, ...>` with broad-DTO narrowing**:
  - Change:
    ```typescript
    type CreateDebtPayload = Omit<Debt, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'debtCode'>;
    ```
    to:
    ```typescript
    type ApiCreateDebtDto = Omit<CreateDebtDto, 'debtCode' | 'status'>;
    ```
  - Change `UpdateDebtPayload = Partial<CreateDebtPayload>` to `ApiUpdateDebtDto = Partial<ApiCreateDebtDto>`.
  - Update all method signatures (`createDebt`, `updateDebt`) to use `ApiCreateDebtDto` and `ApiUpdateDebtDto`.
  - Add import for `CreateDebtDto` from `@cobranza-apps/entities`.

- **§3 — Replace hand-rolled `Omit<Client, ...>` with broad-DTO narrowing**:
  - Change:
    ```typescript
    type ClientFormPayload = Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'clientCode'>;
    ```
    to:
    ```typescript
    type ApiCreateClientDto = Omit<CreateClientDto, 'clientCode'>;
    ```
  - Update `getPayload()` return type and `onSubmit()` usage.
  - Add import for `CreateClientDto`.

- **Add §6 — class-transformer + class-validator in Angular**:
  - Explain that these libraries are typically backend tools but can be used in Angular for runtime outgoing payload validation.
  - Show installation: `npm install class-transformer class-validator`.
  - Show a class `CreateDebtRequestDto implements Omit<CreateDebtDto, 'debtCode' | 'status'>` decorated with `@IsUUID()`, `@IsString()`, `@IsOptional()`, `@IsEnum()`, etc. (imported from `class-validator`).
  - Show Angular service method:
    ```typescript
    import { plainToInstance } from 'class-transformer';
    import { validate } from 'class-validator';

    async createDebt(payload: unknown): Promise<Debt> {
      const instance = plainToInstance(CreateDebtRequestDto, payload);
      const errors = await validate(instance);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.map(e => e.toString()).join(', ')}`);
      }
      return this.http.post<Debt>(this.apiUrl, instance).toPromise();
    }
    ```
  - Add disclaimer: incoming response validation is out of scope; this pattern validates/transforms data before sending to the API.

#### 4.3 Code Review

**Agent**: `code-reviewer`

- Review for consistency with broad-DTO philosophy, correct `Omit` targets, and valid TypeScript syntax.
- If issues found, generate fix plan and assign to `implementer`.

#### 4.4 Documentation

**Agent**: `docs-specialist`

- Ensure new §6 has clear headings and concise explanations.
- Verify no broken links or inconsistent formatting.

#### 4.5 Verification

**Agent**: `architect`

- Compare final file against per-task plan. Report deviations.
- Confirm `CreateDebtDto` and `CreateClientDto` imports are present and `Omit` usage is correct.

#### 4.6 Task Completion

**Agent**: `implementer`

- Append `[DONE]` to Task 2 heading in TODO file.
- Commit with meaningful message (e.g., `docs(usage-angular): adopt broad-DTO pattern and add class-transformer/class-validator examples`).

---

### Task 3 — Update `README.md`

#### 4.1 Analysis & Planning

**Agent**: `architect`

- Enumerate all `##` headings to build TOC anchors.
- Identify any remaining `Omit<Debt, ...>` or `Omit<Client, ...>` patterns.
- Save per-task plan to `.kilo/plans/20260701-task3-readme.md`.

#### 4.2 Implementation

**Agent**: `implementer`

- **Add Table of Contents** immediately after the opening title paragraph (before `## About`).
  - Use anchored markdown links: `- [About](#about)`, `- [Types and Interfaces](#types-and-interfaces)`, `- [Data Encryption](#data-encryption)`, `- [Available Entities](#available-entities)`, `- [DTOs](#dtos)`, `- [JSON Schemas](#json-schemas)`, `- [Tech Stack](#tech-stack)`, `- [Installation & Usage](#installation--usage)`, `- [Usage Examples](#usage-examples)`, `- [Related Documentation](#related-documentation)`.
- **Consistency Review**:
  - Verify no `Omit<Debt, ...>` or `Omit<Client, ...>` examples remain. (Current scan: none found, but re-check after edits.)
  - Verify encryption section explicitly mentions `EncryptedValue | string | null`. (Already present; ensure it remains.)
  - Verify no outdated `name` field references. (Already clean.)
  - Verify cross-references to `docs/usage-nestjs.md`, `docs/usage-angular.md`, `docs/openapi-examples.md`, `docs/json-schema-usage.md`, `docs/encryption-usage-guide.md` are accurate and relative paths are correct.
  - Fix any broken or inconsistent links.

#### 4.3 Code Review

**Agent**: `code-reviewer`

- Review TOC formatting and link accuracy.
- Review for any unintended deletions or markdown regressions.
- If issues found, generate fix plan and assign to `implementer`.

#### 4.4 Documentation

**Agent**: `docs-specialist`

- Ensure TOC is well-formatted and headings are consistent.
- Verify README reads coherently with the new TOC inserted.

#### 4.5 Verification

**Agent**: `architect`

- Compare final file against per-task plan. Report deviations.
- Confirm TOC links match heading slugs (GitHub markdown anchor rules).

#### 4.6 Task Completion

**Agent**: `implementer`

- Append `[DONE]` to Task 3 heading in TODO file.
- Commit with meaningful message (e.g., `docs(readme): add table of contents and consistency review`).

---

### Task 4 — Verification

#### 4.1 Analysis & Planning

**Agent**: `architect`

- Confirm build/test commands (`npm run build`, `npm test`) and expected outcomes.
- Save per-task plan to `.kilo/plans/20260701-task4-verification.md`.

#### 4.2 Implementation

**Agent**: `implementer`

- Run `npm run build`. Confirm zero errors.
- Run `npm test`. Confirm zero regressions.
- If build/test tooling fails due to doc changes (should not affect source), document output.
- Manual review: scan all code snippets in `docs/usage-nestjs.md`, `docs/usage-angular.md`, and `README.md` for syntactic validity. Flag any snippets with missing imports, mismatched braces, or invalid TypeScript.

#### 4.3 Code Review

**Agent**: `code-reviewer`

- Review build/test logs. If failures are source-related (not doc-related), generate fix plan and assign to `implementer`.
- Review manual syntax check findings.

#### 4.4 Documentation

**Agent**: `docs-specialist`

- Not applicable for verification task; skip or mark N/A.

#### 4.5 Verification

**Agent**: `architect`

- Confirm build succeeded and tests passed.
- Confirm no source regressions introduced.
- Report any deviations from expected outcomes.

#### 4.6 Task Completion

**Agent**: `implementer`

- Append `[DONE]` to Task 4 heading in TODO file.
- Commit with meaningful message (e.g., `chore: verify no source regressions after doc updates`).

---

### Step 5 — TODO File Completion

**Agent**: `implementer`

- Ensure all changes are committed in feature branch `feat/docs-updates-post-dto-review`.
- Rename TODO file: `.agent/todos/20260701/20260701-todo-0.md` → `.agent/todos/20260701/20260701-todo-0-DONE.md`. Do **not** delete or modify content.
- Switch to `main`.
- Merge `feat/docs-updates-post-dto-review` into `main`.
- On success: delete feature branch.
- On failure: notify user.
- If `origin` remote is set, push `main` to `origin` only. Do NOT push to other remotes.
