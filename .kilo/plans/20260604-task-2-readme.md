# Task 2: Update README File — Implementation Plan

## Objective

Rewrite `README.md` to replace base-template content with project-specific documentation for the **Cobranza App – Entities Library** (`@cobranza-apps/entities`).

## Source Material

| File | Information Used |
|------|------------------|
| `README.md` (current) | Base-template sections to keep, remove, or replace |
| `.agent/project-info/brief.md` | Project name, overview, goals, entity list, folder structure |
| `.agent/project-info/product.md` | Problem statement, vision, target users, core goals, entity groups, key flows |
| `.agent/project-info/tech.md` | Stack, package details, dev setup, build commands, consumption pattern |
| `.agent/project-info/architecture.md` | Package structure, design patterns, naming conventions, critical paths |
| `package.json` | Package name (`@cobranza-apps/entities`), version (`0.0.1`), description |

## Keep / Remove / Add Matrix

| Section | Action | Notes |
|---------|--------|-------|
| Title + description | **Replace** | Change from "Base Project for AI Agent Driven Development" to "@cobranza-apps/entities — Cobranza App Entities Library" |
| Attention AI Agents note | **Keep** | Retain the note pointing to `AGENTS.md`. Minor wording cleanup allowed |
| Compatibility | **Remove** | Too base-template-specific (Kilo Code plugin compatibility) |
| Prerequisites | **Remove** | Too base-template-specific (Kilo Code plugin prerequisite) |
| About this Project | **Replace** | Write new project-specific description, purpose, and goals from `brief.md` and `product.md` |
| Design Principles | **Remove** | Replace with "Core Principles" from `brief.md` |
| Project Structure | **Replace** | Remove `.agent/`, `.kilo/`, `.kilocodeignore` description; add `src/` folder structure |
| The Critical Workflow | **Keep** | Preserve mermaid diagram and description. Update intro sentence to remove template-specific context |
| How to Start a Task | **Keep** | Both Option 1 (TODO file) and Option 2 (Direct Chat) remain relevant |
| AI Agent Plans | **Keep** | Adapt description slightly to fit project context |
| Key Entities | **Add** | New section — list entities grouped by domain from `brief.md` |
| Tech Stack | **Add** | Brief summary from `tech.md` |
| Installation & Usage | **Add** | New section — npm install + import examples from `tech.md` |
| Development Setup | **Add** | New section — clone, install, type-check, build commands from `tech.md` |
| Related Documentation | **Add** | New section — links to `.agent/project-info/*.md` files |
| Footer note | **Keep** | "workflow is actively maintained" note |

## New README Section Outline

### 1. Title & Description

**Heading**: `# @cobranza-apps/entities — Cobranza App Entities Library`

**Description paragraph**:
Central data model definitions (entities, enums, types) for the **Cobranza App** system — a multi-tenant SaaS for debt management and payment reconciliation. This package serves as the **Single Source of Truth (SSOT)** for all data models across the ecosystem.

### 2. Attention AI Agents

**Draft**:
> **Attention AI Agents:** Before making any changes, you **must** read and adhere to the guidelines outlined in [`AGENTS.md`](AGENTS.md). This file contains critical information about the project's workflow, rules, and architectural standards.

### 3. About

**Draft**:

> ## About
>
> The primary goal of this repository is to provide a clean, structured, and authoritative source of truth for all data models in the Cobranza App platform.
>
> By centralizing entity definitions in one versioned TypeScript package, we ensure consistency across:
>
> - NestJS backend microservices
> - Angular frontend applications
> - Future services (mobile apps, scripts, etc.)
>
> ### Core Principles
>
> - **TypeScript First** — All definitions are in modern TypeScript with strict mode.
> - **Multi-Tenancy Ready** — Every major entity includes `companyId` for tenant isolation.
> - **Audit & Soft Delete** — Standard audit fields (`createdAt`, `updatedAt`, `deletedAt`, `createdBy`, `updatedBy`) built into every entity.
> - **Extensibility** — Entities are designed to be extended in consuming projects without modifying the library.
> - **Consistency** — Clear naming conventions, detailed JSDoc comments, and organized barrel exports.

### 4. Key Entities

**Draft**:

> ## Key Entities
>
> Entities are organized by domain concern:
>
> | Group | Entities |
> |-------|----------|
> | **Core & Multi-Tenancy** | `Company`, `CompanyPlan`, `User`, `Role`, `CompanyUser` |
> | **Clients & Debts** | `Client`, `Debt`, `DebtSchedule` |
> | **Invoicing & Templates** | `Invoice`, `InvoiceTemplate`, `Receipt`, `ReceiptTemplate` |
> | **Payments & Reconciliation** | `PaymentProof`, `PaymentAttempt`, `Payment`, `BankStatement`, `BankTransaction`, `PaymentMatch` |
> | **Communication & Summaries** | `Notification`, `NotificationTemplate`, `ClientDebtSummary`, `CompanyMonthlySummary` |
>
> For full property definitions, see [`entities-definition.csv`](.agent/project-info/entities-definition.csv). For relationship diagrams, see [`entities-relationship-diagram-overview.md`](.agent/project-info/entities-relationship-diagram-overview.md).

