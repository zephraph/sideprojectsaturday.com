import type { APIRoute } from "astro";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";

const MagicLinkRequestSchema = z.object({
  email: z.email("Invalid email address"),
  callbackURL: z.url().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const result = MagicLinkRequestSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((e) => e.message).join(", ");
      return new Response(`Validation error: ${errors}`, { status: 400 });
    }

    const { email, callbackURL } = result.data;

    // Send magic link using better-auth
    await auth.api.signInMagicLink({
      body: {
        email,
        callbackURL: callbackURL || "/",
      },
      headers: request.headers,
    });

    return new Response("Magic link sent successfully", { status: 200 });
  } catch (error) {
    console.error("Magic link error:", error);
    return new Response("Failed to send magic link", { status: 500 });
  }
};
