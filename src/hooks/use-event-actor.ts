import { useRequestContext } from "hono/jsx-renderer";
import type { HonoEnv } from "..";

export const useEventActor = async (location: string = "nyc") => {
	const c = useRequestContext<HonoEnv>();
	const status = await c.var.client.event.get({ tags: { location } });
	return status;
};
