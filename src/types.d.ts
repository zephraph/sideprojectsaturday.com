export type { Event } from "./actors/event";

export interface EventStatus {
	isScheduled: boolean;
	isFull: boolean;
	nextDate?: Date;
}


