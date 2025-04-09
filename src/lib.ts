import type { ActorCoreApp, ActorDefinition } from "actor-core";
import { createClient } from "actor-core/client";
import type { emailActor } from "./actors/email.ts";
import type { eventActor } from "./actors/event.ts";
import { ACTOR_ROUTE } from "./constants";
import type { HonoContext } from "./index.tsx";
import type { Event } from "./types.d.ts";

export function isEventFull(event: Event) {
	return (
		event.guestLimit <= event.guests.filter((g) => g.status === "going").length
	);
}

export function getEventDateMessage(date?: Date): string {
	if (!date) return "No upcoming events scheduled";

	const now = new Date();
	const isThisWeek = date.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000;

	return isThisWeek
		? "This Saturday"
		: `Next Saturday, ${date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
}

export function getEventTime(startDate: Date, endDate: Date): string {
	return `${startDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} - ${endDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
}

export function getEventActor(
	c: HonoContext,
	{ event = "sps:nyc" }: { event?: string } = { event: "sps:nyc" },
) {
	return c.var.client.event.get({ tags: { event } });
}

export function getEmailActor(
	c: HonoContext,
	{ context = "event:sps:nyc" }: { context?: string } = {
		context: "event:sps:nyc",
	},
) {
	return c.var.client.email.get({ tags: { context } });
}
