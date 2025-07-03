/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

declare module "cloudflare:workers" {
	export { env } from "@cloudflare/workers-types";
}

declare namespace App {
	interface Locals {
		runtime: {
			env: Env;
		};
		user: import("better-auth").User | null;
		session: import("better-auth").Session | null;
	}
}
