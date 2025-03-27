import type { FC } from "hono/jsx";

interface CheckReservationProps {
	error?: string;
}

export const CheckReservation: FC<CheckReservationProps> = ({ error }) => (
	<div class="max-w-xl mx-auto px-4 py-32 text-center">
		<div class="space-y-8">
			<div class="space-y-2">
				<h2 class="text-3xl font-bold text-slate-600">
					Check Your Reservation
				</h2>
				<p class="text-slate-500">
					Enter your email and we'll send you a link to your reservation
				</p>
			</div>

			<form method="post" action="/check" class="space-y-6">
				<div class="space-y-1.5">
					<input
						type="email"
						id="email"
						name="email"
						placeholder="your@email.com"
						required
						class={`w-full p-3 rounded-lg backdrop-blur-md bg-white/30 border-2 ${
							error ? "border-red-300" : "border-slate-200/50"
						} text-slate-600 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200/50 transition-all`}
					/>
					{error && <p class="text-sm text-red-500 mt-1">{error}</p>}
				</div>

				<button
					type="submit"
					class="w-full bg-slate-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-slate-500 transform transition-all active:scale-[0.98] shadow-lg hover:shadow-xl"
				>
					Send Link →
				</button>
			</form>

			<div>
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
