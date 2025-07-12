---
id: task-1
title: Fix deployment to ensure workflow is triggered by cron worker
status: To Do
assignee: []
created_date: '2025-07-12'
labels: []
dependencies: []
---

## Description

The event management workflow needs to be properly triggered by the cron worker in production. Currently, there may be an issue with the cron trigger not activating the workflow as expected.

## Acceptance Criteria

- [ ] Cron worker successfully triggers the event management workflow on schedule
- [ ] Workflow executes on Mondays at 9 AM EST/10 AM EDT
- [ ] Deployment configuration correctly binds workflow to cron trigger
- [ ] Logs confirm workflow activation by cron
