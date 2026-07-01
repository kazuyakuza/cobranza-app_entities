# Plan — Task 3: Update `README.md` (TOC + Consistency Review)

- **TODO file**: `.agent/todos/20260701/20260701-todo-0.md`
- **Task**: Task 3 — Update `README.md` (Critical Workflow step 4.1 — Analysis & Planning)
- **Target file**: `README.md` (repo root, 328 lines)
- **Scope**: Documentation-only change. No source code edits.

## 1. High-Level Approach

1. Add a **Table of Contents** section at the top of `README.md`, anchored to all major (`##`) and meaningful subsection (`###`) headings, inserted between the intro paragraph and `## About`.
2. Perform a full consistency review of `README.md` against the TODO requirements:
   - DTO examples use broad-DTO + narrowing pattern (no `Omit<Debt, ...>` / `Omit<Client, ...>`).
   - Encryption section mentions `EncryptedValue | string | null`.
   - No outdated `name` field references in examples.
   - No broken or inconsistent internal / `docs/*.md` links.
3. Verify cross-references between README and `docs/*.md` files are accurate.
4. No other content edits are required — the review confirms `README.md` is already consistent.

## 2. Scan Results (Consistency Review)

| Check | Finding | Status |
|---|---|---|
| `Omit<Debt\|...>` / `Omit<Client\|...>` hand-rolled patterns | None remaining. Only `Omit<CreateDebtDto, 'debtCode' \| 'status'>` (lines 134, 168) — correct broad-DTO + narrowing pattern. | ✅ |
| Encryption section mentions `EncryptedValue \| string \| null` | Present at line 45. | ✅ |
| Outdated `name` field references | None. Only hit is "key name" (line 78) — not a field reference. | ✅ |
| Internal / doc cross-reference links | All 9 distinct link targets resolve to existing files. | ✅ |
| Duplicate example block | Lines 134 and 168 contain a duplicate `Omit<CreateDebtDto, ...>` example block (one in prose example, one in narrowing section). Harmless redundancy. Flagged for optional deduplication; not a consistency violation. | ℹ️ Optional |

**Conclusion**: No content fixes required beyond inserting the TOC.

## 3. Cross-Reference Verification Matrix

| README Link (line) | Target File | Exists |
|---|---|---|
| 94 `docs/encryption-usage-guide.md` | `docs/encryption-usage-guide.md` | ✅ |
| 115 `.agent/project-info/architecture.md` | `.agent/project-info/architecture.md` | ✅ |
| 122 `.agent/project-info/entities-definition.csv` | `.agent/project-info/entities-definition.csv` | ✅ |
| 171 `.agent/project-info/entities-definition.csv` | (same) | ✅ |
| 171 `.agent/project-info/entities-relationship-diagram-overview.md` | `.agent/project-info/entities-relationship-diagram-overview.md` | ✅ |
| 318 `docs/usage-nestjs.md` | `docs/usage-nestjs.md` | ✅ |
| 319 `docs/usage-angular.md` | `docs/usage-angular.md` | ✅ |
| 320 `docs/openapi-examples.md` | `docs/openapi-examples.md` | ✅ |
| 324 `.agent/project-info/data-model-brief.md` | `.agent/project-info/data-model-brief.md` | ✅ |
| 325 `.agent/project-info/entities-definition.csv` | (same) | ✅ |
| 326 `.agent/project-info/entities-relationship-diagram-overview.md` | (same) | ✅ |
| 327 `docs/json-schema-usage.md` | `docs/json-schema-usage.md` | ✅ |
| 328 `docs/encryption-usage-guide.md` | (same) | ✅ |

## 4. Detailed Implementation Steps (Implementer)

### Step 1 — Insert Table of Contents

- **File**: `README.md`
- **Operation**: Insert a new `## Table of Contents` section between current line 3 (end of intro paragraph) and line 5 (`## About`).
- **Exact insertion**: one blank line, then the TOC block below, then one blank line before `## About`.

TOC markdown to insert (GitHub-flavored anchors):

```markdown
## Table of Contents

- [About](#about)
  - [Core Principles](#core-principles)
- [Types and Interfaces](#types-and-interfaces)
- [Data Encryption](#data-encryption)
  - [EncryptedValue Type](#encryptedvalue-type)
  - [Entities with Encrypted Fields](#entities-with-encrypted-fields)
  - [Encryption Flow Across Microservices](#encryption-flow-across-microservices)
  - [Searchable Encrypted Fields (Hash Columns)](#searchable-encrypted-fields-hash-columns)
- [Available Entities](#available-entities)
  - [Entity Audit & Optionality Notes](#entity-audit--optionality-notes)
- [DTOs (Data Transfer Objects)](#dtos-data-transfer-objects)
- [JSON Schemas](#json-schemas)
  - [Domain Groups](#domain-groups)
  - [Use Cases](#use-cases)
- [Tech Stack](#tech-stack)
- [Installation & Usage](#installation--usage)
  - [Extending an Entity in NestJS](#extending-an-entity-in-nestjs)
  - [Using Types in an Angular Service](#using-types-in-an-angular-service)
  - [Working with Enums](#working-with-enums)
- [Usage Examples](#usage-examples)
- [Related Documentation](#related-documentation)
```

### Step 2 — No Other Edits Required

The consistency review confirms all other `README.md` content is already aligned with the TODO requirements. Do not modify any other lines.

### Step 3 — Optional Deduplication (Implementer Discretion)

The two `Omit<CreateDebtDto, 'debtCode' | 'status'>` blocks at lines 134 and 168 are redundant. If deduplication is performed:
- Keep the block in the "narrow at the API boundary" prose (current line 134 area).
- Replace the standalone block at lines 164–169 with a forward reference: `// See narrowing example above.`

This is optional and not required for TODO compliance.

## 5. Verification Steps (Implementer)

1. Re-read `README.md` to confirm the TOC block is inserted at the correct location and `## About` follows immediately after.
2. Verify every TOC anchor link matches the corresponding heading's GitHub-generated anchor:
   - Lowercase heading text.
   - Spaces → `-`.
   - `&` removed, leaving `--`.
   - Parentheses removed.
3. Run `npm run build` to confirm no source regressions (README change is doc-only; build should remain green).
4. Re-scan `README.md` for `Omit<Debt` / `Omit<Client` patterns to confirm none were introduced.

## 6. Git Actions (Implementer)

- After successful implementation, commit with message: `docs: add TOC to README and complete consistency review`.
- Follow `gitignore-compliance.md` before committing (read `.gitignore`, run `git status`).

## 7. Out of Scope (Not Done by This Plan)

- No `npm run build` / `npm test` execution at planning stage.
- No git actions at planning stage.
- No edits to other files (only `README.md` is modified, and only to insert the TOC).
- No source code (`src/`) changes.
- No edits to `docs/*.md` or `.agent/project-info/*` files.