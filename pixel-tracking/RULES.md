# Pixel Tracking System — Implementation Rules

> **These rules are MANDATORY and must be referred to before EVERY task during implementation.**

---

## Database Rules

1. **NEVER use `drizzle-kit push`.** Only `generate` then `migrate`.
2. After any schema change: run `pnpm drizzle:generate` then `pnpm drizzle:migrate`.
3. If a migration **fails**, STOP EVERYTHING. Report to the user. The user will manually drop the failed migration file. Then fix the schema and re-generate/re-migrate.
4. Follow the existing schema patterns exactly:
   - UUIDv7 primary keys: `uuid("id").$defaultFn(() => v7()).primaryKey()`
   - `snake_case` DB column names, `camelCase` JS property names
   - `createdAt` with `withTimezone: true, mode: "date"`, `.defaultNow().notNull()`
   - Log/event tables are **append-only** — `createdAt` only, no `updatedAt`
   - Foreign key deletes: `"set null"` for user references in log tables, `"cascade"` for owned resources
   - Enums defined with `pgEnum` above the table that uses them
   - JSONB for flexible payload data

## TypeScript Rules

5. After EVERY code change, run `npx tsc --noEmit` and ensure zero errors before moving on.
6. Follow existing import alias pattern: `#root/` prefix for project imports.
7. Follow existing naming conventions:
   - Files: `kebab-case` (e.g., `track-event`, `pixel-config`)
   - Types/Interfaces: `PascalCase`
   - Variables/functions: `camelCase`
   - DB enums: `camelCase` variable, `snake_case` values

## Code Quality Rules

8. After completing any task, **REVIEW the code introduced** — check for:
   - Hidden bugs or logic errors
   - Incorrect types or any `as any` casts
   - Missing error handling
   - Broken imports or circular dependencies
   - Anything that could silently break existing functionality
9. **Never break existing functionality.** The pixel system is purely additive.
10. Write integration tests for each phase to verify nothing breaks.

## Architecture Rules

11. Follow the **exact same patterns** from the existing codebase:
    - tRPC procedures: thin adapter in `trpc.ts`, logic in `service.ts`
    - Effect-TS: `Effect.gen` + `query()` helper + `provideDatabase(ctx)` pattern
    - Backend modules: feature-folder with sub-operation folders (`verb-noun/trpc.ts + service.ts`)
    - React contexts: `createContext` + `Provider` component + `useHook` pattern
    - Fastify plugins: `fastify-plugin` wrapper + `declare module "fastify"` augmentation
12. Register new routers in `shared/trpc/router.ts` following existing pattern.
13. Register new middleware/plugins in `server/server.ts` in the correct order.
14. New shared types go in `shared/types/pixel-tracking.ts`.

## Workflow Rules

15. **Always work with the plan and progress tracker files in mind.** Before starting a task, check `PROGRESS_TRACKER.md`. After completing a task, update `PROGRESS_TRACKER.md`.
16. Tackle one sub-task at a time. Mark it in-progress, complete it, verify it, then move to the next.
17. Each phase must be fully complete and verified before starting the next phase.
18. Run TypeScript check after EVERY file change, not just at the end.

## Testing Rules

19. Set up vitest infrastructure in Phase 1 (it's installed but not configured).
20. Integration tests must verify:
    - Existing tRPC procedures still work after changes
    - New schema tables are created correctly
    - New tRPC procedures return expected shapes
    - Event bus emits correct events
    - Server-side tracking endpoint accepts and processes events
21. Tests go in `__tests__/` folders co-located with the code they test, or in a top-level `tests/` folder.

## File Organization Rules

22. All pixel tracking documentation lives in `pixel-tracking/` folder.
23. Backend code goes in `backend/pixel-tracking/` following the feature-folder pattern.
24. Frontend tracking context goes in `frontend/contexts/TrackingContext.tsx`.
25. Shared types go in `shared/types/pixel-tracking.ts`.
26. Schema additions go in `shared/database/drizzle/schema.ts` (append at bottom following existing pattern).
