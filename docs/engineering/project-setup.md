# Project Setup

## Current Repository State

The repository has been initialized with Git and project planning documents. The React Native app has not been scaffolded yet.

## Recommended Baseline

- React Native via Expo.
- TypeScript.
- Expo Router if the app starts with tab/navigation structure.
- Supabase for backend services once the app shell exists.
- Unit tests for domain logic, especially the natural-language parser.

## Node Version

The current local Node version observed during setup is:

```txt
v25.8.0
```

React Native and Expo projects are usually safer on an active LTS Node release. Before app scaffolding, add a project-level Node version file and use an LTS version such as Node 22 unless the chosen Expo version requires otherwise.

## Planned Setup Steps

1. Add a Node version file.
2. Scaffold the Expo TypeScript app in this repository.
3. Add linting and formatting.
4. Add path aliases.
5. Add test tooling for pure TypeScript modules.
6. Create initial domain modules for baby logs and natural-language parsing.
7. Add Supabase only after app structure and domain boundaries are clear.

## Initial Domain Modules

Expected early modules:

```txt
src/domain/baby-logs/
src/domain/parser/
src/domain/insights/
src/features/logging/
src/features/timeline/
src/features/home/
```

## Verification Expectations

After scaffolding, each meaningful change should run:

```sh
npm run lint
npm run typecheck
npm test
```

The exact commands may change after tooling is installed. Keep this document updated when scripts are added or renamed.

