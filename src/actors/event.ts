import { actor, UserError } from "actor-core";
import { z } from "zod";

type Guest = {
  id: string;
  name: string;
  email: string;
};

type GuestStatus = "not-going" | "going" | "waitlisted" | "invited";

type Event = {
  id: string;
  location: string;
  startDate: Date;
  endDate: Date;
  guestLimit: number;
  guests: Array<{
    guestId: string;
    status: GuestStatus;
  }>;
};

const GuestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

const EventSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  location: z.string().min(1, "Location is required"),
  guestLimit: z.number().int().positive("Guest limit must be positive"),
});

export const eventActor = actor({
  state: {
    events: [] as Event[],
    guests: new Map<string, Guest>(),
  },

  actions: {
    createEvent(c, input: z.infer<typeof EventSchema>) {
      const event: Event = {
        id: crypto.randomUUID(),
        ...input,
        guests: [],
      };

      c.state.events.push(event);
      return event;
    },

    getEvents(c) {
      return c.state.events;
    },

    getEventsByDate(c, date: Date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      return c.state.events.filter(event =>
        event.startDate <= endOfDay && event.endDate >= startOfDay
      );
    },

    getEvent(c, id: string) {
      return c.state.events.find(event => event.id === id);
    },

    getEventAttendee(c, { eventId, guestId }: { eventId: string; guestId: string }) {
      const event = c.state.events.find(e => e.id === eventId);
      if (!event) {
        throw new UserError("Event not found");
      }

      const guest = c.state.guests.get(guestId);
      const eventGuest = event.guests.find(g => g.guestId === guestId);
      if (!guest || !eventGuest) {
        return undefined;
      }

      return {
        ...guest,
        status: eventGuest.status
      };
    },

    registerGuest(c, { eventId, guest }: { eventId: string; guest: Omit<Guest, "id"> }): { status: GuestStatus, updated: boolean, guest: Guest } {
      const event = c.state.events.find(e => e.id === eventId);
      if (!event) {
        throw new UserError("Event not found");
      }

      GuestSchema.parse(guest);

      // Check if guest with this email already exists
      const existingGuest = Array.from(c.state.guests.values()).find(g => g.email === guest.email);
      if (existingGuest) {
        const existingEventGuest = event.guests.find(g => g.guestId === existingGuest.id);
        if (existingEventGuest) {
          return { status: existingEventGuest.status, updated: false, guest: existingGuest };
        }
        // Guest exists but not registered for this event
        const status = "invited";
        event.guests.push({ guestId: existingGuest.id, status });
        return { status, updated: true, guest: existingGuest };
      }

      // Create new guest
      const newGuest: Guest = {
        id: crypto.randomUUID(),
        ...guest
      };

      // Check if event is full
      const goingCount = event.guests.filter(g => g.status === "going").length;
      const status = goingCount >= event.guestLimit ? "waitlisted" : "going";

      c.state.guests.set(newGuest.id, newGuest);
      event.guests.push({ guestId: newGuest.id, status });
      return { status, updated: true, guest: newGuest };
    },

    removeGuest(c, { eventId, guestId }: { eventId: string; guestId: string }) {
      const event = c.state.events.find(e => e.id === eventId);
      if (!event) {
        throw new UserError("Event not found");
      }

      const guest = c.state.guests.get(guestId);
      if (!guest) {
        throw new UserError("Guest not found");
      }

      // Remove the guest from the event
      event.guests = event.guests.filter(g => g.guestId !== guestId);

      // If there's someone on the waitlist, move them to going
      const waitlistedGuest = event.guests.find(g => g.status === "waitlisted");
      if (waitlistedGuest) {
        waitlistedGuest.status = "going";
      }
    },

    updateEvent(c, { id, ...updates }: Partial<Event> & { id: string }) {
      const event = c.state.events.find(e => e.id === id);
      if (!event) {
        throw new UserError("Event not found");
      }

      // Validate updates if provided
      if (updates.startDate || updates.endDate || updates.guestLimit) {
        EventSchema.partial().parse(updates);
      }

      Object.assign(event, updates);
      return event;
    },

    deleteEvent(c, id: string) {
      const index = c.state.events.findIndex(e => e.id === id);
      if (index === -1) {
        throw new UserError("Event not found");
      }

      c.state.events.splice(index, 1);
    },
  },
});
