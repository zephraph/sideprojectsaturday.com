import { createRouter } from "@actor-core/cloudflare-workers";
import { setup } from "actor-core";
import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { doorActor } from "./actors/door.ts";
import { eventActor } from "./actors/event.ts";

import { Background } from "./components/Background.tsx";

const app = new Hono();

app.use(jsxRenderer());

//#region Routes
app.get("/", (c) => c.text("Welcome to my app!"));
app.get("/hello", (c) => c.text("Hello, world!"));
//#endregion

//#region ActorCore
const ACTOR_ROUTE = "/actors/";

export const actorCore = setup({
	actors: { door: doorActor, event: eventActor },
	basePath: ACTOR_ROUTE,
});

const { router: actorRouter, ActorHandler } = createRouter(actorCore);

app.route(ACTOR_ROUTE, actorRouter);

export type ActorCore = typeof actorCore;
//#endregion

export { app as default, ActorHandler };
