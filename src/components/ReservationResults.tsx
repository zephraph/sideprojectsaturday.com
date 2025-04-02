import { useRequestContext } from "hono/jsx-renderer";
import { zCheckEmail } from "../schemas";
import { CheckReservation } from "./CheckReservation";
import { SignupForm } from "./SignupForm";
import { ReservationConfirmation } from "./ReservationConfirmation";
import { getEventActor } from "../lib";

export const ReservationResults = async () => {
	const c = useRequestContext();
	const eventActor = await getEventActor(c.env);
	const formData = await c.req.parseBody();
	const result = zCheckEmail.safeParse({
		email: formData.email,
	});

	if (!result.success) {
		return (
			<main>
				<CheckReservation
					error={result.error.flatten().fieldErrors.email?.[0]}
				/>
			</main>
		);
	}

	const guest = await eventActor.getGuest({ email: result.data.email });

	if (!guest) {
		return (
			<main>
				<SignupForm
					header="You're not signed up yet!"
					values={{ email: result.data.email }}
				/>
			</main>
		);
	}

	return (
		<main>
			<ReservationConfirmation email={result.data.email} />
		</main>
	);
};
