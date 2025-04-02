import { useRequestContext } from "hono/jsx-renderer";
import { zSignup } from "../schemas";
import { Hero } from "./Hero";
import { EventDetails } from "./EventDetails";
import { SignupForm } from "./SignupForm";
import { ReservationConfirmation } from "./ReservationConfirmation";
import { SignupSuccess } from "./SignupSuccess";
import { getEmailActor, getEventActor } from "../lib";
import { VerifyEmail } from "./VerifyEmail";

export const SignupResults = async () => {
	const c = useRequestContext();

	// Try to get data from query parameters first
	const queryParams = c.req.query();
	const params = 'name' in queryParams && 'email' in queryParams ? queryParams : await c.req.parseBody();

	const eventActor = await getEventActor(c);
	const emailActor = await getEmailActor(c);

	const result = zSignup.safeParse({
		name: params.name,
		email: params.email,
	});

	const event = await eventActor.getNextEvent();

	if (!result.success) {
		return (
			<main>
				<Hero />
				<EventDetails event={event} />
				<SignupForm
					errors={result.error.flatten().fieldErrors}
					values={{
						name: params.name as string,
						email: params.email as string,
					}}
				/>
			</main>
		);
	}

	if (!emailActor.isVerified(result.data.email)) {
		return (
			<main>
				<VerifyEmail email={result.data.email} />
			</main>
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

	return (
		<main>
			<SignupSuccess event={event} />
		</main>
	);
};
