import { Button, Heading, Text } from "@react-email/components";
import { BaseEmail } from "./components/BaseEmail";

interface EventReminderEmailProps {
	name: string;
	eventDate: string;
	eventLocation: string;
	eventTime: string;
}

export default function EventReminderEmail({
	name,
	eventDate,
	eventLocation,
	eventTime,
}: EventReminderEmailProps) {
	return (
		<BaseEmail previewText="Reminder: Side Project Saturday is tomorrow!">
			<Heading className="text-2xl font-bold mb-5">
				Side Project Saturday is Tomorrow!
			</Heading>
			<Text className="text-base leading-6 mb-5">Hi {name},</Text>
			<Text className="text-base leading-6 mb-5">
				This is a friendly reminder that Side Project Saturday is happening
				tomorrow:
			</Text>
			<Text className="text-base leading-6 mb-5 bg-gray-100 p-4 rounded">
				📅 Date: {eventDate}
				<br />⏰ Time: {eventTime}
				<br />📍 Location: {eventLocation}
			</Text>
			<Text className="text-base leading-6 mb-5">Don't forget to bring:</Text>
			<ul className="text-base leading-6 mb-5 pl-5">
				<li>Your laptop and charger</li>
				<li>Any project materials you need</li>
				<li>Your enthusiasm and ideas!</li>
			</ul>
			<Text className="text-base leading-6 mb-5">
				We'll have coffee, snacks, and a great space for collaboration. If you
				have any last-minute questions, feel free to reply to this email.
			</Text>
			<Button
				className="bg-indigo-600 rounded text-white font-bold py-3 px-6 mb-5 inline-block"
				href="https://sps.com/event-details"
			>
				View Event Details
			</Button>
			<Text className="text-base leading-6 mb-5">See you tomorrow!</Text>
			<Text className="text-base leading-6 mb-5">
				Best regards,
				<br />
				The Side Project Saturday Team
			</Text>
		</BaseEmail>
	);
}
