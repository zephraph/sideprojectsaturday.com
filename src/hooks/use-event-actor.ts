import type { HonoContext } from "..";

export const useEventActor = async (context: HonoContext, location: string = "nyc") => {
	const status = await context.var.client.event.get({ tags: { location } });
	return status;
};
