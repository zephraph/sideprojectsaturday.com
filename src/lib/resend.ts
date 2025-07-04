import { Resend } from "resend";
import { lazy } from "./utils.ts";

const resend = lazy(() => new Resend(process.env.RESEND_API_KEY));

export default resend;
