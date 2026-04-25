# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LexFlow is a multi-tenant SaaS legal management platform for law firms in Latin America. Built with Next.js 15, TypeScript, and Tailwind CSS 4.

## Common Commands

```bash
pnpm dev          # Build and start dev server
pnpm build        # Production build
pnpm start        # Production server
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check
pnpm db:push      # Push schema to TursoDB
pnpm db:generate  # Generate Drizzle migrations
pnpm db:studio    # Open Drizzle Studio
pnpm db:seed      # Seed database
```

## Architecture

### Route Groups (app directory)

- `(auth)` - Sign in/sign up pages (public)
- `(dashboard)` - Main application (protected)
- `(marketing)` - Landing page (public)
- `(portal)` - Client portal (limited access)
- `super-admin/` - Super admin panel (super_admin role only)

### Data Layer (`lib/data/`)

All database operations go through files in `lib/data/`: cases.ts, clients.ts, documents.ts, hearings.ts, tasks.ts, notifications.ts, users.ts. Each wraps Drizzle queries with organization-scoped security.

### Authentication & Authorization (`lib/auth/`)

- `middleware.ts` - Route protection, role-based redirects
- `guard.ts` - Authorization checks
- `permissions.ts` - Role permissions

### Database Schema (`lib/db/schema.ts`)

Core tables: organizations, memberships, users, lawyers, clients, cases, case_events, hearings, documents, tasks, notifications, audit_logs, rama_sync_log.

### Role Hierarchy

1. **super_admin** - Access to all organizations and super-admin routes
2. **admin** - Full CRUD within their organization
3. **lawyer** - CRUD for cases, clients, documents
4. **client** - Read-only access to their own cases

## Key Patterns

- Multi-tenancy enforced via `organizationId` in every data query
- Middleware extracts role from Clerk session claims metadata
- API routes use Server Actions for mutations
- UI components follow Radix UI + shadcn pattern in `components/ui/`

## Screen Mapping (by SPEC)

### Marketing y Acceso
- Landing: `app/page.tsx` (SCREEN_28)
- Login: `app/(auth)/sign-in` (SCREEN_6)
- Registro: `app/(auth)/sign-up` (SCREEN_6)
- Pricing: `app/(marketing)/pricing/page.tsx`

### Super Admin
- Dashboard: `app/super-admin/page.tsx` (SCREEN_35)
- Organizations: `app/super-admin/organizations/page.tsx` (SCREEN_22)
- Settings: `app/super-admin/settings/page.tsx` (SCREEN_33)
- Unauthorized: `app/unauthorized/page.tsx` (SCREEN_32)

### Bufete (Admin)
- Dashboard: `app/(dashboard)/dashboard/page.tsx` (SCREEN_21)
- Cases: `app/(dashboard)/cases/page.tsx` (SCREEN_12)
- Clients: `app/(dashboard)/clients/page.tsx` (SCREEN_15)
- Lawyers: `app/(dashboard)/settings/lawyers/page.tsx` (SCREEN_30)
- Billing: `app/(dashboard)/billing/page.tsx` (SCREEN_20)
- Calendar: `app/(dashboard)/calendar/page.tsx` (SCREEN_19)

### Portal Cliente
- Dashboard: `app/(portal)/portal/page.tsx` (SCREEN_2)
- Cases: `app/(portal)/portal/cases/page.tsx`
- Case Detail: `app/(portal)/portal/cases/[id]/page.tsx` (SCREEN_4)