# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-06-05

### Added

- Initial release of `@cobranza-app/entities`.
- Core shared types: `UUID`, `Money`, `Decimal`, `JsonData`, `DateString`.
- Base interfaces: `BaseEntity`, `SoftDeletable`.
- 21 domain entities organized into 9 modules:
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

[Unreleased]: https://github.com/cobranza-app/entities/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/cobranza-app/entities/releases/tag/v0.1.0