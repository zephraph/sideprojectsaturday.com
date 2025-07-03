import alchemy from "alchemy";
import { Astro } from "alchemy/cloudflare";

const app = await alchemy("sideprojectsaturday");

export const worker = await Astro("sideprojectsaturday", {
	command: "astro build",
	bindings: {
		RESEND_API_KEY: process.env.RESEND_API_KEY as string,
	},
});

console.log({
	url: worker.url,
});

await app.finalize();
