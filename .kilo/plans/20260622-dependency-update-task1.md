# Plan — Task 1: Update devDependencies to latest compatible versions

- **Date**: 2026-06-22
- **Task**: Task 1 (Critical Workflow 4.1 — Analysis & Planning)
- **Scope**: `package.json` devDependencies + related config migration. Production code unchanged unless verification surfaces errors.
- **Branch**: feature branch created by Critical Workflow Step 2 (e.g. `feat/update-dependencies`).
- **Plan file**: `.kilo/plans/20260622-dependency-update-task1.md`

## 1. Summary of findings

Current `package.json` declares 9 devDependencies. Latest versions were resolved from the npm registry dist-tags (`https://registry.npmjs.org/-/package/<name>/dist-tags`). Every package except `prettier` has a newer **major** line available, so the update is split into risk-based groups rather than a single bulk bump.

Environment facts that shape the plan:

- `.nvmrc` pins Node `22.14.0` (Node 22 LTS is the actual dev/runtime), while `package.json` `engines.node` still says `>=20`. The engines field is stale and will be aligned to `>=22`.
- `package-lock.json` is committed → every group is a clean, revertible commit (lockfile restored on revert).
- No `.snap` files exist; tests import `{ describe, it, expect } from 'vitest'` and `vitest.config.ts` uses only stable options (`globals`, `include`, `environment`). → vitest 4 migration is low-risk (version + engines bump; no config rewrite).
- Only legacy `.eslintrc.json` + `.eslintignore` exist (no flat config). → eslint 9 migration requires a new `eslint.config.js` and folding `.eslintignore` into `ignores`.
- `.npmignore` already contains `*.config.*` (covers `eslint.config.js`) and `.eslintrc*`; the stale `.eslintignore` line will be removed after that file is deleted.

## 2. Current vs latest versions

| Package | Current (package.json) | Latest (npm `latest` tag) | Bump type | Target in this plan | Notes |
|---|---|---|---|---|---|
| `@types/node` | `^20.0.0` | `26.0.0` | major (major-line mismatch) | `^22.0.0` | `26.x` requires TS 6.0; `^22.x` matches `.nvmrc` 22.14.0 + engines `>=22`. |
| `@typescript-eslint/eslint-plugin` | `^7.18.0` | `8.61.1` | major | `^8.61.1` (Group 2) then replaced by `typescript-eslint` (Group 3) | v8 supports eslint 8 **and** 9. |
| `@typescript-eslint/parser` | `^7.18.0` | `8.61.1` | major | `^8.61.1` (Group 2) then replaced by `typescript-eslint` (Group 3) | Keep paired with the plugin. |
| `dpdm` | `^3.15.1` | `4.2.0` | major | `^4.2.0` | Only used by `test:circular` script; verify CLI flags. |
| `eslint` | `^8.57.1` | `10.5.0` (`maintenance` = `9.39.4`) | major x2 | `^9.39.4` | Target stable 9.x (flat config). 10.x = optional follow-up. |
| `eslint-config-prettier` | `^9.1.2` | `10.1.8` | major | `^10.1.8` | v10 pairs with eslint 9 flat config. |
| `prettier` | `^3.8.3` | `3.8.4` | patch | `^3.8.4` | Trivial. |
| `typescript` | `^5.4.0` | `6.0.3` | major | `^5.9.0` (conservative) | TS 6.0 = optional stretch (needs @typescript-eslint TS-6 verification). Exact latest 5.x patch to confirm. |
| `vitest` | `^1.6.1` | `4.1.9` | major x3 | `^4.1.9` | Requires Node `>=20.11`; satisfied by engines `>=22`. Config minimal → no rewrite. |

New devDependencies introduced in Group 3:

| Package | Target | Why |
|---|---|---|
| `typescript-eslint` | `^8.61.1` | Unified meta-package for v8 flat config (`tseslint.config()` helper + configs). Replaces the two separate `@typescript-eslint/*` packages. |
| `@eslint/js` | `^9.0.0` | Provides `eslint.configs.recommended` in flat config (replaces `eslint:recommended` extends). Confirm latest 9.x patch. |
| `globals` *(only if needed)* | `^15.0.0` | Add only if lint reports `no-undef` for Node globals. typescript-eslint disables `no-undef` for `.ts`, so likely unnecessary. |

