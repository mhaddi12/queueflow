"use client";
import { useEffect, useState } from "react";
import { getPlan, pricing } from "../dist/billing-policy.js";
import { resolveWalletCheckout } from "../dist/wallet-checkout.js";
export default function Billing() {
  const [id, setId] = useState("monthly"),
    [message, setMessage] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requested = params.get("plan");
    if (requested) {
      try {
        getPlan(requested);
        setId(requested);
      } catch {
        setMessage("That plan is not available. Choose monthly or annual.");
      }
    }
    if (params.has("result"))
      setMessage(
        "Payment verification pending. Returning to this page never activates a subscription.",
      );
  }, []);
  const plan = getPlan(id);
  let offer: ReturnType<typeof resolveWalletCheckout> | null = null,
    reason = "";
  try {
    offer = resolveWalletCheckout(id);
  } catch (error) {
    reason =
      error instanceof Error ? error.message : "Checkout is unavailable.";
  }
  return (
    <>
      <header className="site-header">
        <a className="logo" href="/queueflow/">
          queueflow
        </a>
        <a className="plain-link" href="/queueflow/app.html?workspace=cloud">
          Open workspace ↗
        </a>
      </header>
      <main className="wrap billing-page">
        <div className="eyebrow">ANNOUNCED BUSINESS PLANS</div>
        <h1>
          Your plan.
          <br />A clearer day.
        </h1>
        <p className="billing-intro">
          Planned 30-day free trial, then US$10 monthly or US$100 annually. Live
          billing is not active.
        </p>
        <fieldset>
          <legend>Choose your billing period</legend>
          {["monthly", "annual"].map((value) => (
            <label className="plan-choice" key={value}>
              <input
                type="radio"
                name="plan"
                checked={id === value}
                onChange={() => {
                  setId(value);
                  setMessage("");
                }}
              />
              <span>
                <b>{getPlan(value).name}</b>
                <small>After the planned trial</small>
              </span>
              <strong>
                US${getPlan(value).amountMinor / 100}
                <small>/{getPlan(value).interval}</small>
              </strong>
            </label>
          ))}
        </fieldset>
        <section className="billing-summary">
          <h2>{plan.name} plan</h2>
          <p>
            US${plan.amountMinor / 100} per {plan.interval}. No payment or trial
            has started.
          </p>
        </section>
        <p className="billing-notice" role="status">
          {message ||
            reason ||
            "One-time payment with manual renewal. Access begins only after independent verification."}
        </p>
        <button
          className="button"
          disabled={!offer}
          onClick={() => {
            try {
              location.assign(resolveWalletCheckout(id).url);
            } catch (error) {
              setMessage(
                error instanceof Error
                  ? error.message
                  : "Checkout is unavailable.",
              );
            }
          }}
        >
          {offer
            ? "Continue to " + offer.provider
            : "Subscription checkout unavailable"}
        </button>
        <p className="billing-fine">
          Currency, merchant approval, payment terms and subscription
          enforcement must be finalized before live checkout. Selecting a plan
          does not activate a trial.
        </p>
        <a className="plain-link" href="/queueflow/#pricing">
          ← Back to pricing
        </a>
      </main>
    </>
  );
}
