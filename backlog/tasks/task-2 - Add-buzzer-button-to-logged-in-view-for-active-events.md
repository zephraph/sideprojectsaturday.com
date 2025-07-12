---
id: task-2
title: Add buzzer button to logged in view for active events
status: To Do
assignee: []
created_date: '2025-07-12'
labels: []
dependencies: []
---

## Description

Users need quick access to the door buzzer functionality from the main logged in view during active events. The button should be visible but disabled for one hour before the event starts (8-9 AM), informing users it will become available at 9 AM.

## Acceptance Criteria

- [ ] Buzzer button appears on logged in homepage when event status is scheduled or inprogress
- [ ] Button is grayed out and shows 'Available at 9 AM' message from 8-9 AM on event day
- [ ] Button becomes active and functional at 9 AM when event status changes to inprogress
- [ ] Button correctly triggers door unlock when clicked during active event
- [ ] Button is hidden when no event is scheduled for the day
- [ ] Button styling matches existing UI components