## 3. Compatibility analysis

- **@typescript-eslint v8** supports `eslint ^8.57.0 || ^9.0.0` → Group 2 (keep eslint 8) and Group 3 (eslint 9) are both valid.
- **eslint-config-prettier**: `9.x` → eslint 8 (current); `10.x` → eslint 9. Bump coupled with the eslint migration.
- **vitest 4**: Node `>=20.11`; `.nvmrc` = 22.14.0 → OK. No snapshots, stable config options → no content rewrite.
- **@types/node 26** requires TypeScript 6.0 (per its `ts6.0` dist-tag). Keeping TS on 5.x caps `@types/node` at the `^22`/`^24` lines; `^22` is chosen to match the Node 22 runtime.
- **TypeScript 6.0** may tighten strict-mode checks and requires confirming `@typescript-eslint@8.61.1` TS-6 support → deferred to an optional stretch step, not the default path.

## 4. Grouped update strategy

Execution order is mandatory: Group 1 → Group 2 → Group 3. Each group is one or more self-contained commits, verified before proceeding. Commit pending changes (if any) before starting a new group.

### Group 1 — Safe (patch, no config impact)

**Packages**: `prettier` `^3.8.3` → `^3.8.4`.

**Files to modify**
- `package.json`: `"prettier": "^3.8.4"`.

**Commands**
1. Edit `package.json` (the single line above).
2. `npm install` — refresh `package-lock.json`.
3. `npm run format` — apply any formatting changes from the patch.
4. `npm run format:check` — must pass.
5. `npm run lint` — must pass (prettier config consumed via `eslint-config-prettier`).

**Verification (all must pass)**
- `npm run format:check`
- `npm run lint`

**Commit**
- `chore(deps): bump prettier to 3.8.4`

**Rollback if verification fails**
- `git reset --hard HEAD~1` (restores `package.json` + `package-lock.json`).

### Group 2 — Medium (major bumps, no config-format migration)

**Packages**
- `@types/node` `^20.0.0` → `^22.0.0`
- `@typescript-eslint/eslint-plugin` `^7.18.0` → `^8.61.1`
- `@typescript-eslint/parser` `^7.18.0` → `^8.61.1`
- `dpdm` `^3.15.1` → `^4.2.0`
- `typescript` `^5.4.0` → `^5.9.0` (confirm exact latest 5.x patch before editing)
- `engines.node` `>=20` → `>=22` (align with `.nvmrc` 22.14.0; also satisfies vitest 4 in Group 3)

**Files to modify**
- `package.json`:
  - `devDependencies` version strings above.
  - `engines.node`: `">=22"`.
- `vitest.config.ts`: no change.
- `.eslintrc.json`: no change (still legacy format; @typescript-eslint v8 keeps the `plugin:@typescript-eslint/recommended` / `recommended-requiring-type-checking` config names valid).

**Commands**
1. Confirm latest 5.x TypeScript patch (npm website or `npm view typescript@^5 version`; `npm view` is permission-blocked in this env — use the npm website or registry browser if needed). Use the highest `5.x` available; fall back to `^5.9.0` if uncertain.
2. Edit `package.json` (versions + `engines.node`).
3. `npm install`.
4. `npm run typecheck` — TS 5.x strict may surface new errors; fix in source or document.
5. `npm run lint` — @typescript-eslint v8 may enable new rules; run `npm run lint:fix`, then resolve remaining findings.
6. `npm run test:circular` — verifies `dpdm` v4 CLI flags.
   - If `--no-warning` / `--no-tree` are rejected by dpdm 4, run `dpdm --help` to find the new equivalents and update the `test:circular` script accordingly.
   - If dpdm 4 has an incompatible CLI with no clean equivalent, revert only `dpdm` to `^3.15.1` (keep the rest of Group 2) and commit a note.
