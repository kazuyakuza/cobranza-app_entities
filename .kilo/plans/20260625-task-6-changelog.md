# Task 6 — Update CHANGELOG.md (v0.4.0)

## Context

- Repo: `C:\projects\cobranza-app\entities` (`@cobranza-apps/entities`, package version `0.4.0`).
- Branch: `feat/entity-base-refactor`.
- Parent workflow step: Critical Workflow → Task 6 → 4.1 Analysis & Planning.
- This plan covers ONLY the CHANGELOG documentation update. No source code changes.

## Refactor being documented

- `SoftDeletable` merged into `BaseEntity` (`deletedAt`, `deletedBy` now part of `BaseEntity`).
- Audit field optionality inverted: `createdBy` required; `updatedAt` (and `updatedBy`) now optional.
- All 22 domain entities refactored to extend the consolidated `BaseEntity`.
- `Company.contact`, `Client.fullName`, `Debt.description` made optional.
- DTOs standardized to omit every `BaseEntity` field.
- JSON schemas regenerated for all entities.
- Tests updated to match new entity contracts.
- `entities-definition.csv` aligned with merged audit block + revised optionality.
- Project documentation refreshed.

## Current CHANGELOG.md state (verified)

- Header block (lines 1–6): Keep a Changelog badge + SemVer link — must stay intact.
- Top version section: `## [0.3.4] - 2026-06-22` (lines 8–25), subsections `### Changed` + `### Removed`.
- Oldest version section: `## [0.1.0] - 2026-06-05` (lines 27–48), subsection `### Added`.
- Footer link map (lines 50–51):
  - `[0.3.4]: https://github.com/cobranza-apps/entities/compare/v0.1.0...v0.3.4`
  - `[0.1.0]: https://github.com/cobranza-apps/entities/releases/tag/v0.1.0`

## High-Level Approach

Insert a new `## [0.4.0] - 2026-06-25` section directly above the existing `## [0.3.4]` section, using `### Changed` and `### Removed` subsections per Keep a Changelog convention. Then add a `[0.4.0]` link-ref to the footer map comparing `v0.3.4...v0.4.0`. Existing `[0.3.4]` and `[0.1.0]` link-refs stay unchanged (Keep a Changelog pattern: each version compares against its previous released version).

## Detailed Steps

### Step 1 — Confirm current CHANGELOG.md content

- Re-read `CHANGELOG.md` immediately before editing to ensure line numbers match before tool use.
- Confirm the blank line 7 separates the header block from the `[0.3.4]` section.

### Step 2 — Insert the new `[0.4.0]` version section

- Target: insert between current line 7 (blank) and current line 8 (`## [0.3.4] - 2026-06-22`).
- Preferred tool: `vscode-mcp-server_replace_lines_code` to replace the blank line 7 with the new section + a trailing blank line (keeps the single blank-line separator before `[0.3.4]`).
  - `startLine: 7`, `endLine: 7`, `originalCode: ""` (line 7 is empty).
  - If the empty-line match is rejected by the tool, fall back to `edit` with `oldString` = `"Keep a Changelog](https://keepachangelog.com/en/1.1.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n## [0.3.4] - 2026-06-22"` and `newString` = same preamble + new `[0.4.0]` block + `\n## [0.3.4] - 2026-06-22`.
- New section exact content:

```markdown
## [0.4.0] - 2026-06-25

### Changed

- Merged the `SoftDeletable` interface into `BaseEntity`: `deletedAt` and `deletedBy` audit fields are now part of `BaseEntity`, removing the need for a separate soft-delete interface.
- Inverted `BaseEntity` audit-field optionality: `createdBy` is now required, while `updatedAt` and `updatedBy` are now optional.
- Refactored all 22 domain entities to extend the consolidated `BaseEntity`.
- Made `Company.contact`, `Client.fullName`, and `Debt.description` optional to reflect updated data-model constraints.
- Standardized all DTO definitions to omit every `BaseEntity` field (`id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `deletedAt`, `deletedBy`).
- Regenerated JSON schemas for all entities to reflect the merged audit block and revised optionality.
- Updated the test suite to match the refactored entity contracts.
- Aligned `entities-definition.csv` with the merged `BaseEntity` audit block and revised property optionality.
- Refreshed project documentation (data-model brief, architecture, and README) to describe the consolidated `BaseEntity` model.

