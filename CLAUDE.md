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
- **Framework**: Astro with SSR enabled for Cloudflare Workers
- **Styling**: Tailwind CSS v4 (new Vite plugin) + DaisyUI
- **Auth**: better-auth with magic link authentication (passwordless)
- **Database**: SQLite via Cloudflare D1 with Prisma ORM
- **Email**: Resend for sending emails
- **Email Templates**: React Email with custom branded templates
- **React**: v19 (using latest React features)
- **Automation**: Cloudflare Workflows & Queues for event management
- **IoT**: SwitchBot API for physical door control
- **Deployment**: Alchemy deployment system
- **Tooling**: mise for task management, Biome for formatting, TypeScript

### Key Architectural Decisions

1. **Edge-First Architecture**: Everything runs on Cloudflare Workers edge runtime. Database access uses Prisma's D1 adapter for edge compatibility.

2. **Event-Driven Architecture**:
   - Cloudflare Workflows manage the event lifecycle automatically
   - Cloudflare Queues handle async user event processing
   - Cron jobs trigger weekly event management tasks

3. **Authentication Flow**:
   - Magic link only (no passwords)
   - Server actions in `src/actions/index.ts` handle auth mutations
   - Auth state managed via middleware in `src/middleware.ts`
   - Sessions stored in D1 database

4. **Server-Side Rendering**: Astro configured with `output: 'server'` and Cloudflare adapter. All pages are SSR'd at the edge.

5. **Form Handling**: Uses Astro Actions (server-side form handlers) for mutations. Actions are defined in `src/actions/` and called from components.

6. **Physical-Digital Integration**: SwitchBot API integration enables remote door control during active events.

### Database Schema

The app uses Prisma with these main tables:
- `user`: Core user data with `subscribed` and `rsvped` boolean fields
- `session`: Active user sessions
- `account`: OAuth provider accounts (for future expansion)
- `verification`: Magic link verification tokens
- `event`: Scheduled events with:
  - `id`, `eventDate`, `status` (scheduled/inprogress/canceled/completed)
  - `createdAt`, `updatedAt`
- `break`: Scheduled breaks with:
  - `id`, `startDate`, `endDate`, `reason`
  - `createdAt`, `updatedAt`

Database migrations are managed by Prisma but require manual SQL application to D1.

### Development Workflow

1. **Environment Variables**:
   - `AUTH_SECRET`: Authentication secret
   - `RESEND_API_KEY`: Resend API key
   - `RESEND_AUDIENCE_ID`: Resend audience for broadcasts
   - `SWITCHBOT_TOKEN`, `SWITCHBOT_KEY`, `SWITCHBOT_DEVICE_ID`: Door control
   - `ADMIN_EMAIL`: Admin notifications
   - `DB`: D1 database binding
2. **Code Style**: Biome enforces tabs, double quotes, and consistent formatting
3. **No Test Framework**: Currently no automated testing setup

### Important Patterns

- **Auth Check Pattern**: Use `Astro.locals.user` in pages/components to check auth state
- **Server Actions**: All mutations go through actions in `src/actions/`
- **Database Access**: Always use Prisma client from `src/lib/auth.ts` which is configured for D1
- **Email Templates**: Templates in `src/emails/`:
  - `MagicLinkEmail.tsx`: Authentication magic links
  - `VerificationEmail.tsx`: New user email verification
  - `EventInviteEmail.tsx`: Event invitation emails
  - `EventTodayEmail.tsx`: Morning-of event reminders
  - `RsvpConfirmationEmail.tsx`: RSVP confirmation
  - `WelcomeEmail.tsx`: Welcome message for new users
- **Admin Protection**: Admin routes check `user.role === 'admin'` before allowing access
- **Event Status Checks**: Door buzzer and other event features check `event.status === 'inprogress'`

## Deployment

The app deploys to Cloudflare using Alchemy deployment system configured in `alchemy.run.ts`:

### Resources
- **D1 Database**: `sps-db` with automatic migrations from `prisma/migrations`
- **KV Namespace**: `sps-kv` for caching and temporary storage
- **Queue**: `sps-user-event` for async user event processing
- **Workflow**: `event-management` for event scheduling automation

### Workers
1. **Main Worker** (Astro SSR):
   - Handles all web traffic and API endpoints
   - Bindings: DB, KV, all env vars, USER_EVENT_QUEUE
   - Uses `nodejs_compat_v2` for React Email support

2. **User Event Worker**:
   - Processes user events from queue asynchronously
   - Handles Resend audience sync and user updates
   - Bindings: DB, KV, RESEND_API_KEY

3. **Event Worker**:
   - Manages event scheduling via workflows
   - Runs on cron: "0 14 * * 1" (Mondays at 9 AM EST/10 AM EDT)
   - Creates weekly events and manages their lifecycle

### Edge Compatibility
- React DOM configured to use `react-dom/server.edge` in production
- All workers use `nodejs_compat_v2` compatibility flag

## Development Notes

