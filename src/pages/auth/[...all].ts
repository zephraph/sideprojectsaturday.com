import type { APIRoute } from "astro";
import { createAuth } from "../../lib/auth";

export const prerender = false;

export const ALL: APIRoute = async (ctx) => {
	const auth = createAuth(ctx.locals.runtime.env);
	return auth.handler(ctx.request);
};
