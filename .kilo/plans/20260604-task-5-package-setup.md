# Task 5 Implementation Plan: Set Up and Configure package.json

**Plan Date**: 2026-06-04
**Task**: Expand root `package.json`, create `tsconfig.json`, install devDependencies, verify TypeScript compiles, and commit.
**Branch**: `feat/initialize-project`

## 1. package.json Expansion

Replace current minimal content with expanded configuration:

```json
{
  "name": "@cobranza-apps/entities",
  "version": "0.0.1",
  "private": true,
  "description": "Central data model definitions for the Cobranza App system",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run clean && npm run build"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0"
  },
  "engines": {
    "node": ">=20",
    "npm": ">=10"
  },
  "keywords": [
    "typescript",
    "entities",
    "conciliador",
    "types",
    "interfaces",
    "enums"
  ],
  "license": "Unlicense"
}
```

## 2. tsconfig.json Creation

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

## 3. npm Install

Run `npm install` to install `typescript` and `@types/node`. Ensure `node_modules/` is NOT staged (gitignored).

## 4. Verification

- Run `npx tsc --noEmit` — should exit with 0.
- Optionally run `npm run build` — should create `dist/`.

## 5. Git Commit

- Stage: `package.json`, `tsconfig.json`, `package-lock.json`
- Ensure NOT staged: `node_modules/`, `dist/`
- Commit: `chore: configure package.json and tsconfig.json with TypeScript setup`
