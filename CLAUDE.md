# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Side Project Saturday - A web application for managing weekly side project meetups in Brooklyn, NY. Built with Astro SSR on Cloudflare Workers edge runtime.

## Essential Commands

```bash
# Development
mise dev                    # Start development server at localhost:4433
mise build                  # Build for production
mise preview               # Preview production build locally
mise fmt                   # Format code with Biome

# Email Development
mise emails                # Preview email templates with react-email

# Database
mise migrate:create migration_name  # Create new migration
mise migrate:dev           # Apply migrations locally
mise migrate:prod          # Apply migrations to production
mise gen:better-auth       # Generate better-auth types

# Deployment
mise deploy                # Deploy to Cloudflare via Alchemy
mise destroy               # Destroy Cloudflare resources
mise logs                  # View production logs
mise open:deployment       # Open Cloudflare dashboard
```

## Architecture Overview

### Technology Stack
- **Framework**: Astro v5 with SSR enabled for Cloudflare Workers
- **Styling**: Tailwind CSS v4 (new Vite plugin) + DaisyUI v5
- **Auth**: better-auth with magic link authentication (passwordless)
- **Database**: SQLite via Cloudflare D1 with Prisma ORM
- **Email**: Resend API for sending magic links and event invites
- **Email Templates**: React Email with custom branded templates
- **Deployment**: Alchemy deployment system
- **Tooling**: mise for task management, Biome for formatting

### Key Architectural Decisions

1. **Edge-First Architecture**: Everything runs on Cloudflare Workers edge runtime. Database access uses Prisma's D1 adapter for edge compatibility.

2. **Authentication Flow**:
   - Magic link only (no passwords)
   - Server actions in `src/actions/index.ts` handle auth mutations
   - Auth state managed via middleware in `src/middleware.ts`
   - Sessions stored in D1 database

3. **Server-Side Rendering**: Astro configured with `output: 'server'` and Cloudflare adapter. All pages are SSR'd at the edge.

4. **Form Handling**: Uses Astro Actions (server-side form handlers) for mutations. Actions are defined in `src/actions/` and called from components.

### Database Schema

The app uses Prisma with these main tables:
- `user`: Core user data
- `session`: Active user sessions
- `account`: OAuth provider accounts (for future expansion)
- `verification`: Magic link verification tokens

Database migrations are managed by Prisma but require manual SQL application to D1.

### Development Workflow

1. **Environment Variables**: Required vars include `AUTH_SECRET`, `RESEND_API_KEY`, and D1 database binding
2. **Code Style**: Biome enforces tabs, double quotes, and consistent formatting
3. **No Test Framework**: Currently no automated testing setup

### Important Patterns

- **Auth Check Pattern**: Use `Astro.locals.user` in pages/components to check auth state
- **Server Actions**: All mutations go through actions in `src/actions/`
- **Database Access**: Always use Prisma client from `src/lib/auth.ts` which is configured for D1
- **Email Templates**: Three main templates in `src/emails/`:
  - `MagicLinkEmail.tsx`: Authentication magic links
  - `VerificationEmail.tsx`: New user email verification
  - `EventInviteEmail.tsx`: Event invitation emails

## Deployment

The app deploys to Cloudflare using Alchemy deployment system configured in `alchemy.run.ts`:

- **D1 Database**: Configured with `D1Database("sps-db")` and automatic migrations from `prisma/migrations`
- **Worker**: Astro build with `nodejs_compat_v2` compatibility flags for React Email support
- **Environment Variables**: `RESEND_API_KEY`, `BETTER_AUTH_BASE_URL`, and `DB` binding
- **Edge Compatibility**: React DOM configured to use `react-dom/server.edge` in production to avoid MessageChannel issues

## Development Notes

1. **React 19 + Edge Runtime**: Uses `react-dom/server.edge` alias in `astro.config.mjs` to prevent MessageChannel errors
2. **TypeScript Configuration**: JSX configured with `"jsx": "react-jsx"` to avoid explicit React imports
3. **Email Development**: Use `mise emails` to preview templates during development
4. **Database Changes**: Always create migrations with `mise migrate:create` and apply with `mise migrate:dev`
5. **Authentication**: All auth flows go through better-auth magic links - no password authentication
6. **Styling**: Uses Tailwind v4 with the new Vite plugin for improved performance

## Code Organization and Best Practices

- **Import Paths**: Prefer prefixing esm import paths with `@` which points to the src directory instead of deeply nested relative imports. So `@/lib/auth` instead of `../../lib/auth`

## Utility Patterns

- **Date Calculations**: If you need to calculate a date, add that logic in @src/lib/date-utils.ts. Make sure you check it first to see if what you need already exists.