1. **React v19 + Edge Runtime**: Uses `react-dom/server.edge` alias in `astro.config.mjs` to prevent MessageChannel errors
2. **TypeScript Configuration**: JSX configured with `"jsx": "react-jsx"` to avoid explicit React imports
3. **Email Development**: Use `mise emails` to preview templates during development
4. **Database Changes**: Always create migrations with `mise migrate:create` and apply with `mise migrate:dev`
5. **Authentication**: All auth flows go through better-auth magic links - no password authentication
6. **Styling**: Uses Tailwind v4 with the new Vite plugin for improved performance
7. **Event Management**: Events are automatically managed by workflows - no manual intervention needed
8. **Door Access**: Test door buzzer functionality during active events only (status = 'inprogress')

## Code Organization and Best Practices

- **Import Paths**: Prefer prefixing esm import paths with `@` which points to the src directory instead of deeply nested relative imports. So `@/lib/auth` instead of `../../lib/auth`
- **Component Organization**: RSVP-related components go in `src/components/rsvp/`
- **API Routes**: Admin API endpoints go in `src/pages/api/admin/`
- **Service Layer**: Workflows and queue handlers go in `src/services/`

## Utility Patterns

- **Date Calculations**: If you need to calculate a date, add that logic in @src/lib/date-utils.ts. Make sure you check it first to see if what you need already exists.
- **Admin Checks**: Always verify `user.role === 'admin'` for admin features
- **Event Status**: Check `event.status` for feature availability (e.g., door buzzer)

## Package Management Notes

- **Package Installation**: Use pnpm to install dependencies

## Feature-Specific Implementation Details

### Event Management Workflow
The `EventManagementWorkflow` in `src/services/event-management-workflow.ts` handles:
1. **Monday**: Creates new event for upcoming Saturday
2. **Wednesday**: Sends invitations via Resend broadcast
3. **Saturday 7AM**: Sends "event today" reminders
4. **Saturday 9AM**: Marks event as in-progress, unlocks door
5. **Saturday 12PM**: Completes event, locks door, resets RSVPs

### Door Buzzer Integration
- Endpoint: `/api/buzz`
- Page: `/buzz`
- Only works during active events (status = 'inprogress')
- Uses SwitchBot API to remotely unlock building door
- 30-second unlock duration with visual countdown

### User Event Queue
- Queue name: `sps-user-event`
- Handles async processing of user updates
- Syncs users with Resend audience for email broadcasts
- Processes subscription status changes

### Admin Dashboard Features
- Event scheduling, rescheduling, and cancellation
- Break scheduling for holiday periods
- User management with role updates
- Bulk user import functionality
- Real-time RSVP tracking

---

# Instructions for the usage of Backlog.md CLI Tool

## 1. Source of Truth

- Tasks live under **`backlog/tasks/`** (drafts under **`backlog/drafts/`**).
- Every implementation decision starts with reading the corresponding Markdown task file.
- Project documentation is in **`backlog/docs/`**.
- Project decisions are in **`backlog/decisions/`**.

## 2. Defining Tasks

### **Title**

Use a clear brief title that summarizes the task.

### **Description**: (The **"why"**)

Provide a concise summary of the task purpose and its goal. Do not add implementation details here. It
should explain the purpose and context of the task. Code snippets should be avoided.

### **Acceptance Criteria**: (The **"what"**)

List specific, measurable outcomes that define what means to reach the goal from the description. Use checkboxes (`- [ ]`) for tracking.
When defining `## Acceptance Criteria` for a task, focus on **outcomes, behaviors, and verifiable requirements** rather
than step-by-step implementation details.
Acceptance Criteria (AC) define *what* conditions must be met for the task to be considered complete.
They should be testable and confirm that the core purpose of the task is achieved.
**Key Principles for Good ACs:**

- **Outcome-Oriented:** Focus on the result, not the method.
- **Testable/Verifiable:** Each criterion should be something that can be objectively tested or verified.
- **Clear and Concise:** Unambiguous language.
- **Complete:** Collectively, ACs should cover the scope of the task.
- **User-Focused (where applicable):** Frame ACs from the perspective of the end-user or the system's external behavior.

    - *Good Example:* "- [ ] User can successfully log in with valid credentials."
    - *Good Example:* "- [ ] System processes 1000 requests per second without errors."
    - *Bad Example (Implementation Step):* "- [ ] Add a new function `handleLogin()` in `auth.ts`."

### Task file

Once a task is created it will be stored in `backlog/tasks/` directory as a Markdown file with the format
`task-<id> - <title>.md` (e.g. `task-42 - Add GraphQL resolver.md`).

### Additional task requirements

- Tasks must be **atomic** and **testable**. If a task is too large, break it down into smaller subtasks.
  Each task should represent a single unit of work that can be completed in a single PR.

- **Never** reference tasks that are to be done in the future or that are not yet created. You can only reference
  previous
  tasks (id < current task id).

- When creating multiple tasks, ensure they are **independent** and they do not depend on future tasks.
  Example of wrong tasks splitting: task 1: "Add API endpoint for user data", task 2: "Define the user model and DB
  schema".
  Example of correct tasks splitting: task 1: "Add system for handling API requests", task 2: "Add user model and DB
  schema", task 3: "Add API endpoint for user data".

