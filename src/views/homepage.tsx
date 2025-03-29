import { FC } from "hono/jsx";
import { Background } from "../components/Background";
import { Hero } from "../components/Hero";
import { EventDetails } from "../components/EventDetails";
import { Footer } from "../components/Footer";
import { SignupForm } from "../components/SignupForm";
import { useEventActor } from "../hooks/use-event-actor";
import { useRequestContext } from "hono/jsx-renderer";

export const Homepage: FC = async () => {
	const c = useRequestContext();
	const eventActor = await useEventActor(c);
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
