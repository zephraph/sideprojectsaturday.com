import { createRouter } from "@actor-core/cloudflare-workers";
import { setup } from "actor-core";
import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { doorActor } from "./actors/door.ts";
import { eventActor } from "./actors/event.ts";
import { Client, createClient } from "actor-core/client";

import { Base } from "./views/base.tsx";

import { createMiddleware } from "hono/factory";
import { Homepage } from "./views/homepage.tsx";
import { CheckReservation } from "./components/CheckReservation.tsx";
import { ReservationResults } from "./components/ReservationResults.tsx";
import { emailActor } from "./actors/email.ts";
import { SignupResults } from "./components/SignupResults.tsx";

//#region ActorCore
const ACTOR_ROUTE = "/act";

const actorMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
	const url = new URL(c.req.url);
	c.set("client", createClient<ActorApp>(`${url.origin}${ACTOR_ROUTE}`));
	await next();
});

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

const app = new Hono<HonoEnv>();

app.use(actorMiddleware);
app.use(jsxRenderer());

app.route(ACTOR_ROUTE, actorRouter);

app.use(
	"*",
	jsxRenderer(({ children }) => <Base>{children}</Base>),
);
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
