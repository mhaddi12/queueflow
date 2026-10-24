"use client";
import { useMemo, type FormEvent } from "react";
import Dialog from "./Dialog";
import {
  book,
  clock,
  localDay,
  services,
  staff,
  validate,
} from "../dist/engine.js";
import {
  saveWorkspace,
  useWorkspace,
  type Draft,
} from "../lib/workspace-store";
export default function BookingDialog() {
  const { data, draft, busy, notice, set } = useWorkspace();
  const slots = useMemo(() => {
    if (!draft) return [];
    const result: string[] = [];
    for (let minute = 540; minute < 1080; minute += 15) {
      try {
        validate(
          data,
          {
            ...draft,
            name: "Slot check",
            phone: "0000000000",
            time: clock(minute),
          },
          new Date(),
          draft.id,
        );
        result.push(clock(minute));
      } catch {}
    }
    return result;
  }, [data, draft?.date, draft?.service, draft?.staff, draft?.id]);
  if (!draft) return null;
  const booking = draft,
    service = services.find((item) => item.id === booking.service)!,
    max = new Date();
  max.setDate(max.getDate() + 60);
  function change(field: keyof Draft, value: string) {
    const current = useWorkspace.getState().draft;
    if (current) set({ draft: { ...current, [field]: value } });
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    const input = { ...booking };
    if (
      await saveWorkspace((current) =>
        book(current, input, new Date(), input.id),
      )
    )
      set({
        draft: null,
        notice: input.id
          ? "Appointment rescheduled."
          : "Appointment booked. No reminders were sent.",
      });
  }
  return (
    <Dialog
      title={booking.id ? "Reschedule appointment" : "New appointment"}
      close={() => set({ draft: null })}
      busy={busy}
    >
      <form onSubmit={submit}>
        <p className="muted">
          Times use this device’s timezone. Review availability before
          confirming.
        </p>
        <label>
          Customer name
          <input
            required
            minLength={2}
            maxLength={80}
            value={booking.name}
            onChange={(event) => change("name", event.target.value)}
            disabled={busy}
            autoComplete="name"
          />
        </label>
        <label>
          Phone number
          <input
            type="tel"
            required
            maxLength={22}
            value={booking.phone}
            onChange={(event) => change("phone", event.target.value)}
            disabled={busy}
            autoComplete="tel"
          />
        </label>
        <div className="form-grid">
          <label>
            Service
            <select
              value={booking.service}
              onChange={(event) => change("service", event.target.value)}
              disabled={busy}
            >
              {services.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Team member
            <select
              value={booking.staff}
              onChange={(event) => change("staff", event.target.value)}
              disabled={busy}
            >
              {staff.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input
              type="date"
              required
              min={localDay()}
              max={localDay(max)}
              value={booking.date}
              onInput={(event) => change("date", event.currentTarget.value)}
              onChange={(event) => change("date", event.target.value)}
              disabled={busy}
            />
          </label>
          <label>
            Time
            <select
              required
              value={booking.time}
              onChange={(event) => change("time", event.target.value)}
              disabled={busy}
            >
              <option value="">Choose an available time</option>
              {booking.time && !slots.includes(booking.time) && (
                <option value={booking.time} disabled>
                  {booking.time} — no longer available
                </option>
              )}
              {slots.map((time) => (
                <option key={time}>{time}</option>
              ))}
            </select>
          </label>
        </div>
        {!slots.length && (
          <p className="form-error" role="status">
            No available times. Choose another date, service or team member.
          </p>
        )}
        {booking.time && !slots.includes(booking.time) && (
          <p className="form-error" role="alert">
            That slot is no longer available. Choose another time.
          </p>
        )}
        {notice && (
          <p className="form-error" role="alert">
            {notice}
          </p>
        )}
        <p className="booking-summary">
          {service.minutes} minutes · PKR {service.price.toLocaleString()} · Pay
          at the business
        </p>
        <button
          className="primary full"
          disabled={busy || !booking.time || !slots.includes(booking.time)}
        >
          {busy ? "Saving…" : "Confirm appointment ↗"}
        </button>
        <small className="muted">
          Saved privately to your company workspace. No automatic reminders or
          payments.
        </small>
      </form>
    </Dialog>
  );
}
