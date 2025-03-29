import { useRequestContext } from "hono/jsx-renderer";
import { zSignup } from "../schemas";
import { useEventActor } from "../hooks/use-event-actor";
import { Hero } from "./Hero";
import { EventDetails } from "./EventDetails";
import { SignupForm } from "./SignupForm";
import { match } from "ts-pattern";
import { ReservationConfirmation } from "./ReservationConfirmation";
import { SignupSuccess } from "./SignupSuccess";

export const SignupResults = async () => {
	const c = useRequestContext();
	const formData = await c.req.parseBody();
	const eventActor = await useEventActor(c);

	const result = zSignup.safeParse({
		name: formData.name,
		email: formData.email,
	});

	const event = await eventActor.getNextEvent();

	if (!result.success) {
		return c.render(
			<main>
				<Hero />
				<EventDetails event={event} />
				<SignupForm
					errors={result.error.flatten().fieldErrors}
					values={{
						name: formData.name as string,
						email: formData.email as string,
					}}
				/>
			</main>,
		);
	}

	if (event) {
		const { status } = await eventActor.registerGuestForEvent({
			eventId: event.id,
			guest: {
				name: result.data.name,
				email: result.data.email,
			},
		});
		switch (status) {
			case "going":
				return (
					<main>
						<Hero />
						<EventDetails event={event} />
						<ReservationConfirmation email={result.data.email} />
					</main>
				);
		}
	}

	return c.render(
		<main>
			<SignupSuccess status={status} />
		</main>,
	);
};
