import { jsx } from "hono/jsx";
import type { FC } from "hono/jsx";

export const Footer: FC = () => (
	<div class="text-center pb-8">
		<p class="text-sm text-slate-500">
			<a
				href="https://www.val.town/x/just_be/SideProjectSaturdays"
				target="_blank"
				rel="noopener noreferrer"
				class="text-slate-600 hover:text-slate-800 underline decoration-slate-300 hover:decoration-slate-400 transition-all"
			>
				Hosted
			</a>{" "}
			with ♥ by{" "}
			<a
				href="https://val.town"
				target="_blank"
				rel="noopener noreferrer"
				class="text-slate-600 hover:text-slate-800 underline decoration-slate-300 hover:decoration-slate-400 transition-all"
			>
				Val.town
			</a>
		</p>
	</div>
);
