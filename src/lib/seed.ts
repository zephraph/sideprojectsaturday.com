import type { PrismaClient } from "@generated/prisma/client";

export const seedUsers = [
	{
		email: "admin@example.com",
		name: "Admin User",
		emailVerified: true,
		role: "admin",
		subscribed: true,
		rsvped: false,
	},
	{
		email: "user1@example.com",
		name: "John Doe",
		emailVerified: true,
		subscribed: true,
		rsvped: true,
	},
	{
		email: "user2@example.com",
		name: "Jane Smith",
		emailVerified: true,
		subscribed: true,
		rsvped: false,
	},
	{
		email: "user3@example.com",
		name: "Bob Wilson",
		emailVerified: true,
		subscribed: false,
		rsvped: false,
	},
	{
		email: "banned@example.com",
		name: "Banned User",
		emailVerified: true,
		subscribed: false,
		rsvped: false,
		banned: true,
		banReason: "Inappropriate behavior",
	},
];

export async function seedDevelopmentData(client: PrismaClient) {
	try {
		console.log("🌱 Seeding development users...");

		for (const userData of seedUsers) {
			const existingUser = await client.user.findUnique({
				where: { email: userData.email },
			});

			if (existingUser) {
				continue;
			}

			const user = await client.user.create({
				data: userData,
			});

			console.log(`  ✅ Created user: ${user.email} (${user.name})`);
		}

		console.log("🎉 Development seeding completed!");
	} catch (error) {
		console.error("Development seeding failed:", error);
		// Don't fail the app, just log the error
	}
}
