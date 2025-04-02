import type { FC } from "hono/jsx";

interface VerifyEmailProps {
	email: string;
}

export const VerifyEmail: FC<VerifyEmailProps> = ({
	email,
}) => (
	<div class="max-w-xl mx-auto px-4 py-32 text-center">
		<div class="space-y-6">
			<h2 class="text-2xl font-bold text-slate-600">Check Your Email</h2>
			<p class="text-slate-500">
				We've sent a verification email to {email}.<br />
				Please confirm your email to continue.
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