## 3. Recommended Task Anatomy

```markdown
# task‑42 - Add GraphQL resolver

## Description (the why)

Short, imperative explanation of the goal of the task and why it is needed.

## Acceptance Criteria (the what)

- [ ] Resolver returns correct data for happy path
- [ ] Error response matches REST
- [ ] P95 latency ≤ 50 ms under 100 RPS

## Implementation Plan (the how)

1. Research existing GraphQL resolver patterns
2. Implement basic resolver with error handling
3. Add performance monitoring
4. Write unit and integration tests
5. Benchmark performance under load

## Implementation Notes (only added after working on the task)

- Approach taken
- Features implemented or modified
- Technical decisions and trade-offs
- Modified or added files
```

## 6. Implementing Tasks

Mandatory sections for every task:

- **Implementation Plan**: (The **"how"**) Outline the steps to achieve the task. Because the implementation details may
  change after the task is created, **the implementation notes must be added only after putting the task in progress**
  and before starting working on the task.
- **Implementation Notes**: Document your approach, decisions, challenges, and any deviations from the plan. This
  section is added after you are done working on the task. It should summarize what you did and why you did it. Keep it
  concise but informative.

**IMPORTANT**: Do not implement anything else that deviates from the **Acceptance Criteria**. If you need to
implement something that is not in the AC, update the AC first and then implement it or create a new task for it.

## 2. Typical Workflow

```bash
# 1 Identify work
backlog task list -s "To Do" --plain

# 2 Read details & documentation
backlog task 42 --plain
# Read also all documentation files in `backlog/docs/` directory.
# Read also all decision files in `backlog/decisions/` directory.

# 3 Start work: assign yourself & move column
backlog task edit 42 -a @{yourself} -s "In Progress"

# 4 Add implementation plan before starting
backlog task edit 42 --plan "1. Analyze current implementation\n2. Identify bottlenecks\n3. Refactor in phases"

# 5 Break work down if needed by creating subtasks or additional tasks
backlog task create "Refactor DB layer" -p 42 -a @{yourself} -d "Description" --ac "Tests pass,Performance improved"

# 6 Complete and mark Done
backlog task edit 42 -s Done --notes "Implemented GraphQL resolver with error handling and performance monitoring"
```

### 7. Final Steps Before Marking a Task as Done

Always ensure you have:

1. ✅ Marked all acceptance criteria as completed (change `- [ ]` to `- [x]`)
2. ✅ Added an `## Implementation Notes` section documenting your approach
3. ✅ Run all tests and linting checks
4. ✅ Updated relevant documentation

## 8. Definition of Done (DoD)

A task is **Done** only when **ALL** of the following are complete:

1. **Acceptance criteria** checklist in the task file is fully checked (all `- [ ]` changed to `- [x]`).
2. **Implementation plan** was followed or deviations were documented in Implementation Notes.
3. **Automated tests** (unit + integration) cover new logic.
4. **Static analysis**: linter & formatter succeed.
5. **Documentation**:
    - All relevant docs updated (any relevant README file, backlog/docs, backlog/decisions, etc.).
    - Task file **MUST** have an `## Implementation Notes` section added summarising:
        - Approach taken
        - Features implemented or modified
        - Technical decisions and trade-offs
        - Modified or added files
6. **Review**: self review code.
7. **Task hygiene**: status set to **Done** via CLI (`backlog task edit <id> -s Done`).
8. **No regressions**: performance, security and licence checks green.

⚠️ **IMPORTANT**: Never mark a task as Done without completing ALL items above.

## 9. Handy CLI Commands

| Purpose          | Command                                                                |
|------------------|------------------------------------------------------------------------|
| Create task      | `backlog task create "Add OAuth"`                                      |
| Create with desc | `backlog task create "Feature" -d "Enables users to use this feature"` |
| Create with AC   | `backlog task create "Feature" --ac "Must work,Must be tested"`        |
| Create with deps | `backlog task create "Feature" --dep task-1,task-2`                    |
| Create sub task  | `backlog task create -p 14 "Add Google auth"`                          |
| List tasks       | `backlog task list --plain`                                            |
| View detail      | `backlog task 7 --plain`                                               |
| Edit             | `backlog task edit 7 -a @{yourself} -l auth,backend`                   |
| Add plan         | `backlog task edit 7 --plan "Implementation approach"`                 |
| Add AC           | `backlog task edit 7 --ac "New criterion,Another one"`                 |
| Add deps         | `backlog task edit 7 --dep task-1,task-2`                              |
| Add notes        | `backlog task edit 7 --notes "We added this and that feature because"` |
| Mark as done     | `backlog task edit 7 -s "Done"`                                        |
| Archive          | `backlog task archive 7`                                               |
| Draft flow       | `backlog draft create "Spike GraphQL"` → `backlog draft promote 3.1`   |
| Demote to draft  | `backlog task demote <task-id>`                                        |

## 10. Tips for AI Agents

- **Always use `--plain` flag** when listing or viewing tasks for AI-friendly text output instead of using Backlog.md
  interactive UI.
- When users mention to create a task, they mean to create a task using Backlog.md CLI tool.
