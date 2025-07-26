# Add SwitchBot status UI
**Status:** InProgress
**Agent PID:** 17162

## Original Todo
Add a status UI on the admin dashboard to show the state of the switchbot IOT device. Specifically the battery level and device status.

## Description
Add a SwitchBot device status card to the admin dashboard that displays real-time information about the IoT door control device. This will help administrators monitor the health and status of the physical door buzzer system, including battery level, connection status, and device availability. The status card will be integrated into the Event Management section of the admin dashboard where it's most relevant to event operations.

## Implementation Plan
- [ ] Create SwitchBot status API endpoint at `/api/admin/switchbot-status.ts` that fetches device status from SwitchBot API v1.1
- [ ] Add TypeScript types for SwitchBot status response in `src/lib/switchbot-types.ts`
- [ ] Create `SwitchBotStatusCard.astro` component to display device status information with DaisyUI styling
- [ ] Integrate the status card into the admin dashboard Event Management section at `src/pages/admin/index.astro`
- [ ] Add error handling for API failures and offline device states
- [ ] User test: Verify status card displays correctly on admin dashboard and shows accurate device information

## Notes
[Implementation notes]