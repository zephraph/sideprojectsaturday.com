import alchemy from "alchemy";
import { Astro } from "alchemy/cloudflare";

const app = await alchemy("sideprojectsaturday");

export const worker = await Astro("sideprojectsaturday", {
	command: "astro build",
});

console.log({
	url: worker.url,
});

await app.finalize();
