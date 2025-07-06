import type { APIRoute } from "astro";
import { auth, db } from "../../lib/auth";
import { sendRsvpConfirmation } from "../../lib/email-utils";

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
            baseUrl: runtime.env.BETTER_AUTH_BASE_URL || "https://sideprojectsaturday.com",
          });
        }
      } catch (emailError) {
        console.error("Failed to send RSVP confirmation email:", emailError);
        // Don't fail the RSVP if email fails
      }
    }

    // Return updated RSVP section HTML
    const statusText = rsvped ? "✅ You're RSVP'd!" : "❌ Not RSVP'd";
    const buttonText = rsvped ? "Cancel RSVP" : "RSVP Now";
    const nextValue = rsvped ? "false" : "true";

    const html = `
      <div id="rsvp-section" class="bg-green-50 border border-green-200 rounded-md p-3">
        <div class="text-sm font-medium text-green-800 mb-2">
          Next Event RSVP
        </div>
        <div class="flex items-center justify-between">
          <span class="text-green-700 text-sm">
            ${statusText}
          </span>
          <form
            hx-post="/api/rsvp-toggle"
            hx-target="#rsvp-section"
            hx-swap="outerHTML"
          >
            <input
              type="hidden"
              name="rsvped"
              value="${nextValue}"
            />
            <button
              type="submit"
              class="text-xs text-green-600 hover:text-green-800 font-medium underline cursor-pointer"
            >
              ${buttonText}
            </button>
          </form>
        </div>
      </div>
    `;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("RSVP toggle error:", error);
    return new Response("Failed to update RSVP status", { status: 500 });
  }
};
