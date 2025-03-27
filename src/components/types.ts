export interface EventStatus {
	isScheduled: boolean;
	isFull: boolean;
	nextDate?: Date;
}

export function getEventDateMessage(date?: Date): string {
	if (!date) return "No upcoming events scheduled";

	const now = new Date();
	const isThisWeek = date.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000;

	return isThisWeek
		? "This Saturday"
		: `Next Saturday, ${date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
}
