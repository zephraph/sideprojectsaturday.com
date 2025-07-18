# Analysis: Cloudflare to Trigger.dev Migration

## Current Cloudflare Implementation

### 1. Event Management Workflow (`src/services/event-management.tsx`)

**Purpose**: Manages the entire lifecycle of Side Project Saturday events automatically

**Trigger**: Cron schedule - `"0 14 * * 1"` (Mondays at 9 AM EST / 10 AM EDT)

**Workflow Steps**:
1. **Monday**: Creates a new event in the database for the upcoming Saturday
2. **Wednesday**: Sends event invitation broadcast email via Resend
3. **Saturday 7 AM**: Sends "event today" reminder emails to all RSVPd users
4. **Saturday 9 AM**: Marks event as "inprogress" and unlocks the door
5. **Saturday 12 PM**: Marks event as "completed", locks the door, and resets all RSVPs

**Technical Details**:
- Uses `WorkflowEntrypoint` class with durable execution
- Uses `step.do()` for idempotency and `step.sleep()` for delays
- Integrates with Resend API and React Email templates
- Manages door state through KV store

### 2. User Event Consumer (`src/services/user-event-consumer.ts`)

**Purpose**: Processes user-related events asynchronously via Cloudflare Queue

**Trigger**: Messages sent to `sps-user-event` queue

**Event Types**:
- `user_create`: Adds user to Resend audience, optionally sends welcome email
- `user_update`: Handles email changes and subscription status updates

**Queue Usage Points**:
- Email verification completion in `src/lib/auth.ts` (lines 81-91)
- Bulk user imports in `src/pages/api/admin/import-users.ts` (lines 137-145)

**Technical Details**:
- Processes messages with retry capabilities
- Integrates with Resend API for contact management
- Batch size: 1, Max concurrency: 1, Retry delay: 15 seconds

### 3. Integration Points

**Database Interactions**:
- Event table: Creates events, updates status
- User table: Reads RSVPd users, resets RSVP status

**External Services**:
- Resend API: Email sending and contact management
- KV Store: Door lock status management
- D1 Database: Persistent data storage

## Existing Trigger.dev Setup

### Configuration (`trigger.config.ts`)
- **Project ID**: `proj_aglkuqslobvgjsbezoyi`
- **Runtime**: Node
- **Max Duration**: 3600 seconds
- **Retry**: Enabled with exponential backoff (max 3 attempts)
- **Trigger Directory**: `./src/trigger` (not yet created)

### Dependencies
- `@trigger.dev/sdk`: ^3.3.17
- `@trigger.dev/build`: ^3.3.17

### Missing Components
- No trigger functions exist yet
- No Trigger.dev environment variables configured
- No CLI commands in `mise.toml`

## Migration Plan

### 1. Event Management Migration
**Convert Cloudflare Workflow → Trigger.dev Scheduled Job**
- Create a scheduled trigger job with cron: `"0 14 * * 1"`
- Implement all workflow steps as a single job with delays
- Use Trigger.dev's built-in retry and idempotency features
- Access KV store via API calls from within Trigger job

### 2. User Event Processing Migration
**Remove Cloudflare Queue → Direct Trigger.dev Event Triggers**
- Replace queue sends with direct Trigger.dev event triggers
- Create separate Trigger jobs for each event type:
  - `user.created` job for new user processing
  - `user.updated` job for user updates
- Remove all queue infrastructure (queue consumer, worker, bindings)
- Update code that sends to queue to instead trigger Trigger.dev events

### 3. Infrastructure Changes Required

**Remove from `alchemy.run.ts`**:
- `sps-user-event` queue resource
- `userEventWorker` definition
- `eventWorker` definition
- Queue bindings from main worker

**Remove Files**:
- `src/services/user-event-consumer.ts` (queue consumer)
- `src/services/event-management.tsx` (workflow)

**Update Code**:
- `src/lib/auth.ts`: Replace queue send with Trigger event
- `src/pages/api/admin/import-users.ts`: Replace queue send with Trigger event
- Remove `USER_EVENT_QUEUE` from environment types

**Add Trigger.dev Setup**:
- Create `src/trigger/` directory
- Add environment variables for Trigger.dev
- Create trigger jobs for all functionality
- Add Trigger.dev CLI commands to `mise.toml`

### 4. Benefits of This Approach
- Simpler architecture (no separate queue infrastructure)
- Direct event triggering is more straightforward
- Trigger.dev handles retries, delays, and idempotency
- Better observability with Trigger.dev dashboard
- No need to manage separate workers and bindings