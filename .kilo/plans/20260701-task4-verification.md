# Task 4 — Verification Plan

Date: 2026-07-01
TODO: `.agent/todos/20260701/20260701-todo-0.md` — Task 4 (Verification)
Scope: Documentation-only changes verification. No source code modifications in this TODO cycle; verification confirms no source regressions and that doc snippets are syntactically valid TypeScript.

## Environment Prerequisites

- Node.js `>=22` (declared in `package.json` `engines`)
- npm `>=10`
- Dependencies installed (`npm install`) before running build/test
- All prior tasks (1, 2, 3) marked `[DONE]` in TODO file

## Commands to Run

Run in workspace root (`C:\projects\cobranza-app\entities`), sequentially:

1. `npm run build`
   - Script: `tsc -p tsconfig.build.json`
   - Compiles `src/` to `dist/` per `tsconfig.build.json`
   - Expected outcome: completes with zero TypeScript compile errors; emits `dist/` artifacts (`dist/index.js`, `dist/index.d.ts`, etc.)

2. `npm test`
   - Script: `vitest run`
   - Runs the Vitest test suite once in non-watch mode
   - Expected outcome: all tests pass; zero test failures; zero unhandled errors

3. (Optional, follow-up if build/test surface issues) `npm run typecheck`
   - Script: `tsc --noEmit`
   - Type-checks without emitting output
   - Expected outcome: zero type errors

## Expected Outcomes

- `npm run build`: exit code `0`; no diagnostic output errors; `dist/` regenerated
- `npm test`: exit code `0`; Vitest reports `N passed` with `0 failed`
- No source regressions introduced by documentation tasks (docs are not part of the compiled source path, so build/test should remain green regardless — this run confirms that invariant)

## Manual Review Checklist

Docs-only review (no automated doc-snippet compiler configured). Scan all code fences in the files below for syntactically valid TypeScript and consistency with current library API:

### `docs/usage-nestjs.md`
- [ ] TypeORM Entity Example: `DebtEntity` class decorators are valid (`@Entity`, `@PrimaryGeneratedColumn`, `@Column`, etc.) and the class `implements` library `Debt` interface
- [ ] NATS + JetStream section: `NestFactory.createMicroservice` with `Transport.NATS` and `natsOptions`/JetStream config are valid NestJS v10+ API
- [ ] Producer/publisher snippet uses library DTOs and valid `client.emit(...)`/`client.send(...)` calls
- [ ] Consumer subscriber uses `@EventPattern` / `@MessagePattern` and `class-validator` `validateOrReject` correctly
- [ ] DTO class `implements` the narrowed library DTO alias (e.g., `implements CreateDebtDto` with `Omit<...>` narrowing)
- [ ] All imports resolve to real library exports or documented external packages

### `docs/usage-angular.md`
- [ ] No remaining hand-rolled `Omit<Debt, 'id' | 'createdAt' | ... | 'debtCode'>` patterns
- [ ] Uses `CreateDebtDto` from the library with `Omit<CreateDebtDto, 'debtCode' | 'status'>` narrowing
- [ ] Uses `Omit<CreateClientDto, 'clientCode'>` (not `Omit<Client, ...>`)
- [ ] class-transformer + class-validator section: `plainToInstance`, `validate`, frontend usage is valid API
- [ ] Decorators referenced (`@IsString`, `@IsOptional`, etc.) match exports of `class-validator`
- [ ] All imports reference real library DTOs

### `README.md`
- [ ] Table of Contents present at top; all anchor links resolve to existing headings within file
- [ ] All DTO examples use broad-DTO + narrowing pattern (no raw `Omit<Entity, ...>` with field lists duplicating server-generated fields)
- [ ] Encryption section mentions `EncryptedValue | string | null` type union
- [ ] No outdated `name` field references in any code example
- [ ] Cross-reference links to `docs/usage-nestjs.md` and `docs/usage-angular.md` are valid relative paths
- [ ] No broken internal anchor links

### Cross-cutting
- [ ] No commented-out code blocks in doc snippets intended as runnable examples (per `no-commented-code` rule)
- [ ] No literal `\n` escape sequences in snippets (per `newline-prevention`)
- [ ] Code fence language tags (```ts, ```typescript) accurate

## Exit Criteria for Task 4.5 (Verification)

- `npm run build` exit `0`
- `npm test` exit `0`
- Manual review checklist items above all confirmed (or deviations documented as acceptable)
- If any failure: STOP, do not mark task `[DONE]`; return findings to caller for a new fix TODO/plan

## Out of Scope

- Running spell-check / link-check tooling (none configured in `package.json`); manual link check only
- Modifying source code (`src/`) to fix regressions — if a regression is found, escalate to caller; this step is verify-only
- Marking TODO task `[DONE]` — that is step 4.6, not this step