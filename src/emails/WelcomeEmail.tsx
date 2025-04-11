import { Button, Heading, Link, Text } from "@react-email/components";
import { BaseEmail } from "./components/BaseEmail";

interface WelcomeEmailProps {
	name: string;
	eventDate: string;
	eventLocation: string;
}

export default function WelcomeEmail({
	name,
	eventDate,
	eventLocation,
}: WelcomeEmailProps) {
	return (
		<BaseEmail previewText={`Welcome to Side Project Saturday, ${name}!`}>
			<Heading className="text-2xl font-bold mb-5">
				Welcome to Side Project Saturday!
			</Heading>
			<Text className="text-base leading-6 mb-5">Hi {name},</Text>
			<Text className="text-base leading-6 mb-5">
				We're excited to have you join us for our upcoming event on {eventDate}{" "}
				at {eventLocation}.
			</Text>
			<Text className="text-base leading-6 mb-5">
				Side Project Saturday is a community-driven event where developers,
				designers, and creators come together to work on their passion projects,
				learn new skills, and connect with like-minded individuals.
			</Text>
			<Text className="text-base leading-6 mb-5">
				Here's what you can expect:
			</Text>
			<ul className="text-base leading-6 mb-5 pl-5">
				<li>Collaborative coding sessions</li>
				<li>Knowledge sharing and networking</li>
				<li>Access to mentors and experienced developers</li>
				<li>Free coffee and snacks</li>
			</ul>
			<Text className="text-base leading-6 mb-5">
				To help us prepare, please take a moment to update your project
				preferences in your profile.
			</Text>
			<Button
				className="bg-indigo-600 rounded text-white font-bold py-3 px-6 mb-5 inline-block"
				href="https://sps.com/profile"
			>
				Update Profile
			</Button>
			<Text className="text-base leading-6 mb-5">
				If you have any questions, feel free to reply to this email or join our
				community Discord server.
			</Text>
			<Text className="text-base leading-6 mb-5">
				Looking forward to seeing you there!
			</Text>
			<Text className="text-base leading-6 mb-5">
				Best regards,
				<br />
				The Side Project Saturday Team
			</Text>
		</BaseEmail>
	);
}
