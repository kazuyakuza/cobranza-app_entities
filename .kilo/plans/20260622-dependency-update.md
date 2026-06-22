# Global Plan: Dependency Update Review

**Date**: 2026-06-22
**TODO File**: `.agent/todos/20260622/20260622-todo-1.md`
**Branch**: `feat/dependency-update`

---

## Pre-Analysis

### Current State
- Project: `@cobranza-apps/entities` — TypeScript entity definitions library
- Node version: 22.14.0 (from `.nvmrc` and CI workflow)
- Package manager: npm
- All dependencies are `devDependencies` (this is a types/entities library)

### Current Dependencies
| Package | Current | Notes |
|---------|---------|-------|
| `@types/node` | `^20.0.0` | Should match Node 22 |
| `@typescript-eslint/eslint-plugin` | `^7.18.0` | v8 available |
| `@typescript-eslint/parser` | `^7.18.0` | v8 available |
| `dpdm` | `^3.15.1` | v4 available |
| `eslint` | `^8.57.1` | v9/v10 available; v9+ uses flat config |
| `eslint-config-prettier` | `^9.1.2` | v10 available |
| `prettier` | `^3.8.3` | v3.8.4 available |
| `typescript` | `^5.4.0` | v5.8 available |
| `vitest` | `^1.6.1` | v4 available; v2+ had breaking changes |

### Risk Assessment
- **Low risk**: `prettier`, `typescript` (minor bumps within same major)
- **Medium risk**: `@types/node`, `dpdm`, `eslint-config-prettier`
- **High risk**: `eslint` (v8→v9+ flat config migration), `@typescript-eslint/*` (v7→v8), `vitest` (v1→v4)

### Strategy
1. Run `npm outdated` to get exact current/wanted/latest versions
2. Update safe dependencies first (prettier, typescript, @types/node)
3. Update medium-risk dependencies (dpdm, eslint-config-prettier)
4. Update high-risk dependencies with config migration (eslint, @typescript-eslint, vitest)
5. After each group: `npm install`, run `npm run typecheck`, `npm run test`, `npm run lint`, `npm run build`
6. If any group fails, isolate and fix before proceeding

---

## Execution Steps

### Step 2: Git Feature Branch Setup
- **Agent**: implementer
- Checkout `main`, ensure clean state
- Create branch `feat/dependency-update`

### Step 3: Version Update
- **Agent**: implementer
- Bump patch version in `package.json` (dependency updates = patch for this lib)
- Commit: `chore: bump version to x.y.z`

### Task 1: Dependency Audit and Safe Updates
- **4.1 Analysis & Planning** → architect
- **4.2 Implementation** → implementer
- **4.3 Code Review** → code-reviewer
- **4.4 Documentation** → docs-specialist
- **4.5 Verification** → architect
- **4.6 Task Completion** → implementer

### Step 5: TODO File Completion
- **Agent**: implementer
- Rename TODO file with `-DONE` suffix
- Merge branch to `main`
- Push to `origin` if configured

---

## Per-Task Plan: Dependency Audit and Safe Updates

### 4.1 Analysis & Planning (architect)
1. Run `npm outdated` to get exact version deltas
2. Research breaking changes for each major version bump
3. Define update groups and order
4. Save detailed implementation plan

### 4.2 Implementation (implementer)
**Phase A — Safe updates**:
1. Update `prettier` to latest patch
2. Update `typescript` to latest minor
3. Update `@types/node` to match Node 22
4. Run `npm install`
5. Run `npm run typecheck && npm run test && npm run lint && npm run build`
6. Commit if passing

**Phase B — Medium updates**:
1. Update `dpdm` to v4
2. Update `eslint-config-prettier` to v10
3. Run `npm install`
4. Run `npm run typecheck && npm run test && npm run lint && npm run build`
5. Commit if passing

**Phase C — Major updates**:
1. Update `vitest` to latest v4
2. Update `eslint` to latest v9+ (or v9 if v10 too new)
3. Update `@typescript-eslint/*` to v8
4. Migrate `.eslintrc.json` to flat config (`eslint.config.js` or `eslint.config.mjs`) if needed
5. Run `npm install`
6. Run `npm run typecheck && npm run test && npm run lint && npm run build`
7. Fix any test/lint failures
8. Commit

**Phase D — Lockfile refresh**:
1. Run `npm audit fix` if applicable
2. Verify `package-lock.json` is updated
3. Final commit

### 4.3 Code Review (code-reviewer)
- Review `package.json` version constraints
- Review config file migrations (eslint, vitest)
- Check for any removed or unnecessary dependencies
- Verify no `node_modules` or lockfile conflicts staged

### 4.4 Documentation (docs-specialist)
- Update `CHANGELOG.md` with dependency update summary
- Update any docs referencing old dependency versions

### 4.5 Verification (architect)
- Confirm all scripts pass: `build`, `typecheck`, `test`, `lint`
- Confirm `package-lock.json` is in sync
- Confirm no gitignored files staged

### 4.6 Task Completion (implementer)
- Mark task as `[DONE]` in TODO file
- Commit final state
