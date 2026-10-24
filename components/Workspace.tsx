"use client";

import { useEffect, useRef, useState } from "react";
import {
  empty,
  localDay,
  services,
  staff,
  transition,
} from "../dist/engine.js";
import { connectionMessage } from "../dist/ui-state.js";
import {
  initializeWorkspace,
  saveWorkspace,
  startCloud,
  useWorkspace,
  type Entry,
  type View,
  type WorkspaceData,
} from "../lib/workspace-store";
import AccountDialog from "./AccountDialog";
import BookingDialog from "./BookingDialog";
import Dialog from "./Dialog";
import WorkspaceSkeleton, { PendingIndicator } from "./Loading";
import { needsWorkspaceSkeleton } from "../dist/loading-state.js";

const labels: Record<string, string> = {
  booked: "Scheduled",
  waiting: "Waiting",
  serving: "In service",
  completed: "Completed",
  cancelled: "Cancelled",
  noshow: "No-show",
};
const navigation: [View, string][] = [
  ["overview", "Overview"],
  ["appointments", "Appointments"],
  ["queue", "Live queue"],
  ["team", "Team & availability"],
  ["settings", "Settings"],
];
const serviceFor = (entry: Entry) =>
  services.find((service) => service.id === entry.service)!;

function newBooking(entry?: Entry) {
  const current = useWorkspace.getState();
  if (current.busy || !current.online || current.status !== "connected") return;
  if (entry && entry.status !== "booked") {
    current.set({ notice: "This appointment changed. Select it again." });
    return;
  }
  current.set({
    notice: "",
    draft: {
      id: entry?.id,
      name: entry?.name || "",
      phone: entry?.phone || "",
      service: entry?.service || services[0].id,
      staff: entry?.staff || staff[0],
      date: entry?.date || localDay(),
      time: entry?.time || "",
      requestId: crypto.randomUUID(),
    },
  });
}
function Stats() {
  const { data } = useWorkspace();
  const entries = data.entries.filter((entry) => entry.date === localDay());
  const waiting = entries.filter((entry) => entry.status === "waiting");
  const stats = [
    [
      "Today’s appointments",
      entries.filter((entry) => entry.status !== "cancelled").length,
      "Scheduled appointments for today",
    ],
    [
      "In the queue",
      waiting.length,
      data.settings.paused ? "New check-ins paused" : "Ready when you are",
    ],
    [
      "Completed today",
      entries.filter((entry) => entry.status === "completed").length,
      "A little more time well spent",
    ],
    [
      "Queued service time",
      waiting.reduce((sum, entry) => sum + serviceFor(entry).minutes, 0) +
        " min",
      "Total workload, not a wait promise",
    ],
  ];
  return (
    <div className="stats">
      {stats.map(([title, value, copy], index) => (
        <section
          className={"stat " + (index === 1 ? "highlight" : "")}
          key={title}
        >
          <div className="stat-head">
            <span>{title}</span>
          </div>
          <div className="stat-value">{value}</div>
          <small>{copy}</small>
        </section>
      ))}
    </div>
  );
}
type ConfirmAction = (
  title: string,
  copy: string,
  action: () => Promise<unknown>,
) => void;
function EntryActions({
  entry,
  confirm,
}: {
  entry: Entry;
  confirm: ConfirmAction;
}) {
  const { busy, online, status, set } = useWorkspace();
  const disabled = busy || !online || status !== "connected";
  async function update(next: string) {
    if (await saveWorkspace((data) => transition(data, entry.id, next)))
      set({ notice: "Appointment updated." });
  }
  return (
    <div className="actions">
      {entry.status === "booked" && (
        <>
          <button disabled={disabled} onClick={() => update("waiting")}>
            Check in
          </button>
          <button disabled={disabled} onClick={() => newBooking(entry)}>
            Edit
          </button>
        </>
      )}
      {entry.status === "waiting" && (
        <button disabled={disabled} onClick={() => update("serving")}>
          Start →
        </button>
      )}
      {entry.status === "serving" && (
        <button disabled={disabled} onClick={() => update("completed")}>
          Complete ✓
        </button>
      )}
      {["booked", "waiting"].includes(entry.status) && (
        <>
          <button
            disabled={disabled}
            className="danger"
            onClick={() =>
              confirm(
                "Cancel this appointment?",
                "This releases the slot. Create a new booking if it is needed again.",
                () => update("cancelled"),
              )
            }
          >
            Cancel
          </button>
          <button
            disabled={disabled}
            onClick={() =>
              confirm(
                "Mark as a no-show?",
                "A 15-minute grace period is required before a no-show can release the slot.",
                () => update("noshow"),
              )
            }
          >
            No-show
          </button>
        </>
      )}
    </div>
  );
}
function Appointments({
  compact = false,
  confirm,
}: {
  compact?: boolean;
  confirm: ConfirmAction;
}) {
  const { data, day, search, filter, set } = useWorkspace();
  const entries = data.entries
    .filter(
      (entry) =>
        entry.date === day &&
        (filter === "all" || entry.status === filter) &&
        (entry.name + " " + entry.phone + " " + entry.staff)
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) => a.time.localeCompare(b.time));
  const shown = compact ? entries.slice(0, 6) : entries;
  return (
    <section className="panel">
      <div className="panel-title">
        <div>
          <h2>{compact ? "Today’s appointments" : "Appointments"}</h2>
          <p>A little organization. A smoother day.</p>
        </div>
        {compact && (
          <button
            className="text-link"
            onClick={() => set({ view: "appointments" })}
          >
            View all appointments ↗
          </button>
        )}
      </div>
      <div className="filters">
        <input
          type="search"
          placeholder="Search customer or team…"
          aria-label="Search appointments"
          value={search}
          onChange={(event) => set({ search: event.target.value })}
        />
        <input
          type="date"
          aria-label="Appointment date"
          value={day}
          onInput={(event) => set({ day: event.currentTarget.value || localDay() })}
          onChange={(event) => set({ day: event.target.value || localDay() })}
        />
      </div>
      <div className="tabs">
        {[
          ["all", "All"],
          ["booked", "Scheduled"],
          ["waiting", "Waiting"],
          ["completed", "Completed"],
        ].map(([value, title]) => (
          <button
            className={filter === value ? "active" : ""}
            key={value}
            onClick={() => set({ filter: value })}
          >
            {title}
          </button>
        ))}
        <select
          aria-label="More status filters"
          value={
            ["serving", "cancelled", "noshow"].includes(filter) ? filter : "all"
          }
          onChange={(event) => set({ filter: event.target.value })}
        >
          <option value="all">More</option>
          {["serving", "cancelled", "noshow"].map((value) => (
            <option value={value} key={value}>
              {labels[value]}
            </option>
          ))}
        </select>
      </div>
      {shown.length ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>CUSTOMER</th>
                <th>TIME / SERVICE</th>
                <th>TEAM</th>
                <th>STATUS</th>
                {!compact && <th>ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {shown.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <div className="customer-cell">
                      <span className="avatar">
                        {entry.name
                          .split(" ")
                          .map((name) => name[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <div>
                        <b>{entry.name}</b>
                        <small>{entry.phone}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <b>{entry.time}</b>
                    <small>
                      {serviceFor(entry).name} · {serviceFor(entry).minutes} min
                    </small>
                  </td>
                  <td>
                    {entry.staff}
                    <small>
                      {entry.ticket
                        ? "Ticket #" + entry.ticket
                        : "By appointment"}
                    </small>
                  </td>
                  <td>
                    <span className={"status " + entry.status}>
                      {labels[entry.status]}
                    </span>
                  </td>
                  {!compact && (
                    <td>
                      <EntryActions entry={entry} confirm={confirm} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <strong>No appointments match this view.</strong>
          <p>Choose another date or filter, or add an appointment.</p>
          <button className="secondary" onClick={() => newBooking()}>
            ＋ Add an appointment
          </button>
        </div>
      )}
      <div className="table-footer">
        Showing {shown.length} of {entries.length} appointments · Device local
        time
      </div>
    </section>
  );
}
function Queue({ confirm }: { confirm: ConfirmAction }) {
  const { data } = useWorkspace();
  const entries = data.entries.filter((entry) => entry.date === localDay());
  const serving = entries.filter((entry) => entry.status === "serving");
  const waiting = entries
    .filter((entry) => entry.status === "waiting")
    .sort((a, b) => (a.ticket || 0) - (b.ticket || 0));
  return (
    <section className="panel queue-panel">
      <div className="panel-title">
        <div>
          <h2>Live queue</h2>
          <p>One person closer to a great day.</p>
        </div>
        <span className="live">
          ● {data.settings.paused ? "PAUSED" : "LIVE"}
        </span>
      </div>
      {serving.length ? (
        serving.map((entry) => (
          <div className="serving-card" key={entry.id}>
            <div className="overline">NOW SERVING · #{entry.ticket}</div>
            <h3>{entry.name}</h3>
            <p>
              {serviceFor(entry).name} · {entry.staff}
            </p>
            <EntryActions entry={entry} confirm={confirm} />
          </div>
        ))
      ) : (
        <div className="serving-card">
          <div className="overline">READY FOR THE NEXT PERSON</div>
          <h3>A moment to catch your breath.</h3>
          <p>No customers are currently in service.</p>
        </div>
      )}
      <div className="queue-label">UP NEXT ({waiting.length})</div>
      <div className="queue-list">
        {waiting.length ? (
          waiting.map((entry) => (
            <div className="queue-row" key={entry.id}>
              <span className="queue-number">{entry.ticket}</span>
              <div>
                <b>{entry.name}</b>
                <small>
                  {serviceFor(entry).name} · {entry.staff}
                </small>
              </div>
              <EntryActions entry={entry} confirm={confirm} />
            </div>
          ))
        ) : (
          <div className="empty">The queue is clear.</div>
        )}
      </div>
      <div className="queue-bottom">
        Check-in order determines ticket order. Each team member can serve one
        customer at a time.
      </div>
    </section>
  );
}
function Team() {
  const { data, busy, online, set } = useWorkspace();
  return (
    <div className="settings-grid">
      {staff.map((name) => {
        const away = data.settings.away.includes(name);
        return (
          <section className="panel settings-card" key={name}>
            <span className="avatar">
              {name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </span>
            <h3>{name}</h3>
            <p>
              {away
                ? "Away — new bookings are blocked."
                : "Available for new bookings."}
            </p>
            <p>
              Existing appointments are preserved when availability changes.
            </p>
            <button
              className="secondary"
              disabled={busy || !online}
              onClick={async () => {
                if (
                  await saveWorkspace((current) => ({
                    ...current,
                    settings: {
                      ...current.settings,
                      away: away
                        ? current.settings.away.filter(
                            (value) => value !== name,
                          )
                        : [...new Set([...current.settings.away, name])],
                    },
                  }))
                )
                  set({ notice: "Availability updated." });
              }}
            >
              {away ? "Mark available" : "Mark away"}
            </button>
          </section>
        );
      })}
    </div>
  );
}
function Settings({ confirm }: { confirm: ConfirmAction }) {
  const { data, busy, online, set } = useWorkspace();
  const [capacity, setCapacity] = useState(String(data.settings.capacity));
  const [dirty, setDirty] = useState(false);
  const [date, setDate] = useState("");
  useEffect(() => {
    if (!dirty) setCapacity(String(data.settings.capacity));
  }, [data.settings.capacity, dirty]);
  async function updateCapacity() {
    const value = Number(capacity);
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      set({ notice: "Capacity must be a whole number from 1 to 100." });
      return;
    }
    if (
      await saveWorkspace((current) => ({
        ...current,
        settings: { ...current.settings, capacity: value },
      }))
    ) {
      setDirty(false);
      set({ notice: "Queue capacity saved. Existing customers remain." });
    }
  }
  function exportRecords() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "queueflow-" + localDay() + ".json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="settings-grid">
      <section className="panel settings-card">
        <h3>Queue controls</h3>
        <p>Pause new check-ins while continuing to serve the existing queue.</p>
        <button
          className="secondary"
          disabled={busy || !online}
          onClick={() => {
            const paused = !data.settings.paused;
            void saveWorkspace((current) => ({
              ...current,
              settings: { ...current.settings, paused },
            }));
          }}
        >
          {data.settings.paused ? "Resume check-in" : "Pause check-in"}
        </button>
        <label>
          Maximum active queue size
          <input
            type="number"
            min="1"
            max="100"
            value={capacity}
            onChange={(event) => {
              setCapacity(event.target.value);
              setDirty(true);
            }}
          />
        </label>
        {dirty && <small role="status">Unsaved capacity change</small>}
        <button
          className="secondary"
          disabled={busy || !online}
          onClick={updateCapacity}
        >
          Save capacity
        </button>
      </section>
      <section className="panel settings-card">
        <h3>Business hours</h3>
        <p>
          Monday–Saturday · 09:00–18:00
          <br />
          Lunch break · 13:00–14:00
          <br />
          Sunday · Closed
          <br />
          Bookings open 60 days ahead.
          <br />
          Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone} (device
          local).
        </p>
        <label>
          Close a date
          <input
            type="date"
            min={localDay()}
            value={date}
            onInput={(event) => setDate(event.currentTarget.value)}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <button
          className="secondary"
          disabled={busy || !online}
          onClick={() => {
            if (!date || date < localDay()) {
              set({ notice: "Choose today or a future date." });
              return;
            }
            const chosen = date;
            confirm(
              "Close this date?",
              "New bookings for " +
                chosen +
                " will be blocked. Existing appointments need separate review.",
              async () => {
                if (
                  await saveWorkspace((current) => ({
                    ...current,
                    settings: {
                      ...current.settings,
                      closedDates: [
                        ...new Set([...current.settings.closedDates, chosen]),
                      ],
                    },
                  }))
                )
                  setDate("");
              },
            );
          }}
        >
          Add closure
        </button>
        <p>
          {data.settings.closedDates.length
            ? data.settings.closedDates.map((value) => (
                <span key={value}>
                  {value}{" "}
                  <button
                    className="text-link"
                    disabled={busy || !online}
                    onClick={() =>
                      saveWorkspace((current) => ({
                        ...current,
                        settings: {
                          ...current.settings,
                          closedDates: current.settings.closedDates.filter(
                            (day) => day !== value,
                          ),
                        },
                      }))
                    }
                  >
                    Reopen ×
                  </button>
                  <br />
                </span>
              ))
            : "No additional closures."}
        </p>
      </section>
      <section className="panel settings-card">
        <h3>Workspace data</h3>
        <p>
          Your company records are private to your verified account. Export a
          backup before clearing records.
        </p>
        <div className="actions">
          <button onClick={exportRecords}>Export workspace</button>
          <button
            className="danger"
            disabled={busy || !online}
            onClick={() =>
              confirm(
                "Clear your workspace?",
                "This permanently replaces all appointments and settings with an empty workspace across your devices. Export a backup first.",
                () => saveWorkspace(() => empty()),
              )
            }
          >
            Clear workspace
          </button>
          <button onClick={() => set({ accountOpen: true })}>Account</button>
        </div>
      </section>
    </div>
  );
}
export default function Workspace() {
  const state = useWorkspace();
  const {
    data,
    ready,
    user,
    status,
    online,
    busy,
    notice,
    view,
    set,
    accountOpen,
    draft,
  } = state;
  const [menu, setMenu] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    title: string;
    copy: string;
    action: () => Promise<unknown>;
  } | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => initializeWorkspace(), []);
  useEffect(() => {
    setMenu(false);
    setConfirmation(null);
  }, [user?.uid]);
  useEffect(() => {
    window.scrollTo(0, 0);
    titleRef.current?.focus({ preventScroll: true });
  }, [view]);
  useEffect(() => {
    if (!menu) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = old;
      window.removeEventListener("keydown", escape);
    };
  }, [menu]);
  const confirm: ConfirmAction = (title, copy, action) => {
    if (!busy) setConfirmation({ title, copy, action });
  };
  const locked =
    !ready ||
    !user ||
    !user.emailVerified ||
    ["loading", "signed-out", "verify-email", "unassigned", "error"].includes(status);
  const message = connectionMessage({
    mode: "cloud",
    status,
    online,
    busy,
    error: notice,
  });
  const openAccount = () => {
    setMenu(false);
    set({ accountOpen: true });
    if (state.mode !== "demo") void startCloud();
  };
  const canEdit = status === "connected" && online && !busy;
  if (needsWorkspaceSkeleton(state)) {
    return <>
      <WorkspaceSkeleton view={view} />
      {accountOpen && <AccountDialog />}
    </>;
  }
  return (
    <>
      <button
        id="nav-scrim"
        style={{ display: menu ? "block" : "none" }}
        aria-label="Close navigation"
        onClick={() => setMenu(false)}
      />
      {!locked && (
        <aside className={"sidebar " + (menu ? "open" : "")}>
          <a className="brand" href="/queueflow/">
            <span className="brandmark">q</span>queueflow
            <span className="branddot">●</span>
          </a>
          <div className="business">
            <span className="avatar">{state.companyName.slice(0, 1).toUpperCase()}</span>
            <div>
              <b>{state.companyName}</b>
              <small>Private workspace</small>
            </div>
          </div>
          <small className="navlabel">WORKSPACE</small>
          <nav>
            {navigation.map(([value, label]) => (
              <button
                className={view === value ? "selected" : ""}
                key={value}
                onClick={() => {
                  setMenu(false);
                  set({ view: value });
                }}
              >
                {label}
                {value === "appointments" && (
                  <i>
                    {
                      data.entries.filter((entry) => entry.date === localDay())
                        .length
                    }
                  </i>
                )}
              </button>
            ))}
          </nav>
          <div className="sidebottom">
            <div className="profile">
              <span className="avatar">QF</span>
              <div>
                <b>Your account</b>
                <small>{user?.email}</small>
              </div>
            </div>
          </div>
        </aside>
      )}
      <div className="workspace" style={locked ? { marginLeft: 0 } : undefined}>
        <header>
          {!locked && (
            <button
              id="menu"
              aria-label="Toggle navigation"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              ☰
            </button>
          )}
          <span className="breadcrumb">
            {state.companyName || "Workspace"} <span>/</span>{" "}
            <b>
              {locked
                ? "Sign in"
                : navigation.find(([value]) => value === view)?.[1]}
            </b>
          </span>
          <div className="header-right">
            <button className="subtle" onClick={openAccount}>
              {user ? "Account" : "Sign in"}
            </button>
          </div>
        </header>
        <main aria-busy={busy}>
          {busy && <PendingIndicator />}
          {state.mode === "demo" && <div className="connection-banner" role="status"><b>Demo company</b> · Sample records stay in this browser. <a href="?workspace=cloud">Company sign in →</a></div>}
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {ready
                  ? new Date()
                      .toLocaleDateString("en", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                      .toUpperCase()
                  : "YOUR PRIVATE WORKSPACE"}
              </div>
              <h1 tabIndex={-1} ref={titleRef}>
                {locked
                  ? "Your day starts here."
                  : view === "overview"
                    ? "A good day starts here."
                    : navigation.find(([value]) => value === view)?.[1]}
              </h1>
              <p>
                {locked
                  ? "Sign in to open your company’s appointments and queue."
                  : "A clear view of your appointments, your team, and who’s up next."}
              </p>
            </div>
            {!locked && (
              <button
                className="primary"
                disabled={!canEdit}
                onClick={() => {
                  setMenu(false);
                  newBooking();
                }}
              >
                ＋ New appointment
              </button>
            )}
          </div>
          {(!online || status !== "connected" || busy) && (
            <div className="connection-banner" role="status">
              <div>
                <b>{message.title}</b> · {message.detail}
              </div>
            </div>
          )}
          {notice && !draft && (
            <div className="workspace-message" role="status">
              {notice}
              <button
                className="text-link"
                aria-label="Dismiss message"
                onClick={() => set({ notice: "" })}
              >
                Dismiss ×
              </button>
            </div>
          )}
          {locked ? (
            <section
              className="panel settings-card"
              style={{ maxWidth: 620, margin: "32px auto" }}
            >
              <h2>
                {status === "loading"
                  ? "Loading your private workspace…"
                  : status === "unassigned"
                    ? "Company access is not assigned"
                    : status === "verify-email"
                    ? "Verify your email"
                    : "Welcome to QueueFlow"}
              </h2>
              <p>
                Accounts are created by the QueueFlow administrator for each company. Sign in with your assigned account to manage appointments and queues.
              </p>
              <button className="primary" onClick={openAccount}>
                {user ? "Account & verification" : "Company sign in"}
              </button>
              <a className="demo-entry" href="?workspace=demo">Explore demo company →</a>
            </section>
          ) : (
            <section id="content">
              {view === "overview" && (
                <>
                  <Stats />
                  <div className="dashboard-grid">
                    <Appointments compact confirm={confirm} />
                    <Queue confirm={confirm} />
                  </div>
                </>
              )}
              {view === "appointments" && <Appointments confirm={confirm} />}
              {view === "queue" && (
                <>
                  <Stats />
                  <Queue confirm={confirm} />
                </>
              )}
              {view === "team" && <Team />}
              {view === "settings" && <Settings confirm={confirm} />}
            </section>
          )}
          <footer>
            <span>
              <b>queueflow</b> · Make time for people.
            </span>
            <span>
              {busy
                ? "Saving changes…"
                : status === "connected" && online
                  ? "Connected"
                  : message.title}
            </span>
          </footer>
        </main>
      </div>
      {accountOpen && <AccountDialog />}
      {draft && <BookingDialog />}
      {confirmation && (
        <Dialog
          title={confirmation.title}
          close={() => setConfirmation(null)}
          busy={busy}
        >
          <p>{confirmation.copy}</p>
          {notice && (
            <p className="form-error" role="alert">
              {notice}
            </p>
          )}
          <div className="actions">
            <button
              className="secondary"
              disabled={busy}
              onClick={() => setConfirmation(null)}
            >
              Go back
            </button>
            <button
              className="primary"
              disabled={busy}
              onClick={async () => {
                const action = confirmation.action;
                setConfirmation(null);
                await action();
              }}
            >
              Confirm
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
