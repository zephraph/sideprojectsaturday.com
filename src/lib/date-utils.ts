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