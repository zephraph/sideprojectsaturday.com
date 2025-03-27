import type { FC } from "hono/jsx";

interface ReservationConfirmationProps {
	email: string;
}

export const ReservationConfirmation: FC<ReservationConfirmationProps> = ({
	email,
}) => (
	<div class="max-w-xl mx-auto px-4 py-32 text-center">
		<div class="space-y-6">
			<h2 class="text-2xl font-bold text-slate-600">Check Your Email</h2>
			<p class="text-slate-500">
				We've sent a link to {email}.<br />
				Click the link to view your reservation.
			</p>
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