### 5. Tech Stack

**Draft**:

> ## Tech Stack
>
> | Technology | Purpose |
> |------------|---------|
> | **TypeScript** >= 5.x | Strict-mode type definitions |
> | **Node.js** >= 20.x LTS | Build tooling runtime |
> | **npm** >= 10.x | Package manager and publish tool |
>
> Zero runtime dependencies. The library exports only TypeScript interfaces, types, and enums — no services, no side effects, no network calls.

### 6. Project Structure

**Draft**:

> ## Project Structure
>
> ```text
> src/
> ├── entities/          # Domain-organized entity interfaces
> │   ├── company/
> │   ├── client/
> │   ├── debt/
> │   ├── payment/
> │   ├── bank/
> │   ├── invoice/
> │   ├── receipt/
> │   ├── notification/
> │   └── summary/
> ├── enums/             # Custom enums (e.g., DebtStatus, PaymentStatus)
> ├── types/             # Shared types (e.g., UUID, Money)
> ├── interfaces/        # Base interfaces (e.g., BaseEntity)
> └── index.ts           # Root barrel export
> ```

### 7. Installation & Usage

**Draft**:

> ## Installation & Usage
>
> Install the package via npm:
>
> ```bash
> npm install @cobranza-apps/entities
> ```
>
> Import directly into your project:
>
> ```typescript
> import { Client, Debt, DebtStatus, Currency } from '@cobranza-apps/entities';
> ```
>
> The library exports only TypeScript interfaces, types, and enums — no runtime code, no side effects.

### 8. Development Setup

**Draft**:

> ## Development Setup
>
> ```bash
> # Clone the repository
> git clone <repo-url>
> cd entities
>
> # Install dependencies
> npm install
>
> # Type-check without emitting
> npx tsc --noEmit
>
> # Build declarations and JS
> npx tsc
> ```
>
> Build outputs to `dist/` directory. When ready to publish:
>
> ```bash
> npm publish --access public
> ```

### 9. The Critical Workflow

**Draft intro**: The project follows a standardized process for task execution, ensuring systematic progress from analysis to deployment. Each step is handled by a dedicated sub-agent:

**Keep**: The entire mermaid diagram block from current README.
**Keep**: Link to `.kilo/commands/critical-workflow.md`.
**Remove**: The "Note on Project Info" paragraph about cloning the template.

### 10. How to Start a Task

Keep exactly as-is from current README lines 73-97.

### 11. AI Agent Plans

Keep as-is from current README lines 99-107.

### 12. Related Documentation

**Draft**:

> ## Related Documentation
>
> - [`brief.md`](.agent/project-info/brief.md) — Core requirements, entity list, and project goals
> - [`product.md`](.agent/project-info/product.md) — Product vision, target users, and key flows
> - [`architecture.md`](.agent/project-info/architecture.md) — Design patterns, package structure, and naming conventions
> - [`tech.md`](.agent/project-info/tech.md) — Technology stack, build workflow, and constraints
> - [`data-model-brief.md`](.agent/project-info/data-model-brief.md) — Detailed entity definitions and roles
> - [`entities-definition.csv`](.agent/project-info/entities-definition.csv) — Full property definitions for all entities
> - [`entities-relationship-diagram-overview.md`](.agent/project-info/entities-relationship-diagram-overview.md) — Entity relationship diagrams

### 13. Footer

Keep as-is: `---` + `*Note: This workflow is actively maintained...*`

## Implementation Steps

1. Read current `README.md` fully.
2. Replace title + description with Section 1 draft.
3. Keep/update Attention AI Agents note.
4. Remove Compatibility section (lines 7-15).
5. Remove Prerequisites section (lines 16-19).
6. Replace About section (lines 21-31) with Section 3 draft.
7. Replace Project Structure section (lines 32-38) with Section 6 draft.
8. Add Key Entities section (Section 4).
9. Add Tech Stack section (Section 5).
10. Add Installation & Usage section (Section 7).
11. Add Development Setup section (Section 8).
12. Update Critical Workflow intro, keep diagram, remove template note.
13. Keep How to Start a Task as-is.
14. Keep AI Agent Plans as-is.
15. Add Related Documentation section (Section 12).
16. Keep footer as-is.
17. Commit with message: `docs: rewrite README for Cobranza App Entities Library`.

## Verification Checklist

- [ ] Title reads `@cobranza-apps/entities — Cobranza App Entities Library`
- [ ] No "Compatibility" section
- [ ] No "Prerequisites" section
- [ ] About section has project-specific description and core principles
- [ ] Key Entities section lists all 20 entities grouped by 5 domains
- [ ] Tech Stack section present
- [ ] Project Structure section shows `src/` tree
- [ ] Installation & Usage section shows `npm install` and import example
- [ ] Development Setup section present
- [ ] Critical Workflow section contains full mermaid diagram
- [ ] How to Start a Task section has both options
- [ ] AI Agent Plans section present
- [ ] Related Documentation section links to project-info files
- [ ] Footer note present