### Removed

- The standalone `SoftDeletable` interface; its fields are now inherited through `BaseEntity`.

```

- Verify the result keeps a single blank line between the new `[0.4.0]` `### Removed` block and the existing `## [0.3.4]` heading.

### Step 3 — Add the `[0.4.0]` link-ref to the footer map

- Target: footer link block at end of file (current lines 50–51).
- Insert one new line above `[0.3.4]:`:

```markdown
[0.4.0]: https://github.com/cobranza-apps/entities/compare/v0.3.4...v0.4.0
```

- Do NOT modify the existing `[0.3.4]:` or `[0.1.0]:` link-ref lines.
- Preferred tool: `edit` with `oldString` = `"[0.3.4]: https://github.com/cobranza-apps/entities/compare/v0.1.0...v0.3.4"` and `newString` = `"[0.4.0]: https://github.com/cobranza-apps/entities/compare/v0.3.4...v0.4.0\n[0.3.4]: https://github.com/cobranza-apps/entities/compare/v0.1.0...v0.3.4"` (inserts the new ref above `[0.3.4]` and preserves it).

### Step 4 — Verify the edit

- Re-read the full `CHANGELOG.md` to confirm:
  - Header block intact (lines 1–6).
  - New `[0.4.0]` section appears, followed by `[0.3.4]`, then `[0.1.0]` — descending chronological order.
  - Footer link map contains exactly three entries: `[0.4.0]`, `[0.3.4]`, `[0.1.0]`.
  - No duplicated blank lines; no duplicate version headings.
- Optional sanity: `git diff --stat CHANGELOG.md` to confirm only that file changed.

### Step 5 — Format / lint check (non-blocking)

- `CHANGELOG.md` is not in `src`, and the prettier `format:check` script targets `src/**/*.ts` only — prettier will not touch the changelog. Skip prettier.
- No markdown linter is configured in this repo; no extra check required.

### Step 6 — Git handling

- Before committing, re-read `.gitignore` and run `git status` per Gitignore Compliance Rule; confirm only `CHANGELOG.md` is staged.
- Stage and commit:
  - `git add CHANGELOG.md`
  - Commit message: `docs(changelog): document v0.4.0 entity base refactor`
- Do NOT push (work continues on `feat/entity-base-refactor`; push is handled later by the implementer per Step 5 of the Critical Workflow, `origin` only).

## Proposed final shape of CHANGELOG.md (excerpt)

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-06-25

### Changed

- Merged the `SoftDeletable` interface into `BaseEntity` ...
- Inverted `BaseEntity` audit-field optionality ...
- Refactored all 22 domain entities to extend the consolidated `BaseEntity`.
- Made `Company.contact`, `Client.fullName`, and `Debt.description` optional ...
- Standardized all DTO definitions to omit every `BaseEntity` field ...
- Regenerated JSON schemas for all entities ...
- Updated the test suite to match the refactored entity contracts.
- Aligned `entities-definition.csv` with the merged `BaseEntity` audit block ...
- Refreshed project documentation ...

### Removed

- The standalone `SoftDeletable` interface; its fields are now inherited through `BaseEntity`.

## [0.3.4] - 2026-06-22
... (unchanged) ...

[0.4.0]: https://github.com/cobranza-apps/entities/compare/v0.3.4...v0.4.0
[0.3.4]: https://github.com/cobranza-apps/entities/compare/v0.1.0...v0.3.4
[0.1.0]: https://github.com/cobranza-apps/entities/releases/tag/v0.1.0
```

## Verification checklist (must pass before 4.5)

- [ ] `## [0.4.0] - 2026-06-25` heading present and located above `## [0.3.4]`.
- [ ] `### Changed` subsection lists all 9 documented changes from the refactor.
- [ ] `### Removed` subsection mentions `SoftDeletable` removal.
- [ ] Footer link map contains `[0.4.0]` ref; `[0.3.4]` and `[0.1.0]` refs unchanged.
- [ ] No source code under `src/` modified.
- [ ] Commit contains only `CHANGELOG.md`.

## Out of scope (NOT done in this task)

- No `package.json` version bump (already at `0.4.0`; handled by Step 3 of Critical Workflow).
- No README / data-model-brief edits (handled by Task 3 / docs-specialist step).
- No JSON schema / CSV / test edits (handled by earlier tasks).
- No git push.