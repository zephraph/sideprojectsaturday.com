import { FC } from "hono/jsx";
import { Background } from "../components/Background";
import { Hero } from "../components/Hero";
import { EventDetails } from "../components/EventDetails";
import { Footer } from "../components/Footer";
import { SignupForm } from "../components/SignupForm";
import { useEventActor } from "../hooks/use-event-actor";

export const Homepage: FC = async () => {
	const eventActor = await useEventActor();
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
