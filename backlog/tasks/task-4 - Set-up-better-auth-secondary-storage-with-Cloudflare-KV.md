---
id: task-4
title: Set up better-auth secondary storage with Cloudflare KV
status: To Do
assignee: []
created_date: '2025-07-12'
labels: []
dependencies: []
---

## Description

Configure better-auth secondary storage using Cloudflare KV for improved performance and scalability. This will provide faster session lookups at the edge, reduced database load, and better authentication performance.

## Acceptance Criteria

- [ ] Review better-auth secondary storage documentation
- [ ] Create Cloudflare KV namespace for auth data
- [ ] Update alchemy.run.ts to include KV binding
- [ ] Configure secondary storage in src/lib/auth.ts
- [ ] Implement KV adapter for better-auth
- [ ] Test session storage/retrieval with KV
- [ ] Update environment variables and deployment config
- [ ] Monitor performance improvements
