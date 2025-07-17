# Add buzzer button to logged in view for active events
**Status:** InProgress
**Agent PID:** 63934

## Original Todo
Add buzzer button to logged in view for active events (Quick access door buzzer on homepage during active events)

## Description
Add a buzzer button to the homepage for authenticated users during active events. This provides quick access to the building door control without requiring users to navigate to the separate `/buzz` page.

## Implementation Plan
- [ ] Check for active events during event hours in the homepage
- [ ] Add buzzer button form to AuthenticatedUserSection component when conditions are met
- [ ] Create an Astro Action to handle the buzzer logic server-side
- [ ] Display success/error states using form action results
- [ ] Style the button and states to match existing UI patterns

## Notes
[Implementation notes]