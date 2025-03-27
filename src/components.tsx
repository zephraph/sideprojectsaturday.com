import type { FC } from "hono/jsx";

export const Hero = () => (
  <div class="text-center py-16 px-4">
    <h1 class="text-6xl font-bold mb-1 bg-gradient-to-r from-slate-600 to-slate-700 text-transparent bg-clip-text leading-tight pb-2">
      Side Project Saturday
    </h1>
    <p class="text-xl text-slate-600">Build something awesome every weekend</p>
  </div>
);

export const AddressWithMap = () => (
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
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.4604940368655!2d-73.98338792346976!3d40.69338437139275!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a4728141af5%3A0x4b9a19512d7e5e21!2s325%20Gold%20St%2C%20Brooklyn%2C%20NY%2011201!5e0!3m2!1sen!2sus!4v1709997323841!5m2!1sen!2sus"
        width="100%"
        height="100%"
        style="border:0"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      >
      </iframe>
    </div>
  </div>
);

export const Details = ({ status }: { status: EventStatus }) => (
  <div class="max-w-3xl mx-auto px-4">
    <div class="backdrop-blur-xl bg-white/40 border border-white/40 rounded-2xl p-8 text-center shadow-xl ring-1 ring-black/5 hover:bg-white/50 transition-colors">
      <h2 class="text-3xl font-bold mb-4 text-slate-600">
        {getEventDateMessage(status.nextDate)}
      </h2>
      <div class="space-y-6">
        <div>
          <p class="text-lg mb-2 text-slate-600">9:00 AM - 12:00 PM</p>
          <div class="text-slate-500 text-center">
            <p>Brooklyn, NY</p>
          </div>
        </div>
        <p class="text-slate-500 max-w-xl mx-auto">
          Bring your side project and join other developers for three focused hours of building, learning, and sharing.
          Coffee and good vibes included!
        </p>
      </div>
    </div>
  </div>
);

export const SignupForm = ({
  header = "Want to join us?",
  errors,
  values,
}: {
  header?: string;
  errors?: { name?: string[]; email?: string[] };
  values?: { name?: string; email?: string };
}) => (
  <div class="max-w-xl mx-auto px-4 py-16">
    <form class="space-y-8" method="post" action="/signup">
      <div class="text-center space-y-2">
        <h2 class="text-3xl font-bold text-slate-600">{header}</h2>
        <p class="text-slate-500">Reserve your spot for the next session</p>
      </div>

      <div class="space-y-4 mt-8">
        <div class="space-y-1.5">
          <label class="text-sm text-slate-500" for="name">
            Your name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={errors?.name ? values?.name : ""}
            class={`w-full p-3 rounded-lg backdrop-blur-md bg-white/30 border-2 ${
              errors?.name ? "border-red-300" : "border-slate-200/50"
            } text-slate-600 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200/50 transition-all`}
          />
          {errors?.name && <p class="text-sm text-red-500 mt-1">{errors.name[0]}</p>}
        </div>

        <div class="space-y-1.5">
          <label class="text-sm text-slate-500" for="email">
            Your email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={errors?.email ? values?.email : ""}
            class={`w-full p-3 rounded-lg backdrop-blur-md bg-white/30 border-2 ${
              errors?.email ? "border-red-300" : "border-slate-200/50"
            } text-slate-600 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200/50 transition-all`}
          />
          {errors?.email && <p class="text-sm text-red-500 mt-1">{errors.email[0]}</p>}
        </div>

        <button
          type="submit"
          class="w-full bg-slate-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-slate-500 transform transition-all active:scale-[0.98] shadow-lg hover:shadow-xl"
        >
          Reserve Your Spot →
        </button>

        <p class="text-center text-sm text-slate-400">
          Limited to 20 spots each week
        </p>
      </div>
    </form>
    <div class="mt-8 text-center">
      <a
        href="/check"
        class="text-slate-600 hover:text-slate-800 underline decoration-slate-300 hover:decoration-slate-400 transition-all"
      >
        Already signed up? Check your reservation →
      </a>
    </div>
  </div>
);

