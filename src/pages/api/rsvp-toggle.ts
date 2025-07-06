import type { APIRoute } from "astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { auth, db } from "../../lib/auth";
import { sendRsvpConfirmation } from "../../lib/email-utils";
import RsvpSection from "../../components/RsvpSection.astro";

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
    const rsvped = formData.get("rsvped") === "true";

    // Get the database instance with proper env
    const runtime = locals.runtime;
    if (!runtime?.env) {
      return new Response("Database environment not available", {
        status: 500,
      });
    }

    // Initialize the database with runtime env
    db(runtime.env);

    // Update user RSVP status in database
    await db.user.update({
      where: { id: session.user.id },
      data: { rsvped },
    });

    // Send RSVP confirmation email when user RSVPs (not when canceling)
    if (rsvped) {
      try {
        // Get the next scheduled event
        const nextEvent = await db.event.findFirst({
          where: {
            eventDate: {
              gte: new Date(),
            },
            status: {
              in: ["scheduled", "inprogress"],
            },
          },
          orderBy: {
            eventDate: "asc",
          },
        });

        if (nextEvent) {
          await sendRsvpConfirmation({
            userEmail: session.user.email,
            userName: session.user.name || undefined,
            userId: session.user.id,
            eventDate: new Date(nextEvent.eventDate),
            baseUrl:
              runtime.env.BETTER_AUTH_BASE_URL ||
              "https://sideprojectsaturday.com",
          });
        }
      } catch (emailError) {
        console.error("Failed to send RSVP confirmation email:", emailError);
        // Don't fail the RSVP if email fails
      }
    }

    // Create Astro container and render the component
    const container = await AstroContainer.create();
    const html = await container.renderToString(RsvpSection, {
      props: { rsvped },
    });

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("RSVP toggle error:", error);
    return new Response("Failed to update RSVP status", { status: 500 });
  }
};
