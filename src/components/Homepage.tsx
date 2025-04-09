import type { FC } from "hono/jsx";
import { useRequestContext } from "hono/jsx-renderer";
import type { HonoEnv } from "../index";
import { getEventActor } from "../lib";
import { Background } from "./Background";
import { EventDetails } from "./EventDetails";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { SignupForm } from "./SignupForm";

export const Homepage: FC = async () => {
	const c = useRequestContext<HonoEnv>();

	const eventActor = await getEventActor(c);
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
