# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Side Project Saturday - A web application for managing weekly side project meetups in Brooklyn, NY. Built with Astro SSR on Cloudflare Workers edge runtime.

## Essential Commands

```bash
# Start development server
mise dev

# Build for production
mise build

# Preview production build locally
mise preview

# Format code
mise fmt

# Deploy to Cloudflare
mise deploy

# View production logs
mise logs
```

## Architecture Overview

### Technology Stack
- **Framework**: Astro v5 with SSR enabled for Cloudflare Workers
- **Styling**: Tailwind CSS v4 (new Vite plugin) + DaisyUI v5
- **Auth**: better-auth with magic link authentication (passwordless)
- **Database**: SQLite via Cloudflare D1 with Prisma ORM
- **Email**: Resend API for sending magic links

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
- **Client Auth**: Use `authClient` from `src/lib/auth-client.ts` for client-side auth operations
- **Database Access**: Always use Prisma client from `src/lib/auth.ts` which is configured for D1

## Deployment

The app deploys to Cloudflare using Alchemy deployment system. Environment variables and D1 database are managed through Cloudflare dashboard.