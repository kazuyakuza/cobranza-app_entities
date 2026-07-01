# Task 1 Plan — Audit & Revert DTOs

## Research Findings

- `BaseEntity` (in `src/interfaces/base-entity.interface.ts`) defines 7 audit fields: `id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `deletedAt`, `deletedBy`. No `BaseAuditFields` alias exists yet.
- All 7 target DTOs confirmed to omit extra fields beyond the 7 audit fields.
- All 22 entity DTOs use `Update*Dto = Partial<Create*Dto>` — no deviations.
- Barrel: `src/interfaces/index.ts` exports only `BaseEntity`.

## Confirmed Extra-Omitted Fields to Remove

| # | DTO file | Remove these from `Omit<>` |
|---|----------|----------------------------|
| 1 | `bank/bank-statement.dto.ts` | `totalTransactions` |
| 2 | `bank/payment-match.dto.ts` | `matchedAt` |
| 3 | `company/user.dto.ts` | `passwordHash`, `passwordUpdatedAt`, `lastLoginAt` |
| 4 | `debt/debt-schedule.dto.ts` | `lastGeneratedDate` |
| 5 | `payment/payment-attempt.dto.ts` | `reviewedBy`, `reviewedAt`, `amount`, `currency` |
| 6 | `notification/notification.dto.ts` | `sentAt` |
| 7 | `summary/client-debt-summary.dto.ts` | `lastPaymentId`, `lastDebtId`, `lastPaymentDate`, `lastDebtDate` |

## Implementation Steps

1. **Add `BaseAuditFields`** type alias (`Pick<BaseEntity, ...7 keys>`) to `src/interfaces/base-entity.interface.ts`.
2. **Update barrel** `src/interfaces/index.ts` → `export { BaseEntity, BaseAuditFields } from './base-entity.interface';`
3. **Revert each of the 7 DTO files** — remove only the extra fields from each `Omit<>` union, leaving the explicit 7 audit keys; update per-file JSDoc to read `Broad DTO: omits only the BaseEntity audit fields.`
4. **Verify** all 22 `Update*Dto = Partial<Create*Dto>` (grep).
5. **Validate** — `npm run typecheck`, `build`, `lint`, `test`, `test:circular`.
6. **Commit** — single commit on the feature branch.

## Design Decision

Reverted DTOs keep the **explicit 7-field list** (not `keyof BaseAuditFields`) to stay consistent with the ~15 untouched files; `BaseAuditFields` is added as ready infrastructure for a future DRY migration of all 22 DTOs.

## Risks

Widening types is type-only (non-breaking to package surface); removing `passwordHash`/`amount`/`currency` from `Omit` lets microservices supply them — intended per the broad philosophy; services retain their own API-level validation.

## Out of Scope

Migrating the 15 untouched DTOs to `keyof BaseAuditFields`; microservice API DTOs; schema/entity changes.
