import { demoWorkspace } from "../dist/demo-workspace.js";
import { create } from "zustand";
import { empty, localDay } from "../dist/engine.js";
import { validateWorkspace } from "../dist/workspace-state.js";
export type Entry = {
  id: string;
  name: string;
  phone: string;
  service: string;
  staff: string;
  date: string;
  time: string;
  status: string;
  ticket: number | null;
  createdAt: string;
  requestId?: string;
  sample?: boolean;
};
export type WorkspaceData = {
  version: number;
  entries: Entry[];
  settings: {
    paused: boolean;
    capacity: number;
    away: string[];
    closedDates: string[];
  };
};
export type Draft = {
  id?: string;
  name: string;
  phone: string;
  service: string;
  staff: string;
  date: string;
  time: string;
  requestId: string;
};
export type View =
  "overview" | "appointments" | "queue" | "team" | "settings" | "customer";
type State = {
  data: WorkspaceData;
  mode: "demo" | "cloud";
  status: string;
  companyName: string;
  user: { uid: string; email: string | null; emailVerified: boolean; companyName?: string } | null;
  view: View;
  search: string;
  filter: string;
  day: string;
  online: boolean;
  busy: boolean;
  notice: string;
  accountOpen: boolean;
  draft: Draft | null;
  ready: boolean;
  hasSnapshot: boolean;
  set: (patch: Partial<State>) => void;
};
export const useWorkspace = create<State>((set) => ({
  data: empty(),
  mode: "demo",
  status: "loading",
  user: null,
  companyName: "",
  view: "overview",
  search: "",
  filter: "all",
  day: "",
  online: true,
  busy: false,
  notice: "",
  accountOpen: false,
  draft: null,
  ready: false,
  hasSnapshot: false,
  set: (patch) => set(patch),
}));
const key = "queueflow-demo-v1";
let sdk: typeof import("../firebase-client.js") | null = null,
  scope = 0,
  connection: Promise<void> | null = null,
  mutationScope = 0,
  disconnect: (() => void) | null = null;
export async function startCloud() {
  if (connection) return connection;
  const token = ++scope;
  useWorkspace.setState({
    mode: "cloud",
    hasSnapshot: false,
    data: empty(),
    status: "loading",
    user: null,
    draft: null,
    notice: "",
    busy: false,
  });
  const url = new URL(location.href);
  url.searchParams.set("workspace", "cloud");
  history.replaceState(null, "", url);
  connection = (async () => {
    try {
      sdk = await import("../firebase-client.js");
      if (token !== scope) return;
      disconnect = await sdk.connectWorkspace({
        state(data) {
          if (token === scope) useWorkspace.setState({ data, hasSnapshot: true });
        },
        status(status, user, error) {
          if (token !== scope) return;
          const old = useWorkspace.getState(),
            changed = old.user?.uid !== user?.uid;
          if (changed) mutationScope++;
          useWorkspace.setState({
            status,
            ...(["loading", "signed-out", "verify-email", "unassigned", "error"].includes(status) ? { hasSnapshot: false } : {}),
            companyName: user?.companyName || "",
            user: user
              ? {
                  uid: user.uid,
                  email: user.email,
                  emailVerified: user.emailVerified,
                }
              : null,
            ...(changed ? { draft: null, busy: false, notice: "" } : {}),
            ...(status === "connected" && old.status !== "connected"
              ? { accountOpen: false }
              : {}),
            ...(error
              ? { notice: sdk?.message(error) || "Could not connect." }
              : {}),
          });
        },
      });
    } catch {
      if (token === scope) {
        connection = null;
        useWorkspace.setState({
          status: "error",
          notice: "Could not connect. Check your connection, then retry.",
        });
      }
    }
  })();
  return connection;
}
export function initializeWorkspace() {
  useWorkspace.setState({
    ready: true,
    day: localDay(),
    online: navigator.onLine,
  });
  const syncOnline = () => useWorkspace.setState({ online: navigator.onLine });
  const storage = (event: StorageEvent) => {
    if (useWorkspace.getState().mode === "demo" && event.key === key) {
      try {
        useWorkspace.setState({
          data: event.newValue
            ? validateWorkspace(JSON.parse(event.newValue))
            : empty(),
        });
      } catch {
        useWorkspace.setState({
          notice:
            "Stored records could not be read. Export a backup before clearing data.",
        });
      }
    }
  };
  window.addEventListener("online", syncOnline);
  window.addEventListener("offline", syncOnline);
  window.addEventListener("storage", storage);
  if (new URLSearchParams(location.search).get("workspace") === "demo") {
    useWorkspace.setState({ mode: "demo", hasSnapshot: true, status: "connected", companyName: "Acme Care · Demo", user: {uid:"demo",email:"demo@example.com",emailVerified:true}, data: demoWorkspace() });
    localStorage.setItem(key, JSON.stringify(useWorkspace.getState().data));
  } else void startCloud();
  return () => {
    window.removeEventListener("online", syncOnline);
    window.removeEventListener("offline", syncOnline);
    window.removeEventListener("storage", storage);
    scope++;
    disconnect?.();
    disconnect = null;
    connection = null;
  };
}
export async function saveWorkspace(
  change: (data: WorkspaceData) => WorkspaceData,
) {
  const before = useWorkspace.getState(),
    token = scope,
    mutationToken = mutationScope;
  if (before.busy) {
    useWorkspace.setState({ notice: "A save is in progress. Please wait." });
    return false;
  }
  useWorkspace.setState({ busy: true, notice: "" });
  try {
    if (before.mode === "cloud") {
      if (!before.online || before.status !== "connected" || !sdk)
        throw Error("Reconnect before saving. Your form has been kept.");
      await sdk.changeWorkspace(change);
    } else {
      if (!navigator.locks)
        throw Error("Use an up-to-date browser to safely coordinate changes.");
      await navigator.locks.request(key, () => {
        if (token !== scope) throw Error("The workspace changed. Try again.");
        const raw = localStorage.getItem(key),
          data = validateWorkspace(
            change(raw ? validateWorkspace(JSON.parse(raw)) : empty()),
          );
        localStorage.setItem(key, JSON.stringify(data));
        useWorkspace.setState({ data });
      });
    }
    return token === scope && mutationToken === mutationScope;
  } catch (error) {
    if (token === scope && mutationToken === mutationScope)
      useWorkspace.setState({
        notice:
          sdk && before.mode === "cloud"
            ? sdk.message(error)
            : error instanceof Error
              ? error.message
              : "Could not save. Check storage and retry.",
      });
    return false;
  } finally {
    if (token === scope && mutationToken === mutationScope)
      useWorkspace.setState({ busy: false });
  }
}
export async function accountAction(action: string, email = "", password = "") {
  if (useWorkspace.getState().busy)
    throw Error("Wait for the workspace save to finish.");
  if (useWorkspace.getState().mode === "demo") { location.href = "?workspace=cloud"; return ""; }
  await startCloud();
  if (!sdk) throw Error("Connection unavailable. Retry.");
  if (action === "login") await sdk.emailLogin(email, password);
  if (action === "reset") await sdk.resetPassword(email);
  if (action === "verify") await sdk.verificationEmail();
  if (action === "refresh")
    return (await sdk.refreshVerification())
      ? "Email verified. Sign in again."
      : "Open the verification email, then return here.";
  if (action === "logout") await sdk.logout();
  return action === "verify"
      ? "Verification email requested."
      : action === "reset"
        ? "If this address has an account, a reset email has been requested."
        : "";
}
