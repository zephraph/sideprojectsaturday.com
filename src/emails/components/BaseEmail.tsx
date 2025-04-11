import {
	Body,
	Container,
	Head,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import { Tailwind } from "@react-email/tailwind";

interface BaseEmailProps {
	previewText: string;
	children: React.ReactNode;
}

export const BaseEmail = ({ previewText, children }: BaseEmailProps) => {
	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Body className="bg-gray-50 font-sans">
				<Tailwind>
					<Container className="bg-white mx-auto py-5 mb-16">
						<Section className="px-12">{children}</Section>
						<Section className="px-12 mt-8">
							<Text className="text-xs text-gray-500 m-0">
								© {new Date().getFullYear()} Side Project Saturday. All rights
								reserved.
							</Text>
						</Section>
					</Container>
				</Tailwind>
			</Body>
		</Html>
	);
};

export const renderEmail = (component: React.ReactElement) => {
	return render(component);
};
