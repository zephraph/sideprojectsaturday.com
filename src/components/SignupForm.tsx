import { jsx } from "hono/jsx";
import type { FC } from "hono/jsx";

interface SignupFormProps {
	header?: string;
	errors?: { name?: string[]; email?: string[] };
	values?: { name?: string; email?: string };
}

export const SignupForm: FC<SignupFormProps> = ({
	header = "Want to join us?",
	errors,
	values,
}) => (
	<div class="max-w-xl mx-auto px-4 py-16">
		<form class="space-y-8" method="post" action="/signup">
			<div class="text-center space-y-2">
				<h2 class="text-3xl font-bold text-slate-600">{header}</h2>
				<p class="text-slate-500">Reserve your spot for the next session</p>
			</div>

			<div class="space-y-4 mt-8">
				<div class="space-y-1.5">
					<label class="text-sm text-slate-500" for="name">
						Your name
					</label>
					<input
						type="text"
						id="name"
						name="name"
						required
						value={errors?.name ? values?.name : ""}
						class={`w-full p-3 rounded-lg backdrop-blur-md bg-white/30 border-2 ${
							errors?.name ? "border-red-300" : "border-slate-200/50"
						} text-slate-600 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200/50 transition-all`}
					/>
					{errors?.name && (
						<p class="text-sm text-red-500 mt-1">{errors.name[0]}</p>
					)}
				</div>

				<div class="space-y-1.5">
					<label class="text-sm text-slate-500" for="email">
						Your email
					</label>
					<input
						type="email"
						id="email"
						name="email"
						required
						value={errors?.email ? values?.email : ""}
						class={`w-full p-3 rounded-lg backdrop-blur-md bg-white/30 border-2 ${
							errors?.email ? "border-red-300" : "border-slate-200/50"
						} text-slate-600 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200/50 transition-all`}
					/>
					{errors?.email && (
						<p class="text-sm text-red-500 mt-1">{errors.email[0]}</p>
					)}
				</div>

				<button
					type="submit"
					class="w-full bg-slate-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-slate-500 transform transition-all active:scale-[0.98] shadow-lg hover:shadow-xl"
				>
					Reserve Your Spot →
				</button>

				<p class="text-center text-sm text-slate-400">
					Limited to 20 spots each week
				</p>
			</div>
		</form>
		<div class="mt-8 text-center">
			<a
				href="/check"
				class="text-slate-600 hover:text-slate-800 underline decoration-slate-300 hover:decoration-slate-400 transition-all"
			>
				Already signed up? Check your reservation →
			</a>
		</div>
	</div>
);
