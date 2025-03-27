import type { FC } from "hono/jsx";

export const Background: FC = () => (
	<div class="fixed inset-0 -z-10">
		<div class="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50"></div>
	</div>
);
