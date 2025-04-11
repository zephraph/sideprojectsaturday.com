import { Button, Heading, Text } from "@react-email/components";
import { BaseEmail } from "./components/BaseEmail";

interface EventFeedbackEmailProps {
	name: string;
	eventDate: string;
}

export default function EventFeedbackEmail({
	name,
	eventDate,
}: EventFeedbackEmailProps) {
	return (
		<BaseEmail previewText="How was Side Project Saturday?">
			<Heading className="text-2xl font-bold mb-5">
				How was Side Project Saturday?
			</Heading>
			<Text className="text-base leading-6 mb-5">Hi {name},</Text>
			<Text className="text-base leading-6 mb-5">
				Thank you for joining us at Side Project Saturday on {eventDate}! We
				hope you had a great time working on your project and connecting with
				other participants.
			</Text>
			<Text className="text-base leading-6 mb-5">
				Your feedback is incredibly valuable to us. It helps us improve future
				events and create an even better experience for everyone. Could you take
				a few minutes to share your thoughts?
			</Text>
			<Button
				className="bg-indigo-600 rounded text-white font-bold py-3 px-6 mb-5 inline-block"
				href="https://sps.com/feedback"
			>
				Share Your Feedback
			</Button>
			<Text className="text-base leading-6 mb-5">We'd love to know:</Text>
			<ul className="text-base leading-6 mb-5 pl-5">
				<li>What did you enjoy most about the event?</li>
				<li>What could we improve for next time?</li>
				<li>Would you recommend Side Project Saturday to others?</li>
			</ul>
			<Text className="text-base leading-6 mb-5">
				Also, don't forget to join our community Discord server to stay
				connected with other participants and get updates about future events!
			</Text>
			<Button
				className="bg-indigo-600 rounded text-white font-bold py-3 px-6 mb-5 inline-block"
				href="https://discord.gg/sps"
			>
				Join Our Discord
			</Button>
			<Text className="text-base leading-6 mb-5">
				Thank you for being part of our community!
			</Text>
			<Text className="text-base leading-6 mb-5">
				Best regards,
				<br />
				The Side Project Saturday Team
			</Text>
		</BaseEmail>
	);
}
