import type { FC } from "hono/jsx";

export const AddressWithMap: FC = () => (
	<div class="space-y-4">
		<div class="text-slate-500 mt-4 text-center">
			<a
				href="https://maps.google.com/?q=325+Gold+Street+%23503+Brooklyn+NY+11201"
				target="_blank"
				rel="noopener noreferrer"
				class="font-semibold hover:text-slate-600 transition-colors"
			>
				<p>325 Gold Street #503</p>
				<p>Brooklyn, NY 11201</p>
			</a>
		</div>
		<div class="aspect-video rounded-lg overflow-hidden shadow-lg">
			<iframe
				title="Event map"
				src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.4604940368655!2d-73.98338792346976!3d40.69338437139275!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a4728141af5%3A0x4b9a19512d7e5e21!2s325%20Gold%20St%2C%20Brooklyn%2C%20NY%2011201!5e0!3m2!1sen!2sus!4v1709997323841!5m2!1sen!2sus"
				width="100%"
				height="100%"
				style="border:0"
				loading="lazy"
				referrerpolicy="no-referrer-when-downgrade"
			/>
		</div>
	</div>
);
