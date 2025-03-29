import type { FC } from "hono/jsx";
import { getEventDateMessage, getEventTime } from "../lib";
import type { Event } from "../types.d.ts";

export const EventDetails: FC<{ event?: Event }> = ({ event }) => (
	<div class="max-w-3xl mx-auto px-4">
		<div class="backdrop-blur-xl bg-white/40 border border-white/40 rounded-2xl p-8 text-center shadow-xl ring-1 ring-black/5 hover:bg-white/50 transition-colors">
			<h2 class="text-3xl font-bold mb-4 text-slate-600">
				{getEventDateMessage(event?.startDate)}
			</h2>
			<div class="space-y-6">
				{event && (
					<div>
						<p class="text-lg mb-2 text-slate-600">
							{getEventTime(event?.startDate, event?.endDate)}
						</p>
						<div class="text-slate-500 text-center">
							<p>{event?.location}</p>
						</div>
					</div>
				)}
				{event ? (
					<p class="text-slate-500 max-w-xl mx-auto">
						Bring your side project and join other developers for three focused
						hours of building, learning, and sharing. Coffee and good vibes
						included!
					</p>
				) : (
					<p class="text-slate-500 max-w-xl mx-auto">
						Sign up to get notified when the next event is scheduled.
					</p>
				)}
			</div>
		</div>
	</div>
);
