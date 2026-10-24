"use client";
import { useState, type FormEvent } from "react";
import Dialog from "./Dialog";
import { accountAction, useWorkspace } from "../lib/workspace-store";
export default function AccountDialog() {
  const { user, status, set } = useWorkspace();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    [pending, setPending] = useState(false);
  async function run(action: string) {
    if (pending) return;
    if (["login", "reset"].includes(action) && !email.trim()) {
      setMessage("Enter your email address.");
      return;
    }
    setPending(true);
    setMessage("Please wait…");
    try {
      setMessage((await accountAction(action, email.trim(), password)) || "");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not complete this action.",
      );
    } finally {
      setPending(false);
      setPassword("");
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    void run("login");
  }
  return (
    <Dialog
      title={user ? "Your account" : "Sign in to QueueFlow"}
      busy={pending}
      close={() => set({ accountOpen: false })}
    >
      {user ? (
        <section>
          <p className="muted">SIGNED IN AS</p>
          <p>{user.email}</p>
          <p>Your company workspace is private to this account.</p>
          {!user.emailVerified && (
            <div className="actions">
              <button disabled={pending} onClick={() => run("verify")}>
                Send verification email
              </button>
              <button disabled={pending} onClick={() => run("refresh")}>
                I verified my email
              </button>
            </div>
          )}
          <button
            className="secondary"
            disabled={pending}
            onClick={() => run("logout")}
          >
            Sign out
          </button>
        </section>
      ) : (
        <>
          <p>Sign in to open your private company workspace.</p>
          <p className="muted">Your company account is created by the QueueFlow administrator. Use the credentials provided to you.</p>
          <form onSubmit={submit}>
            <label>
              Email
              <input
                type="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                disabled={pending}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                minLength={6}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                disabled={pending}
              />
            </label>
            <div className="actions">
              <button className="primary" disabled={pending}>
                Sign in
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => run("reset")}
              >
                Reset password
              </button>
            </div>
          </form>
        </>
      )}
      <p role="status" aria-live="polite" className="workspace-message">
        {message ||
          (status === "connected"
            ? "Your workspace is connected."
            : status === "verify-email"
              ? "Verify your email before opening your records."
              : "Sign out when using a shared device.")}
      </p>
    </Dialog>
  );
}
