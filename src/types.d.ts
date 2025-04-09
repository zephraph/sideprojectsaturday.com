export type { Event } from "./actors/event";

export interface EventStatus {
	isScheduled: boolean;
	isFull: boolean;
	nextDate?: Date;
}

export type Actors<A> = A extends ActorCoreApp<infer Actors>
	? Actors[keyof Actors]
	: never;
