import alchemy from "alchemy";
import {
  Astro,
  D1Database,
  KVNamespace,
  Workflow,
  Worker,
} from "alchemy/cloudflare";

const app = await alchemy("sideprojectsaturday", {
  password: process.env.ALCHEMY_SECRET as string,
});

export const db = await D1Database("sps-db", {
  migrationsDir: "prisma/migrations",
});

export const kv = await KVNamespace("sps-kv");

export const eventWorkflow = new Workflow("event-management", {
  className: "EventManagementWorkflow",
});

export const eventWorker = await Worker("event-worker", {
  entrypoint: "./src/workflows/event-management.tsx",
  compatibilityFlags: ["nodejs_compat_v2"],
  bindings: {
    DB: db,
    KV: kv,
    RESEND_API_KEY: alchemy.secret(process.env.RESEND_API_KEY as string),
    RESEND_AUDIENCE_ID: alchemy.secret(
      process.env.RESEND_AUDIENCE_ID as string,
    ),
    BETTER_AUTH_BASE_URL: process.env.PROD_URL as string,
    EVENT_WORKFLOW: eventWorkflow,
  },
  crons: ["0 14 * * 1"], // 2 PM UTC = 9 AM EST / 10 AM EDT on Mondays
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
    SWITCHBOT_TOKEN: alchemy.secret(process.env.SWITCHBOT_TOKEN as string),
    SWITCHBOT_KEY: alchemy.secret(process.env.SWITCHBOT_KEY as string),
    SWITCHBOT_DEVICE_ID: alchemy.secret(
      process.env.SWITCHBOT_DEVICE_ID as string,
    ),
    DB: db,
    KV: kv,
  },
});

console.log({
  url: worker.url,
});

await app.finalize();
