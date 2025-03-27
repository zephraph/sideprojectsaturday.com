import { jsx } from "hono/jsx";
import type { FC } from "hono/jsx";

export const Hero: FC = () => (
	<div class="text-center py-16 px-4">
		<h1 class="text-6xl font-bold mb-1 bg-gradient-to-r from-slate-600 to-slate-700 text-transparent bg-clip-text leading-tight pb-2">
			Side Project Saturday
		</h1>
		<p class="text-xl text-slate-600">Build something awesome every weekend</p>
	</div>
);
