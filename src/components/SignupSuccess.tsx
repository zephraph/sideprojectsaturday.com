import type { FC } from "hono/jsx";
import { Event } from "../types";
import { AddressWithMap } from "./AddressWithMap";
import { isEventFull } from "../lib";

export const SignupSuccess: FC<{ event?: Event }> = ({ event }) => {
	let message = "";

	if (!event) {
		message += "We'll let you know when the next event is scheduled.";
	} else if (isEventFull(event)) {
		message += "We're full this week, but you're on the waitlist!";
	} else {
		const isThisWeek =
			event.startDate &&
			event.startDate.getTime() - new Date().getTime() <
				7 * 24 * 60 * 60 * 1000;
		message += `We'll see you ${isThisWeek ? "this" : "next"} Saturday!`;
	}

	return (
		<div class="max-w-xl mx-auto px-4 py-32 text-center">
			<div class="space-y-6">
				<h1 class="text-4xl font-bold text-slate-600">🎉</h1>
				<h2 class="text-2xl font-bold text-slate-600">You're on the list!</h2>
				<p class="text-slate-500">{message}</p>
				{event && !isEventFull(event) && event.startDate && (
					<div class="mt-8 p-6 backdrop-blur-xl bg-white/40 border border-white/40 rounded-2xl shadow-xl ring-1 ring-black/5">
						<p class="text-lg font-medium text-slate-600 mb-2">Next Event</p>
						<p class="text-slate-500">
							{event.startDate.toLocaleDateString("en-US", {
								weekday: "long",
								month: "long",
								day: "numeric",
							})}
						</p>
						<p class="text-slate-500">9:00 AM - 12:00 PM</p>
						<AddressWithMap />
					</div>
				)}
				<div class="mt-8">
					<a
						href="/"
						class="text-slate-500 hover:text-slate-600 transition-colors"
					>
						← Back to home
					</a>
				</div>
			</div>
		</div>
	);
};
