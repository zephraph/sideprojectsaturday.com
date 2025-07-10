import { defineMiddleware } from "astro:middleware";
import { auth, db } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
	db(context.locals.runtime.env);
	// Initialize locals
	context.locals.user = null;
	context.locals.session = null;

	try {
		// Get session from Better Auth
		const session = await auth.api.getSession({
			headers: context.request.headers,
		});

		if (session) {
			context.locals.user = session.user;
			context.locals.session = session.session;
		}
	} catch (error) {
		// Handle any auth errors gracefully
		console.error("Auth middleware error:", error);
	}

	// Protect admin routes
	if (
		context.url.pathname.startsWith("/admin") ||
		context.url.pathname.startsWith("/api/admin")
	) {
		if (
			!context.locals.user ||
			(context.locals.user.role !== "admin" &&
				context.locals.user.email !== process.env.ADMIN_EMAIL)
		) {
			return new Response("Unauthorized", { status: 401 });
		}
	}

	return next();
});
