import alchemy from "alchemy";
import { Astro, D1Database } from "alchemy/cloudflare";

const app = await alchemy("sideprojectsaturday", {
  password: process.env.ALCHEMY_SECRET as string,
});

export const db = await D1Database("sps-db", {
  name: "sps-db",
  migrationsDir: "prisma/migrations",
});

export const worker = await Astro("sideprojectsaturday", {
  command: "astro build",
  compatibilityFlags: [
    "nodejs_compat_v2",
    "nodejs_compat_populate_process_env",
  ],
  bindings: {
    RESEND_API_KEY: alchemy.secret(process.env.RESEND_API_KEY as string),
    BETTER_AUTH_BASE_URL: process.env.PROD_URL as string,
    DB: db,
  },
});

console.log({
  url: worker.url,
});

await app.finalize();