7. `npm run test`.
8. `npm run build`.

**Verification (all must pass)**
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run test:circular`
- `npm run build`

**Commit**
- `chore(deps): bump @types/node, @typescript-eslint, dpdm, typescript; align engines node>=22`

**Rollback if verification fails**
- `git reset --hard HEAD~1`, or
- `git revert <sha>` if other commits landed after.
- Partial rollback (dpdm only): set `"dpdm": "^3.15.1"` in `package.json`, `npm install`, re-verify `npm run test:circular`, commit `chore(deps): revert dpdm to 3.15.1 (v4 cli incompatible)`.

### Group 3 — High (config-format migration: eslint 9 flat config + vitest 4)

**Packages**
- Remove: `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`.
- Add: `typescript-eslint` `^8.61.1`, `@eslint/js` `^9.0.0` (confirm latest 9.x patch).
- `eslint` `^8.57.1` → `^9.39.4`.
- `eslint-config-prettier` `^9.1.2` → `^10.1.8`.
- `vitest` `^1.6.1` → `^4.1.9`.
- Optional add: `globals` `^15.0.0` (only if `npm run lint` reports `no-undef` for Node globals).

**Files to modify**
1. `package.json`:
   - `devDependencies`: apply the add/remove/bump list above.
   - `scripts.lint`: `"eslint src"` (drop `--ext .ts`; flat config does not use `--ext`).
   - `scripts.lint:fix`: `"eslint src --fix"`.
2. Create `eslint.config.js` (flat config) at repo root:
   ```js
   import eslint from '@eslint/js';
   import tseslint from 'typescript-eslint';
   import eslintConfigPrettier from 'eslint-config-prettier';

   export default tseslint.config(
     { ignores: ['dist/', 'node_modules/', 'eslint.config.js'] },
     eslint.configs.recommended,
     ...tseslint.configs.recommendedTypeChecked,
     {
       languageOptions: {
         parserOptions: {
           project: './tsconfig.json',
           tsconfigRootDir: import.meta.dirname,
         },
       },
     },
     eslintConfigPrettier,
   );
   ```
   - `tseslint.configs.recommendedTypeChecked` replaces both `plugin:@typescript-eslint/recommended` and `plugin:@typescript-eslint/recommended-requiring-type-checking`.
   - `eslint.configs.recommended` replaces `eslint:recommended`.
   - `eslintConfigPrettier` (default import) replaces the `"prettier"` extends entry.
   - `ignores` replaces `.eslintignore` (`dist`, `node_modules`) plus the old `ignorePatterns` (`.eslintrc.json` is deleted, so it is replaced by `eslint.config.js` in ignores).
   - `import.meta.dirname` requires Node `>=20.11` (satisfied by engines `>=22`).
   - Node globals (`env.node`): not re-added because typescript-eslint disables `no-undef` for `.ts`. If a `no-undef` error appears, add `globals` to devDependencies and `languageOptions: { globals: globals.node }`.
3. Delete `.eslintrc.json`.
4. Delete `.eslintignore` (its entries are now in `eslint.config.js` `ignores`).
5. `.npmignore`: remove the `.eslintignore` line (file deleted). `eslint.config.js` is already excluded by the existing `*.config.*` pattern — no new entry needed.
6. `vitest.config.ts`: no content change (options are v4-compatible).

**Commands**
1. Confirm latest `@eslint/js` 9.x patch (npm website).
2. Edit `package.json` (deps + scripts).
3. Create `eslint.config.js`.
4. Delete `.eslintrc.json` and `.eslintignore`.
5. Edit `.npmignore` (remove `.eslintignore` line).
6. `npm install`.
7. `npm run lint` — first flat-config run; run `npm run lint:fix`, then resolve remaining findings. If `no-undef` for Node globals appears, add `globals` (see above) and re-run.
8. `npm run typecheck`.
9. `npm run test` — vitest 4.
10. `npm run test:circular`.
11. `npm run build`.

**Verification (all must pass)**
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:circular`
- `npm run build`
- Manual: confirm `eslint src` lints `.ts` files (no `--ext`); confirm `eslint.config.js` is the active config (`eslint --print-config src/index.ts` succeeds and shows type-checked rules enabled).

