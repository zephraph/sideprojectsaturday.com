# Convert from Cloudflare to Trigger.dev
**Status:** InProgress
**Agent PID:** 39523

## Original Todo
Convert from cloudflare workflows and crons to using trigger.dev. `event-management.tsx` and `user-event-consumer.ts` should be moved to trigger functions. I've already got trigger.dev setup.

## Description
We're migrating the Side Project Saturday event automation system from Cloudflare Workflows and Queues to Trigger.dev. This involves converting the event management workflow (that runs weekly to create and manage events) and completely removing the Cloudflare queue infrastructure in favor of direct Trigger.dev event triggers for user-related operations.

## Implementation Plan
We'll migrate from Cloudflare Workflows/Queues to Trigger.dev by creating scheduled and event-triggered jobs. This removes all Cloudflare-specific infrastructure while maintaining the same functionality.

- [x] Create `src/trigger/` directory structure and configure Trigger.dev environment variables
- [x] Create `src/trigger/scheduled/event-management.ts` - Convert event management workflow to Trigger.dev scheduled job with cron `0 14 * * 1`
- [x] Create `src/trigger/events/user-created.ts` - Handle new user creation (Resend contact creation, welcome email)
- [x] Create `src/trigger/events/user-updated.ts` - Handle user updates (email changes, subscription updates)
- [x] Update `src/lib/auth.ts:81-91` - Replace queue.send with Trigger.dev event trigger for user creation
- [x] Update `src/pages/api/admin/import-users.ts:137-145` - Replace queue.send with Trigger.dev event triggers for bulk import
- [x] Create API endpoint for door control - Move KV door operations to an API endpoint that Trigger jobs can call
- [ ] Remove Cloudflare infrastructure from `alchemy.run.ts` - Delete queue resource, both workers, and related bindings
- [ ] Remove obsolete files: `src/services/event-management.tsx` and `src/services/user-event-consumer.ts`
- [ ] Update TypeScript types in `src/env.d.ts` - Remove queue bindings, add Trigger.dev types
- [ ] Add Trigger.dev commands to `mise.toml` - Add dev and deploy commands for Trigger.dev
- [ ] Update environment variables - Add TRIGGER_SECRET_KEY and other required Trigger.dev config
- [ ] Test scheduled job execution - Verify event management runs on schedule
- [ ] Test event triggers - Verify user creation and updates work correctly
- [ ] Test door control integration - Ensure door unlock/lock still functions during events

## Notes
[Implementation notes]