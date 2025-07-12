---
allowed-tools: Bash(backlog:*)
description: Run any backlog CLI command for task management
---

## Context

- Current tasks status: !`backlog task list --plain | head -20`
- Project documentation is in `backlog/docs/`
- Task requirements from CLAUDE.md have been reviewed

## Your task

Execute the requested backlog command: $ARGUMENTS

Based on the user's request, use the appropriate backlog CLI command. Common operations include:

- Creating tasks: `backlog task create "title" -d "description" --ac "criteria1,criteria2"`
- Listing tasks: `backlog task list --plain`
- Viewing task details: `backlog task <id> --plain`
- Editing tasks: `backlog task edit <id> -s "In Progress" --plan "implementation plan"`
- Creating drafts: `backlog draft create "title"`
- Promoting drafts: `backlog draft promote <draft-id>`

Follow the backlog guidelines from CLAUDE.md when creating or editing tasks:
1. Tasks must be atomic and testable
2. Descriptions explain the "why" (purpose and goal)
3. Acceptance Criteria focus on outcomes, not implementation
4. Never reference future tasks that don't exist yet
5. Add implementation plans only when moving to "In Progress"
6. Add implementation notes only after completing work

Execute the appropriate backlog command based on the user's request.