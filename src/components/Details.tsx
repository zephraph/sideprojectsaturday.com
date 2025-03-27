import { jsx } from "hono/jsx";
import type { FC } from "hono/jsx";
import { EventStatus, getEventDateMessage } from "./types";

export const Details: FC<{ status: EventStatus }> = ({ status }) => (
	<div class="max-w-3xl mx-auto px-4">
		<div class="backdrop-blur-xl bg-white/40 border border-white/40 rounded-2xl p-8 text-center shadow-xl ring-1 ring-black/5 hover:bg-white/50 transition-colors">
			<h2 class="text-3xl font-bold mb-4 text-slate-600">
				{getEventDateMessage(status.nextDate)}
			</h2>
			<div class="space-y-6">
				<div>
					<p class="text-lg mb-2 text-slate-600">9:00 AM - 12:00 PM</p>
					<div class="text-slate-500 text-center">
						<p>Brooklyn, NY</p>
					</div>
				</div>
				<p class="text-slate-500 max-w-xl mx-auto">
					Bring your side project and join other developers for three focused
					hours of building, learning, and sharing. Coffee and good vibes
					included!
				</p>
			</div>
		</div>
	</div>
);
