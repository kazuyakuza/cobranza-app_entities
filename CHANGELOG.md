# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-06-25

### Changed

- Merged the `SoftDeletable` interface into `BaseEntity`: `deletedAt` and `deletedBy` audit fields are now part of `BaseEntity`, removing the need for a separate soft-delete interface.
- Inverted `BaseEntity` audit-field optionality: `createdBy` is now required, while `updatedAt` and `updatedBy` are now optional.
- Refactored all 22 domain entities to extend the consolidated `BaseEntity`.
- Made `Company.contact`, `Client.fullName`, and `Debt.description` optional to reflect updated data-model constraints.
- Standardized all DTO definitions to omit every `BaseEntity` field (`id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `deletedAt`, `deletedBy`).
- Regenerated JSON schemas for all entities to reflect the merged audit block and revised optionality.
- Updated the test suite to match the refactored entity contracts.
- Aligned `entities-definition.csv` with the merged `BaseEntity` audit block and revised property optionality.
- Refreshed project documentation (data-model brief, architecture, and README) to describe the consolidated `BaseEntity` model.

### Removed

- The standalone `SoftDeletable` interface; its fields are now inherited through `BaseEntity`.

## [0.3.4] - 2026-06-22

### Changed

- Bumped `prettier` from `^3.8.3` to `^3.8.4`.
- Bumped `@types/node` from `^20.0.0` to `^22.0.0`.
- Replaced `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser` (`^7.18.0`) with unified `typescript-eslint` `^8.61.1`.
- Bumped `dpdm` from `^3.15.1` to `^4.2.0`.
- Bumped `typescript` from `^5.4.0` to `^5.9.0`.
- Migrated `eslint` from `^8.57.1` to `^9.39.4` with flat config (`eslint.config.mjs` replaces `.eslintrc.json` + `.eslintignore`).
- Bumped `eslint-config-prettier` from `^9.1.2` to `^10.1.8`.
- Bumped `vitest` from `^1.6.1` to `^4.1.9`.
- Added `@eslint/js` `^9.39.4` for flat config recommended rules.
- Raised `engines.node` from `>=20` to `>=22`.

### Removed

- `.eslintrc.json` and `.eslintignore` (replaced by `eslint.config.mjs`).

## [0.1.0] - 2026-06-05

### Added

- Initial release of `@cobranza-apps/entities`.
- Core shared types: `UUID`, `Money`, `Decimal`, `JsonData`, `DateString`.
- Base interfaces: `BaseEntity`, `SoftDeletable`.
- 22 domain entities organized into 9 modules:
  - **company**: `Company`, `CompanyPlan`, `CompanyUser`, `Role`, `User`
  - **client**: `Client`
  - **debt**: `Debt`, `DebtSchedule`
  - **payment**: `Payment`, `PaymentAttempt`, `PaymentProof`
  - **bank**: `BankStatement`, `BankTransaction`, `PaymentMatch`
  - **invoice**: `Invoice`, `InvoiceTemplate`
  - **receipt**: `Receipt`, `ReceiptTemplate`
  - **notification**: `Notification`, `NotificationTemplate`
  - **summary**: `ClientDebtSummary`, `CompanyMonthlySummary`
- 15 string-based enums including `DebtStatus`, `PaymentStatus`, `Currency`, `BankStatementStatus`, `MatchMethod`, `NotificationType`, `NotificationChannel`, and others.
- Barrel exports at every folder level and a root `src/index.ts` for clean consumer imports.
- Full JSDoc comments on every entity, property, and enum.
- Strict TypeScript configuration (`strict: true`) with declaration file generation.
- ESLint and Prettier setup for code quality.

[0.4.0]: https://github.com/cobranza-apps/entities/compare/v0.3.4...v0.4.0
[0.3.4]: https://github.com/cobranza-apps/entities/compare/v0.1.0...v0.3.4
[0.1.0]: https://github.com/cobranza-apps/entities/releases/tag/v0.1.0
