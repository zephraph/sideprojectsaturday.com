import { createRouter } from "@actor-core/cloudflare-workers";
import { setup } from "actor-core";
import { type Context, Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { doorActor } from "./actors/door.ts";
import { eventActor } from "./actors/event.ts";
import type { Client } from "actor-core/client";

import { PageShell } from "./components/PageShell.tsx";

import { createMiddleware } from "hono/factory";
import { Homepage } from "./components/Homepage.tsx";
import { CheckReservation } from "./components/CheckReservation.tsx";
import { ReservationResults } from "./components/ReservationResults.tsx";
import { emailActor } from "./actors/email.ts";
import { SignupResults } from "./components/SignupResults.tsx";
import { ACTOR_ROUTE } from "./constants.ts";

//#region ActorCore
export type ActorApp = typeof actorApp;
export const actorApp = setup({
	actors: { door: doorActor, event: eventActor, email: emailActor },
	basePath: ACTOR_ROUTE,
});

const { router: actorRouter, ActorHandler } = createRouter(actorApp);
//#endregion

//#region Hono
export type HonoEnv = {
	Bindings: Env;
	Variables: { client: Client<ActorApp> };
};
export type HonoContext = Context<HonoEnv>;
const app = new Hono<HonoEnv>();

app.use(jsxRenderer());
app.use("*", jsxRenderer(({ children }) => <PageShell>{children}</PageShell>));

app.route(ACTOR_ROUTE, actorRouter);

app.get("/", (c) => c.render(<Homepage />));
app.get("/check", (c) => c.render(<CheckReservation />));
app.post("/check", (c) => c.render(<ReservationResults />));
app.post("/signup", (c) => c.render(<SignupResults />));
// TODO: Add resend webhooks
// app.post("/webhook", async (c) => {
// 	const url = new URL(c.req.url);
// 	if (url.hostname.endsWith("resend.com")) {
// 		const svix = new Webhook(c.env.RESEND_WEBHOOK_SECRET);
// 		const payload = await c.req.json();
// 		const headers = c.req.header();
// 		const wh = svix.verify(payload, headers);
// 	}
// });
//#endregion

//#region Exports
export { app as default, ActorHandler };
//#endregion
