# Cobranza App – Entities Library

## Project Overview

This repository contains the **central data model definition** (entities, enums, and types) for the **Cobranza App** system — a multi-tenant SaaS for debt management and payment reconciliation.

**Purpose**:  
Serve as the **Single Source of Truth (SSOT)** for all data models across the entire ecosystem:

- NestJS Backend Microservices
- Angular Frontend applications
- Future services (mobile apps, scripts, etc.)

By maintaining models in one place, we ensure consistency, reduce duplication, and simplify synchronization when models evolve.

## Project Goals

- Define all core business entities with their complete properties.
- Define all custom enums and shared types.
- Provide clean TypeScript interfaces ready to be imported.
- Allow easy extension (via inheritance or composition) in consuming projects.
- Be highly readable and well-documented for both humans and AI coding agents.

## Core Principles

- **TypeScript First**: All definitions are in modern TypeScript.
- **Multi-Tenancy Ready**: Every major entity includes `companyId`.
- **Audit & Soft Delete**: Standard fields (`createdAt`, `updatedAt`, `deletedAt`, `createdBy`, `updatedBy`).
- **Extensibility**: Entities are designed to be extended in specific microservices.
- **Consistency**: Clear naming conventions, detailed JSDoc comments, and organized structure.

## Entity List

### 1. Core & Multi-Tenancy

- `Company`
- `CompanyPlan`
- `User`
- `Role`
- `CompanyUser`

### 2. Clients & Debts

- `Client`
- `Debt`
- `DebtSchedule`

### 3. Invoicing & Templates

- `Invoice`
- `InvoiceTemplate`
- `Receipt`
- `ReceiptTemplate`

### 4. Payments & Reconciliation

- `PaymentProof`
- `PaymentAttempt`
- `Payment`
- `BankStatement`
- `BankTransaction`
- `PaymentMatch`

### 5. Communication & Summaries

- `Notification`
- `NotificationTemplate`
- `ClientDebtSummary`
- `CompanyMonthlySummary`

## Folder Structure (Recommended)

```bash
src/
├── entities/
│   ├── index.ts                    # Main barrel export
│   ├── company/
│   ├── client/
│   ├── debt/
│   ├── payment/
│   ├── bank/
│   └── notification/
├── enums/
│   ├── index.ts
│   ├── debt-status.enum.ts
│   ├── payment-status.enum.ts
│   └── ... (all enums)
├── types/
│   ├── common.ts                   # Shared types (UUID, Money, etc.)
│   └── index.ts
├── interfaces/
│   └── base-entity.interface.ts
└── index.ts                        # Root barrel
```

## Definitions

- [Data Model Brief](./data-model-brief.md)
- [Entities Properties Definition](./entities-definition.csv)
- [Entities Relationship Diagram Overview](./entities-relationship-diagram-overview.md)

<!-- DO NOT DELETE NEXT SECTION -->

## Important Note for AI Agents

All agents working on this project MUST adhere to the workflows and rules outlined in [AI Agent Onboarding document](../../AGENTS.md).

Before starting any task:

1. **Review `AGENTS.md`**: is the primary source of instructions for agents.
2. **Follow Workflows**: follow the procedures defined in `.agent/WORKFLOWS.md`, especially the `.kilo/commands/critical-workflow.md`.

<!-- END DO NOT DELETE -->
