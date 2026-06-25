# Project Context

## Current Status

**Phase**: Initial setup — project info initialization and boilerplate creation.

**Branch**: `feat/initialize-project`

The repository currently contains:

- Project info files: `brief.md`, `data-model-brief.md`, `entities-definition.csv`, `entities-relationship-diagram-overview.md`, `instructions.md`, `product.md`, `architecture.md`, `tech.md`, `context.md`.
- Root `package.json` with name `@cobranza-apps/entities` and version `0.0.1`.
- `src/` directory with only `.gitkeep` (no source code yet).
- `tsconfig.json` configured with strict mode.
- No `node_modules/` yet.
- `.npmrc.sample` file exists.
- `README.md` rewritten with project-specific content for Cobranza App Entities Library.
- Task 3 (CSV + docs sync) in progress: `entities-definition.csv` and related docs (data-model-brief, architecture, context, README) being aligned with the BaseEntity migration and Task-5 optionality changes.

## Recent Changes

- Translated Spanish comments in `entities-definition.csv` to English.
- Created core project info files: `product.md`, `architecture.md`, `tech.md`, `context.md`.
- Reviewed and finalized project-info documentation: cross-references, links, and consistency verified.
- Updated `.initialized` marker from default to initialized state.
- Root `package.json` created with initial version `0.0.1`.
- Feature branch `feat/initialize-project` created from `main`.
- `README.md` rewritten with project-specific content; all cross-reference links verified.
- Defined `src/` folder structure with barrel exports, 12 enum files, types, and interfaces.
- Configured package.json with build scripts and devDependencies; created tsconfig.json; TypeScript compiles successfully.
- Synced `entities-definition.csv` to reflect BaseEntity audit block (id/createdAt/createdBy required; updatedAt/updatedBy/deletedAt/deletedBy optional), camelCase property names, and TypeScript type vocabulary.
- Reflected Task-5 optionality (`Company.contact`, `Client.fullName`, `Debt.description` optional) in CSV and docs.
- Updated `data-model-brief.md` (BaseEntity audit subsection + optionality note), `architecture.md` (BaseEntity snippet + naming row), and `README.md` (optionality note).

## Immediate Next Steps

1. **Update README** — Replace base template content with Cobranza App Entities Library specifics.
2. **Implement entities** — Begin writing TypeScript entity interfaces based on the data model definitions. (Already done for all 22 entities; remaining work is Task 6: changelog.)
6. **Task 6 — Changelog**: Write the detailed changelog entry for the BaseEntity refactor + optionality changes.

## Known Issues

- No test framework is configured yet.

## Open Questions

- Target registry for npm package publication (private or public).
- Whether to support both ESM and CJS output formats.
- Specific Node.js version policy (current recommendation: ≥ 20.x LTS).

## Related Files

- [Brief](./brief.md) — Core requirements and project goals.
- [Product](./product.md) — Product definition and user experience.
- [Architecture](./architecture.md) — System architecture and design patterns.
- [Tech](./tech.md) — Technology stack and development setup.
- [Data Model Brief](./data-model-brief.md) — Detailed entity definitions and roles.
- [Entities Definition](./entities-definition.csv) — Full property definitions.
- [Relationship Diagram](./entities-relationship-diagram-overview.md) — Entity relationships.
