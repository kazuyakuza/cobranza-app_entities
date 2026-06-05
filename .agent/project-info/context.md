# Project Context

## Current Status

**Phase**: Initial setup — project info initialization and boilerplate creation.

**Branch**: `feat/initialize-project`

The repository currently contains:

- Project info files: `brief.md`, `data-model-brief.md`, `entities-definition.csv`, `entities-relationship-diagram-overview.md`, `instructions.md`, `product.md`, `architecture.md`, `tech.md`, `context.md`.
- Root `package.json` with name `@conciliador/entities` and version `0.0.1`.
- `src/` directory with only `.gitkeep` (no source code yet).
- No `tsconfig.json` yet.
- No `node_modules/` yet.
- `.npmrc.sample` file exists.
- `README.md` rewritten with project-specific content for Conciliador de Pagos Entities Library.

## Recent Changes

- Translated Spanish comments in `entities-definition.csv` to English.
- Created core project info files: `product.md`, `architecture.md`, `tech.md`, `context.md`.
- Reviewed and finalized project-info documentation: cross-references, links, and consistency verified.
- Updated `.initialized` marker from default to initialized state.
- Root `package.json` created with initial version `0.0.1`.
- Feature branch `feat/initialize-project` created from `main`.
- `README.md` rewritten with project-specific content; all cross-reference links verified.

## Immediate Next Steps

1. **Update README** — Replace base template content with Conciliador de Pagos Entities Library specifics.
2. **Define project structure** — Create `src/` folder structure with barrel export files.
3. **Set up package configuration** — Create `tsconfig.json`, finalize `package.json` scripts, and install dependencies.
4. **Implement entities** — Begin writing TypeScript entity interfaces based on the data model definitions.

## Known Issues

- No `tsconfig.json` exists yet — TypeScript compilation is not configured.
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