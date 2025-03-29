import { createClient } from "actor-core/client";
import { type ActorApp } from ".";
import { Event } from "./actors/event";
import { ACTOR_ROUTE } from "./constants";

export function isEventFull(event: Event) {
  return event.guestLimit <= event.guests.filter((g) => g.status === "going").length;
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
