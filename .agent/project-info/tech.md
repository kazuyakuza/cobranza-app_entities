# Technology Stack

## Primary Language

**TypeScript** — strict mode enabled. All definitions are compile-time only (interfaces, types, enums) with no runtime logic.

## Runtime & Build

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | ≥ 20.x LTS | Runtime environment for build tooling |
| **TypeScript** | ≥ 5.x | Language compiler — produces `.d.ts` declarations and `.js` output |
| **npm** | ≥ 10.x | Package manager and publish tool |

## Project Configuration

### package.json

- **Name**: `@cobranza-apps/entities`
- **Initial Version**: `0.0.1`
- **Private**: `true` (will be set to `false` when ready to publish)
- **Entry Point**: `src/index.ts` (source) → `dist/index.js` (compiled)

### tsconfig.json

Created and configured with:

- `strict: true` — Full strict mode
- `declaration: true` — Generate `.d.ts` files for consumers
- `declarationMap: true` — Source maps for declarations
- `moduleResolution: "node"` — Standard Node module resolution
- `target: "ES2022"` — Modern JavaScript output
- `module: "ES2022"` — ES module output
- `outDir: "./dist"` — Compiled output directory
- `rootDir: "./src"` — Source root

### npm Configuration

- `.npmrc` or `.npmrc.sample` contains registry configuration for private or scoped packages.

## Dependencies

### Runtime Dependencies

**None** — The entities library is a pure type-definition package with zero runtime dependencies.

### Dev Dependencies

| Package | Purpose |
|---------|---------|
| `typescript` | TypeScript compiler |
| `@types/node` | Node.js type definitions (for `Date`, `Buffer`, etc.) |

Additional dev dependencies may be added as the project evolves:

| Future Package | Purpose |
|---------------|---------|
| `jest` | Unit testing framework |
| `ts-jest` | Jest TypeScript transformer |
| `eslint` | Code linting |
| `prettier` | Code formatting |
| `husky` | Git hooks |
| `lint-staged` | Staged file linting |
| `tsup` or `unbuild` | Alternative bundler for ESM/CJS dual output |

## Build & Publish Workflow

```bash
# Install dependencies
npm install

# Type-check without emitting
npx tsc --noEmit

# Build declarations and JS
npx tsc

# Run tests (when test suite exists)
npm test

# Publish to npm (when ready)
npm publish --access public
```

## Consumption Pattern

Consuming projects install the library via npm:

```bash
npm install @cobranza-apps/entities
```

Then import directly:

```typescript
import { Client, Debt, DebtStatus, Currency } from '@cobranza-apps/entities';
```

The library exports only TypeScript interfaces, types, and enums — no runtime code, no side effects.

## Technical Constraints

| Constraint | Detail |
|-----------|--------|
| **No runtime logic** | The library must not contain services, side effects, or network calls — only type definitions and enums. |
| **Zero runtime dependencies** | `dependencies` in `package.json` must remain empty. All tooling belongs in `devDependencies`. |
| **Strict TypeScript** | `strict: true` must be enabled in `tsconfig.json`. No `any` types. |
| **Multi-Tenancy types** | All major entity interfaces must include `companyId: string` for tenant isolation. |
| **Audit fields** | All entities extend `BaseEntity`, which includes `id`, `createdAt`, `createdBy` (required), `updatedAt?`, `updatedBy?`, `deletedAt?`, `deletedBy?`. |
| **Soft delete** | Soft-delete fields (`deletedAt?`, `deletedBy?`) are part of `BaseEntity` and available on all entities. |
| **Naming conventions** | Follow the naming table in [Architecture](./architecture.md#naming-conventions). |
| **Max file size** | Source files must not exceed 200 lines (excluding blanks and comments), ideally under 125 active lines. |
| **Max method size** | Function/method bodies must not exceed 50 lines. |
| **Max arguments** | Methods must have at most 2 parameters; use object types for more. |
| **Max nesting depth** | Maximum 2 levels of nesting; extract logic to separate methods beyond that. |
| **Private by default** | Class members should be `private` unless public access is necessary. |

## Development Setup

```bash
# Clone the repository
git clone <repo-url>
cd entities

# Install dependencies
npm install

# Verify TypeScript compilation
npx tsc --noEmit

# Build
npx tsc
```

## Tool Usage Patterns

| Task | Command |
|------|---------|
| Type-check | `npx tsc --noEmit` |
| Build | `npx tsc` |
| Clean build | `rm -rf dist && npx tsc` |
| Run tests | `npm test` (when test suite exists) |
| Publish | `npm publish --access public` |

## Related Files

- [Brief](./brief.md) — Core requirements and project goals.
- [Product](./product.md) — Product definition and user experience.
- [Architecture](./architecture.md) — System architecture and design patterns.
- [Context](./context.md) — Current work focus and next steps.
