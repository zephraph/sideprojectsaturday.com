import type { APIRoute } from "astro";
import { auth, db } from "@/lib/auth";
import resend from "@/lib/resend";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import SubscriptionSection from "@/components/SubscriptionSection.astro";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const subscribed = formData.get("subscribed") === "true";

    // Get the database instance with proper env
    const runtime = locals.runtime;
    if (!runtime?.env) {
      return new Response("Database environment not available", {
        status: 500,
      });
    }

    // Initialize the database with runtime env
    db(runtime.env);

    // Update user subscription preference in database
    await db.user.update({
      where: { id: session.user.id },
      data: { subscribed },
    });

    // Update Resend contact subscription status
    try {
      await resend.contacts.update({
        email: session.user.email,
        audienceId: runtime.env.RESEND_AUDIENCE_ID,
        unsubscribed: !subscribed,
      });
    } catch (error) {
      console.error("Failed to update Resend contact:", error);
      // Don't fail the request if Resend update fails
    }

    // Return updated subscription section HTML
    const statusText = subscribed
      ? "📧 Subscribed to future events"
      : "🔕 Unsubscribed from future events";
    const buttonText = subscribed ? "Unsubscribe" : "Subscribe";
    const nextValue = subscribed ? "false" : "true";

    // Use Astro Container API to render the component
    const container = await AstroContainer.create();
    const html = await container.renderToString(SubscriptionSection, {
      props: {
        subscribed,
        statusText,
        buttonText,
        nextValue,
      },
    });

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Subscription toggle error:", error);
    return new Response("Failed to update subscription preference", {
      status: 500,
    });
  }
};
