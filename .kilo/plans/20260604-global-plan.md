# Global Plan — 20260604-todo-0

## Pre-Analysis

**Project**: Conciliador de Pagos – Entities Library (TypeScript SSOT data models for multi-tenant SaaS debt/payment reconciliation).

**Current State**:
- `main` branch has uncommitted changes (modified `brief.md`, deleted `TBD`, new project-info files, new TODO dir, new `.npmrc.sample`).
- `main` upstream (`origin/main`) is gone — needs fixup.
- `src/` contains only `.gitkeep` — no code yet.
- No `package.json`, `tsconfig.json`, or node_modules at project root (only `.kilo/package.json` for Kilo plugin).
- Project info is partially initialized: `brief.md`, `data-model-brief.md`, `entities-definition.csv`, `entities-relationship-diagram-overview.md`, `instructions.md` exist. Missing: `product.md`, `context.md`, `architecture.md`, `tech.md`.
- `.initialized` file exists (default marker) → triggers Project Info Initialization Workflow for Task 1.
- `README.md` still contains base template content.
- `entities-definition.csv` has Spanish comments in the `comments` column.
- `.agent/project-structure.md` has no `src/` folders defined.

**Dependencies between tasks**:
- Task 4 (project structure) should follow Task 5 (package.json/tsconfig setup) to ensure TypeScript compilation is configured before writing `.ts` files. Tasks 1-3 are independent docs/data tasks.

## Steps

### Step 2: Git Feature Branch Setup
- **Agent**: implementer
- Commit all unstaged/untracked changes, create `feat/initialize-project` branch from `main`.

### Step 3: Version Update
- **Agent**: implementer
- Create root `package.json` with initial version `0.0.1`. Commit as `chore: set initial version 0.0.1`.

---

### Task 1: Initialize Project Info

#### 4.1 Analysis & Planning
- **Agent**: architect
- Analyze existing project info files and repository. Generate detailed plan for creating missing core files: `product.md`, `context.md`, `architecture.md`, `tech.md`, and updating `.initialized`.

#### 4.2 Implementation
- **Agent**: implementer
- Create the 4 missing core project-info files based on the plan.

#### 4.3 Code Review
- **Agent**: code-reviewer
- Review new files for completeness and consistency with `brief.md`.

#### 4.4 Documentation
- **Agent**: docs-specialist
- Ensure cross-references between project-info files are consistent.

#### 4.5 Verification
- **Agent**: implementer
- Verify all 5 core files exist and `.initialized` is updated.

#### 4.6 Task Completion
- **Agent**: implementer
- Mark Task 1 as `[DONE]` in TODO file.

---

### Task 2: Update README File

#### 4.1 Analysis & Planning
- **Agent**: architect
- Plan README rewrite: replace base template content with Conciliador de Pagos Entities Library specifics.

#### 4.2 Implementation
- **Agent**: implementer
- Rewrite `README.md` per plan.

#### 4.3 Code Review
- **Agent**: code-reviewer
- Review README for accuracy and completeness.

#### 4.4 Documentation
- **Agent**: docs-specialist
- Ensure README aligns with project-info files.

#### 4.5 Verification
- **Agent**: implementer
- Verify README content.

#### 4.6 Task Completion
- **Agent**: implementer
- Mark Task 2 as `[DONE]`.

---

### Task 3: Translate CSV Spanish Words to English

#### 4.1 Analysis & Planning
- **Agent**: architect
- Plan: identify all Spanish text in `entities-definition.csv` comments column and translate to English. Ensure entity/property/type columns are unchanged.

#### 4.2 Implementation
- **Agent**: implementer
- Edit the CSV file, translating comments from Spanish to English.

#### 4.3 Code Review
- **Agent**: code-reviewer
- Verify translations are accurate and no data corruption occurred.

#### 4.4 Documentation
- **Agent**: docs-specialist
- No doc changes needed (CSV translation is self-contained).

#### 4.5 Verification
- **Agent**: implementer
- Spot-check CSV file integrity.

#### 4.6 Task Completion
- **Agent**: implementer
- Mark Task 3 as `[DONE]`.

---

### Task 4: Define Project Structure

#### 4.1 Analysis & Planning
- **Agent**: architect
- Plan folder/file structure under `src/` following `brief.md` recommendations: `entities/`, `enums/`, `types/`, `interfaces/` with barrel export files. Plan update to `.agent/project-structure.md`.

#### 4.2 Implementation
- **Agent**: implementer
- Create folders, barrel index files, and update `.agent/project-structure.md`.

#### 4.3 Code Review
- **Agent**: code-reviewer
- Review structure and barrel exports.

#### 4.4 Documentation
- **Agent**: docs-specialist
- Verify `.agent/project-structure.md` reflects actual structure.

#### 4.5 Verification
- **Agent**: implementer
- Verify all folders and barrel files exist and import correctly.

#### 4.6 Task Completion
- **Agent**: implementer
- Mark Task 4 as `[DONE]`.

---

### Task 5: Set Up and Configure package.json, Add and Install Dependencies

#### 4.1 Analysis & Planning
- **Agent**: architect
- Plan: create root `package.json` with name `@conciliador/entities`, TypeScript config (`tsconfig.json`), devDependencies (`typescript`, `@types/node`), build scripts, and npm configuration.

#### 4.2 Implementation
- **Agent**: implementer
- Create `package.json`, `tsconfig.json`, `.npmrc` (if needed), run `npm install`.

#### 4.3 Code Review
- **Agent**: code-reviewer
- Review package.json scripts, dependencies, tsconfig settings.

#### 4.4 Documentation
- **Agent**: docs-specialist
- Update README with setup/install instructions if needed.

#### 4.5 Verification
- **Agent**: implementer
- Run `npx tsc --noEmit` to verify TypeScript compiles.

#### 4.6 Task Completion
- **Agent**: implementer
- Mark Task 5 as `[DONE]`.

---

### Step 5: TODO File Completion
- **Agent**: implementer
- Rename TODO file to `20260604-todo-0-DONE.md`.
- Commit all changes.
- Merge `feat/initialize-project` into `main`, delete feature branch.
- Push `main` to `origin` if remote is configured.