export const Background = () => (
  <div class="fixed inset-0 -z-10">
    <div class="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50"></div>
  </div>
);

export const SignupSuccess = ({ status }: { status: EventStatus }) => {
  let message = "";

  if (!status.isScheduled) {
    message += "We'll let you know when the next event is scheduled.";
  } else if (status.isFull) {
    message += "We're full this week, but you're on the list for next time!";
  } else {
    const isThisWeek = status.nextDate && status.nextDate.getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;
    message += `We'll see you ${isThisWeek ? "this" : "next"} Saturday!`;
  }

  return (
    <div class="max-w-xl mx-auto px-4 py-32 text-center">
      <div class="space-y-6">
        <h1 class="text-4xl font-bold text-slate-600">🎉</h1>
        <h2 class="text-2xl font-bold text-slate-600">You're on the list!</h2>
        <p class="text-slate-500">{message}</p>
        {status.isScheduled && !status.isFull && status.nextDate && (
          <div class="mt-8 p-6 backdrop-blur-xl bg-white/40 border border-white/40 rounded-2xl shadow-xl ring-1 ring-black/5">
            <p class="text-lg font-medium text-slate-600 mb-2">Next Event</p>
            <p class="text-slate-500">
              {status.nextDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p class="text-slate-500">9:00 AM - 12:00 PM</p>
            <AddressWithMap />
          </div>
        )}
        <div class="mt-8">
          <a
            href="/"
            class="text-slate-500 hover:text-slate-600 transition-colors"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
};

export const Footer = () => (
  <div class="text-center pb-8">
    <p class="text-sm text-slate-500">
      <a
        href="https://www.val.town/x/just_be/SideProjectSaturdays"
        target="_blank"
        rel="noopener noreferrer"
        class="text-slate-600 hover:text-slate-800 underline decoration-slate-300 hover:decoration-slate-400 transition-all"
      >
        Hosted
      </a>{" "}
      with ♥ by{" "}
      <a
        href="https://val.town"
        target="_blank"
        rel="noopener noreferrer"
        class="text-slate-600 hover:text-slate-800 underline decoration-slate-300 hover:decoration-slate-400 transition-all"
      >
        Val.town
      </a>
    </p>
  </div>
);

export const CheckReservation = ({
  error,
}: {
  error?: string;
}) => (
  <div class="max-w-xl mx-auto px-4 py-32 text-center">
    <div class="space-y-8">
      <div class="space-y-2">
        <h2 class="text-3xl font-bold text-slate-600">Check Your Reservation</h2>
        <p class="text-slate-500">Enter your email and we'll send you a link to your reservation</p>
      </div>

      <form method="post" action="/check" class="space-y-6">
        <div class="space-y-1.5">
          <input
            type="email"
            id="email"
            name="email"
            placeholder="your@email.com"
            required
            class={`w-full p-3 rounded-lg backdrop-blur-md bg-white/30 border-2 ${
              error ? "border-red-300" : "border-slate-200/50"
            } text-slate-600 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200/50 transition-all`}
          />
          {error && <p class="text-sm text-red-500 mt-1">{error}</p>}
        </div>

        <button
          type="submit"
          class="w-full bg-slate-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-slate-500 transform transition-all active:scale-[0.98] shadow-lg hover:shadow-xl"
        >
          Send Link →
        </button>
      </form>

      <div>
        <a
          href="/"
          class="text-slate-500 hover:text-slate-600 transition-colors"
        >
          ← Back to home
        </a>
      </div>
    </div>
  </div>
);

export const ReservationConfirmation = ({ email }: { email: string }) => (
  <div class="max-w-xl mx-auto px-4 py-32 text-center">
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-slate-600">Check Your Email</h2>
      <p class="text-slate-500">
        We've sent a link to {email}.<br />
        Click the link to view your reservation.
      </p>
      <div class="mt-8">
        <a
          href="/"
          class="text-slate-500 hover:text-slate-600 transition-colors"
        >
          ← Back to home
        </a>
      </div>
    </div>
  </div>
);