**Commit**
- `chore(deps): migrate eslint 9 flat config, eslint-config-prettier 10, vitest 4`

**Rollback if verification fails**
- `git reset --hard HEAD~1` (restores `.eslintrc.json`, `.eslintignore`, `package.json`, `package-lock.json`, `.npmignore`, scripts).
- If only the eslint part fails but vitest 4 passes: split into two commits — first `vitest` only (revert eslint files via `git checkout HEAD~1 -- .eslintrc.json .eslintignore package.json .npmignore` then re-apply only the `vitest` version bump), then retry eslint separately. Prefer the single `git reset --hard HEAD~1` for simplicity unless partial progress must be preserved.

### Optional stretch (not in default path)

- **TypeScript `^6.0.3`**: after Group 2 passes, optionally bump TS to 6.0.3, set `@types/node` to `^26.0.0`, re-run `npm run typecheck` + `npm run lint` (verify `@typescript-eslint@8.61.1` supports TS 6). Only proceed if both pass cleanly. Separate commit: `chore(deps): bump typescript to 6.0.3, @types/node to 26`.
- **eslint `^10.5.0`**: after Group 3 passes, optionally bump eslint to 10.x (flat config already in place). Re-run lint. Separate commit: `chore(deps): bump eslint to 10`.

## 5. Verification matrix (per group)

| Check | Group 1 | Group 2 | Group 3 |
|---|---|---|---|
| `npm run typecheck` | — | yes | yes |
| `npm run lint` | yes | yes | yes |
| `npm run format:check` | yes | — | — |
| `npm run test` | — | yes | yes |
| `npm run test:circular` | — | yes (dpdm 4 flags) | yes |
| `npm run build` | — | yes | yes |
| `npm run format` (apply) | yes | — | — |
| `npm run lint:fix` (apply) | — | if needed | if needed |

## 6. Rollback plan (global)

- Every group is a discrete commit on the feature branch, and `package-lock.json` is committed, so any group can be reverted without affecting the others.
- Full rollback to pre-task state: from the feature branch, `git reset --hard <sha-before-group-1>` (or `git revert` the group commits in reverse order if other work has been merged in between).
- Per-group rollback commands are listed in each group section.
- If a group fails and cannot be fixed within the implementer step, stop and escalate to the Plan Agent (do not proceed to the next group).

## 7. Open decisions / items to confirm during implementation

1. **TypeScript target**: default `^5.9.0` (conservative). Exact latest 5.x patch must be confirmed (npm website, since `npm view` is blocked here). TS 6.0.3 is an optional stretch.
2. **eslint target**: default `^9.39.4` (stable, mature flat-config docs). `10.5.0` is an optional stretch.
3. **`engines.node` `>=22`**: aligns with `.nvmrc` 22.14.0 and satisfies vitest 4. Tightening the engines contract is a breaking change for consumers → flag to Critical Workflow Step 3 (Version Update) for a possible semver major bump.
4. **`@types/node` `^22`**: matches Node 22 runtime. Alternative (keep `^20`) is rejected because `.nvmrc` already mandates 22.
5. **`dpdm` v4 CLI flags**: verify `--no-warning` / `--no-tree` via `dpdm --help`; update `test:circular` script or revert `dpdm` to `^3.15.1` if incompatible.
6. **`@eslint/js` exact 9.x patch**: confirm via npm website.
7. **`globals` package**: add only if `no-undef` appears after the eslint 9 migration.

## 8. Out of scope (handled by other Critical Workflow steps)

- Executing the bumps (Step 4.2 — implementer).
- Code review of the changes (Step 4.3 — code-reviewer).
- Documentation updates / CHANGELOG (Step 4.4 — docs-specialist).
- Final verification & commit (Steps 4.5 / 4.6).
- Feature branch setup (Step 2) and version bump (Step 3).
- Any production source-code changes beyond what is required to make `typecheck` / `lint` / `test` / `build` pass after a bump.
