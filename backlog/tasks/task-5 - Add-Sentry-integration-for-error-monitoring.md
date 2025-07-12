---
id: task-5
title: Add Sentry integration for error monitoring
status: To Do
assignee: []
created_date: '2025-07-12'
labels: []
dependencies: []
---

## Description

Add Sentry integration to monitor and track errors in production. Currently errors are only logged to console and we need proper error monitoring to track production errors, get alerts, and debug issues.

## Acceptance Criteria

- [ ] Install Sentry SDK for Astro/Cloudflare Workers
- [ ] Configure Sentry in astro.config.mjs
- [ ] Add environment variables for Sentry DSN
- [ ] Replace console.error calls with Sentry error reporting
- [ ] Test error reporting in development
- [ ] Deploy and verify error tracking in production
