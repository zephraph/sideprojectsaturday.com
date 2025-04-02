import { FC } from "hono/jsx";
import { Background } from "./Background";
import { Hero } from "./Hero";
import { EventDetails } from "./EventDetails";
import { Footer } from "./Footer";
import { SignupForm } from "./SignupForm";
import { getEventActor } from "../lib";
import { useRequestContext } from "hono/jsx-renderer";
import type { HonoEnv } from "../index";

export const Homepage: FC = async () => {
	const c = useRequestContext<HonoEnv>();
	
	const eventActor = await getEventActor(c.env);
	const event = await eventActor.getCurrentOrNextEvent();
	return (
		<main>
			<Background />
			<Hero />
			<EventDetails event={event} />
			<SignupForm />
			<Footer />
		</main>
	);
};
