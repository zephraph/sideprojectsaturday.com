/**
 * Date utilities for Side Project Saturday
 */

/**
 * Get the next Saturday as a Date object (at midnight)
 */
export function getNextSaturdayDate(): Date {
	const now = new Date();
	const daysUntilSaturday = (6 - now.getDay()) % 7 || 7;
	const nextSaturday = new Date(now);
	nextSaturday.setDate(now.getDate() + daysUntilSaturday);
	nextSaturday.setHours(0, 0, 0, 0);
	return nextSaturday;
}

/**
 * Get the current week's Saturday date (at midnight)
 * If today is Saturday, returns today. Otherwise returns the coming Saturday.
 */
export function getCurrentWeekSaturdayDate(): Date {
	const today = new Date();
	const dayOfWeek = today.getDay();
	const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
	const currentWeekSaturday = new Date(today);
	currentWeekSaturday.setDate(today.getDate() + daysUntilSaturday);
	currentWeekSaturday.setHours(0, 0, 0, 0);
	return currentWeekSaturday;
}

/**
 * Get the next Saturday as a formatted string
 */
export function getNextSaturdayFormatted(): string {
	const nextSaturday = getNextSaturdayDate();
	return nextSaturday.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

/**
 * Format a date for display
 */
export function formatEventDate(date: Date): string {
	return date.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

/**
 * Get the Wednesday before a given Saturday event date
 */
export function getWednesdayBeforeEvent(eventDate: Date): Date {
	const wednesday = new Date(eventDate);
	wednesday.setDate(wednesday.getDate() - 3);
	wednesday.setHours(12, 0, 0, 0); // 12 PM Wednesday
	return wednesday;
}

/**
 * Get the morning of a Saturday event (7 AM)
 */
export function getSaturdayMorning(eventDate: Date): Date {
	const saturdayMorning = new Date(eventDate);
	saturdayMorning.setHours(7, 0, 0, 0); // 7 AM Saturday
	return saturdayMorning;
}

/**
 * Calculate delay in milliseconds from now to a target date
 */
export function getDelayUntil(targetDate: Date): number {
	const now = new Date();
	return Math.max(0, targetDate.getTime() - now.getTime());
}

/**
 * Get event start time (9 AM) for a given date
 */
export function getEventStartTime(eventDate: Date): Date {
	const startTime = new Date(eventDate);
	startTime.setHours(9, 0, 0, 0);
	return startTime;
}

/**
 * Get event end time (12 PM) for a given date
 */
export function getEventEndTime(eventDate: Date): Date {
	const endTime = new Date(eventDate);
	endTime.setHours(12, 0, 0, 0);
	return endTime;
}

/**
 * Check if a date is a Saturday
 */
export function isSaturday(date: Date): boolean {
	return date.getDay() === 6;
}

/**
 * Get the date range for querying events on a specific day
 */
export function getDayRange(date: Date): { start: Date; end: Date } {
	const start = new Date(date);
	start.setHours(0, 0, 0, 0);

	const end = new Date(start);
	end.setDate(end.getDate() + 1);

	return { start, end };
}

/**
 * Check if current time is within Saturday event hours (9am-12pm EST/EDT)
 */
export function isWithinEventHours(date: Date = new Date()): boolean {
	const nyTime = new Date(
		date.toLocaleString("en-US", { timeZone: "America/New_York" }),
	);
	const day = nyTime.getDay();
	const hours = nyTime.getHours();

	// Saturday is day 6
	// Check if it's Saturday and between 9am-12pm EST/EDT
	return day === 6 && hours >= 9 && hours < 12;
}

/**
 * Get the NYC timezone offset in hours (handles DST automatically)
 */
export function getNYCTimezoneOffset(): number {
	const isEST = new Date()
		.toLocaleString("en-US", {
			timeZone: "America/New_York",
			timeZoneName: "short",
		})
		.includes("EST");
	return isEST ? 5 : 4; // EST is UTC-5, EDT is UTC-4
}

/**
 * Convert UTC date to NYC time
 */
export function convertToNYCTime(date: Date): Date {
	const offset = getNYCTimezoneOffset();
	return new Date(date.getTime() - offset * 60 * 60 * 1000);
}

/**
 * Get the next Saturday date at a specific NYC time
 */
export function getNextSaturdayAtNYCTime(
	hour: number = 9,
	minute: number = 0,
): Date {
	const now = new Date();
	const nyTime = convertToNYCTime(now);
	const dayOfWeek = nyTime.getDay();

	// Calculate days until Saturday (if today is Saturday, get next Saturday)
	const daysUntilSaturday = dayOfWeek === 6 ? 7 : 6 - dayOfWeek;

	// Create the event date at specified NYC time
	const nextSaturday = new Date(now);
	nextSaturday.setUTCDate(now.getUTCDate() + daysUntilSaturday);
	const offset = getNYCTimezoneOffset();
	nextSaturday.setUTCHours(hour + offset, minute, 0, 0);

	return nextSaturday;
}
