import type { APIRoute } from "astro";
import { db, queueUserEvent } from "@/lib/auth";
import { z } from "zod";

const ImportUsersSchema = z.object({
	csvData: z.string(),
});

interface ParsedUser {
	email: string;
	name?: string;
}

function parseCSV(csvData: string): ParsedUser[] {
	const lines = csvData.trim().split('\n');
	if (lines.length < 2) {
		throw new Error('CSV must have at least a header row and one data row');
	}

	const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
	
	// Find email column (required)
	const emailIndex = headers.findIndex(h => h === 'email');
	if (emailIndex === -1) {
		throw new Error('CSV must have an "email" column');
	}

	// Find name column (optional)
	const nameIndex = headers.findIndex(h => h === 'name');

	const users: ParsedUser[] = [];
	
	for (let i = 1; i < lines.length; i++) {
		const values = lines[i].split(',').map(v => v.trim());
		
		if (values.length < headers.length) {
			continue; // Skip incomplete rows
		}

		const email = values[emailIndex];
		if (!email || !email.includes('@')) {
			continue; // Skip invalid emails
		}

		const user: ParsedUser = { email };
		
		if (nameIndex !== -1 && values[nameIndex]) {
			user.name = values[nameIndex];
		}

		users.push(user);
	}

	return users;
}

export const POST: APIRoute = async ({ request, locals }) => {
	try {
		const body = await request.json();
		const parseResult = ImportUsersSchema.safeParse(body);

		if (!parseResult.success) {
			return new Response(
				JSON.stringify({ error: "Invalid request", details: parseResult.error.flatten() }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const { csvData } = parseResult.data;

		// Parse CSV
		let parsedUsers: ParsedUser[];
		try {
			parsedUsers = parseCSV(csvData);
		} catch (error) {
			return new Response(
				JSON.stringify({ error: error instanceof Error ? error.message : "Failed to parse CSV" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		if (parsedUsers.length === 0) {
			return new Response(
				JSON.stringify({ error: "No valid users found in CSV" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		db(locals.runtime.env);

		// Get existing users to avoid duplicates
		const existingEmails = await db.user.findMany({
			where: {
				email: {
					in: parsedUsers.map(u => u.email),
				},
			},
			select: { email: true },
		});

		const existingEmailSet = new Set(existingEmails.map(u => u.email));
		const newUsers = parsedUsers.filter(u => !existingEmailSet.has(u.email));

		if (newUsers.length === 0) {
			return new Response(
				JSON.stringify({ 
					message: "All users already exist", 
					skipped: parsedUsers.length 
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Create users in database
		const createdUsers = await Promise.all(
			newUsers.map(user =>
				db.user.create({
					data: {
						email: user.email,
						name: user.name,
						emailVerified: true, // Set as verified for batch imports
						subscribed: true,
						rsvped: false,
					},
				}),
			),
		);

		// Queue all users for contact creation (without welcome emails)
		const queuePromises = createdUsers.map(user =>
			queueUserEvent(locals.runtime.env, {
				type: "user_create",
				email: user.email,
				name: user.name || undefined,
				sendWelcomeEmail: false, // Don't send welcome emails for batch imports
			}),
		);

		await Promise.all(queuePromises);

		return new Response(
			JSON.stringify({ 
				success: true, 
				created: createdUsers.length,
				skipped: parsedUsers.length - newUsers.length,
				total: parsedUsers.length 
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			},
		);
	} catch (error) {
		console.error("Error importing users:", error);
		return new Response(JSON.stringify({ error: "Failed to import users" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};