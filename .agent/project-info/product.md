# Product Definition

## Problem Statement

Companies that manage client debts face three critical challenges:

1. **Data model duplication** — Each microservice and frontend application duplicates entity definitions, leading to inconsistent models across the ecosystem.
2. **Synchronization drift** — When entities evolve, changes must be manually propagated to every consuming project, creating risk of divergence.
3. **Onboarding friction** — New developers and AI coding agents must reverse-engineer data models from scattered sources instead of referencing a single authoritative definition.

These problems result in bugs, wasted effort, and unreliable data across the Cobranza App platform.

## Product Vision

The **Entities Library** (`@cobranza-apps/entities`) is the **Single Source of Truth (SSOT)** for all data models in the Cobranza App ecosystem. It provides a single, versioned TypeScript package that:

- Defines every core business entity, custom enum, and shared type.
- Exposes clean TypeScript interfaces ready for direct import by any consumer.
- Enables consistent, type-safe data access across NestJS backend microservices, Angular frontend applications, and future services.

## Target Users

| User | Primary Need |
|------|-------------|
| NestJS backend developers | Import authoritative entity interfaces and enums for API contracts, DTOs, and validation. |
| Angular frontend developers | Import the same interfaces for type-safe component data binding and API consumption. |
| Future mobile/script developers | Reference the SSOT for new services without redefining models. |
| AI coding agents | Read the library to understand domain models and generate consistent code. |
| Technical leads | Review and approve data model changes in one place before propagation. |

## Core Product Goals

1. **Consistency** — A client, debt, or payment defined once is identical everywhere it is used.
2. **Discoverability** — Developers and agents can quickly find any entity, its properties, types, and relationships.
3. **Extensibility** — Consuming projects extend base interfaces via inheritance or composition without modifying the library.
4. **Multi-Tenancy** — Every major entity includes `companyId` to enforce tenant isolation at the type level.
5. **Auditability** — Standard audit fields (`createdAt`, `updatedAt`, `deletedAt`, `createdBy`, `updatedBy`) are built into every entity.

## Key Product Flows

### Flow 1: Recurring Debt → Invoice

1. Company user creates a **DebtSchedule** for a client (e.g., monthly fee of $15,000 ARS).
2. System auto-generates a **Debt** on the scheduled date.
3. Client accesses their portal → system generates an **Invoice** using the assigned **InvoiceTemplate**.
4. Client views and downloads the invoice with company branding.

### Flow 2: Client Uploads Payment Proof → Confirmation

1. Client uploads a proof (photo/PDF) → **PaymentProof** created.
2. System creates a **PaymentAttempt** linked to the chosen debt/invoice.
3. System attempts parsing (OCR or text extraction).
   - Success → populates amount and currency.
   - Failure → status set to `PARSE_FAILED`.
4. PaymentAttempt goes to `PENDING_VALIDATION`.
5. Company user reviews manually (approve or reject), or system auto-approves via bank matching.
6. On approval → **Payment** created as the definitive record.
7. System generates a **Receipt** using the **ReceiptTemplate** and sends it to the client.

### Flow 3: Bank Reconciliation

1. Company user uploads a bank statement → **BankStatement** created.
2. System parses it into multiple **BankTransaction** records.
3. Reconciliation engine matches BankTransactions with existing PaymentAttempts (by amount, reference, date, client detection).
4. Successful matches create **PaymentMatch** records.
5. Matched PaymentAttempts auto-advance to `APPROVED` and generate **Payment** records.

### Flow 4: Receipt Generation

When a **Payment** is confirmed (manually or via matching):

- System creates a **Receipt** record.
- Uses the company's active **ReceiptTemplate** to generate a professional PDF.
- Receipt is available for download and optionally sent via email or WhatsApp.

## Entity Groups

| Group | Entities |
|-------|----------|
| Core & Multi-Tenancy | `Company`, `CompanyPlan`, `User`, `Role`, `CompanyUser` |
| Clients & Debts | `Client`, `Debt`, `DebtSchedule` |
| Invoicing & Templates | `Invoice`, `InvoiceTemplate`, `Receipt`, `ReceiptTemplate` |
| Payments & Reconciliation | `PaymentProof`, `PaymentAttempt`, `Payment`, `BankStatement`, `BankTransaction`, `PaymentMatch` |
| Communication & Summaries | `Notification`, `NotificationTemplate`, `ClientDebtSummary`, `CompanyMonthlySummary` |

## Success Metrics

- All consuming projects reference `@cobranza-apps/entities` for their data model needs.
- Zero model duplication across the ecosystem.
- New entity changes propagate via package version updates instead of manual copy-paste.
- Onboarding time for new developers reduced by having a single, well-documented source.

## Related Files

- [Brief](./brief.md) — Core requirements and project goals.
- [Architecture](./architecture.md) — System architecture and design patterns.
- [Tech](./tech.md) — Technology stack and development setup.
- [Context](./context.md) — Current work focus and next steps.
- [Data Model Brief](./data-model-brief.md) — Detailed entity definitions and roles.
- [Entities Definition](./entities-definition.csv) — Full property definitions.
- [Relationship Diagram](./entities-relationship-diagram-overview.md) — Entity relationships.
