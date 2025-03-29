import { jsx } from "hono/jsx";
import type { FC } from "hono/jsx";

export const Footer: FC = () => (
	<div class="text-center pb-8">
		<p class="text-sm text-slate-500">
			<a
				href="https://github.com/zephraph/sideprojectsaturday.com"
				target="_blank"
				rel="noopener noreferrer"
				class="text-slate-600 hover:text-slate-800 underline decoration-slate-300 hover:decoration-slate-400 transition-all"
			>
				Built
			</a>{" "}
			with ♥ by{" "}
			<a
				href="https://just-be.dev"
				target="_blank"
				rel="noopener noreferrer"
				class="text-slate-600 hover:text-slate-800 underline decoration-slate-300 hover:decoration-slate-400 transition-all"
			>
				Justin
			</a>
		</p>
	</div>
);
