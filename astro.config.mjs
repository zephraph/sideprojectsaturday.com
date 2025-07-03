// @ts-check

import { fileURLToPath } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	adapter: cloudflare(),
	output: "server",
	server: {
		port: 4433,
	},
	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)),
				"@generated": fileURLToPath(
					new URL("./node_modules/generated", import.meta.url),
				),
			},
		},
	},
});
