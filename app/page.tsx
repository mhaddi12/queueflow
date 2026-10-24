import type { Metadata } from "next";
export const metadata: Metadata = {
  alternates: { canonical: "https://mhaddi12.github.io/queueflow/" },
  robots: { index: true, follow: true },
};
const features = [
  [
    "Appointments that fit",
    "Check service duration, overlapping bookings, opening hours and lunch breaks before saving.",
  ],
  [
    "A clear place in the queue",
    "Check customers in, follow ticket order and move appointments from waiting to completed.",
  ],
  [
    "Room for changing plans",
    "Reschedule appointments, pause check-ins, set queue capacity and mark team members away.",
  ],
];
const questions = [
  [
    "How do I open my workspace?",
    "Sign in with Google or a verified email account. Your company records are private to your account and synchronized across your devices.",
  ],
  [
    "What booking rules are included?",
    "The preview checks overlapping appointments, service duration, staff availability, business closures and a 60-day booking horizon. Times currently use the device timezone.",
  ],
  [
    "Is QueueFlow ready for a full business launch?",
    "This is an early owner-workspace preview. Public customer booking, shared staff accounts, server-authoritative business rules and consistent business timezone settings need further work.",
  ],
  [
    "Are payments and reminders active?",
    "No. Live payments and automatic reminders are not enabled. Selecting an announced plan does not start a trial or charge your account.",
  ],
];
export default function Home() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "QueueFlow",
    url: "https://mhaddi12.github.io/queueflow/",
    description:
      "Appointment and queue management preview with a private owner workspace.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web browser",
    author: {
      "@type": "Person",
      name: "Muhammad Haddi",
      url: "https://haddidev.xyz/",
    },
    softwareVersion: "Public preview",
  };
  return (
    <>
      <link rel="stylesheet" href="/queueflow/landing.css" />
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="logo" href="/queueflow/">
          <span className="logomark">q</span>queueflow
          <span className="logo-dot">●</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#workflow">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#questions">Questions</a>
        </nav>
        <a className="button small" href="/queueflow/app.html?workspace=cloud">
          Sign in ↗
        </a>
      </header>
      <main id="main">
        <section className="hero wrap">
          <div className="hero-copy">
            <div className="eyebrow">SMALL BUSINESS. SMOOTHER DAYS.</div>
            <h1>
              Less waiting.
              <br />
              More <em>flow.</em>
            </h1>
            <p>
              Appointment scheduling and queue management in one focused
              workspace. Give your team and the next person in line a clear next
              step.
            </p>
            <div className="hero-actions">
              <a className="button" href="/queueflow/app.html?workspace=cloud">
                Open your workspace ↗
              </a>
              <a className="plain-link" href="#workflow">
                See how it works ↓
              </a>
            </div>
            <div className="hero-note">
              <span>◉</span>
              <p>
                Early owner-workspace preview. Sign in to keep your company
                records private.
              </p>
            </div>
          </div>
          <div
            className="hero-visual"
            aria-label="Illustrative appointment workspace"
          >
            <div className="visual-top">
              <span className="mini-logo">q</span>
              <span>EXAMPLE WORKSPACE</span>
            </div>
            <div className="visual-heading">
              <h2>Your day, in a good place.</h2>
            </div>
            <div className="mock-stats">
              <div>
                <small>Appointments</small>
                <strong>06</strong>
                <span>Example schedule</span>
              </div>
              <div className="tinted">
                <small>In the queue</small>
                <strong>02</strong>
                <span>One step closer</span>
              </div>
            </div>
            {["Jordan Lee", "Amelia Carter", "Noah Williams"].map(
              (name, index) => (
                <div className="mock-row" key={name}>
                  <span className="person-avatar sage">
                    {name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  <div>
                    <b>{name}</b>
                    <small>
                      Consultation · {["09:00", "09:30", "10:00"][index]}
                    </small>
                  </div>
                  <span className="mock-status">
                    {index ? "Waiting" : "In service"}
                  </span>
                </div>
              ),
            )}
            <div className="visual-footer">
              Every person. A clear next step.
            </div>
          </div>
        </section>
        <section className="workflow wrap" id="workflow">
          <div className="section-heading">
            <div className="eyebrow">FROM BOOKING TO COMPLETION</div>
            <h2>A clearer service workflow.</h2>
            <p>Explore controls built around real scheduling situations.</p>
          </div>
          <div className="workflow-grid">
            {features.map(([title, copy], index) => (
              <article key={title}>
                <span className="step">0{index + 1} / KEEP THE DAY MOVING</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="details-section">
          <div className="wrap details-grid">
            <div>
              <div className="eyebrow">YOUR WORKSPACE, TOGETHER</div>
              <h2>
                One account.
                <br />A clearer day.
              </h2>
              <p>
                Your appointments and settings synchronize across devices.
                Navigation keeps the loaded workspace in memory while live
                updates arrive in the background.
              </p>
            </div>
            <div className="detail-list">
              {[
                [
                  "Keep the original booking",
                  "A conflicting new slot is rejected before the original appointment changes.",
                ],
                [
                  "Keep company data private",
                  "Only your verified account can access its workspace. Other visitors cannot read your records.",
                ],
                [
                  "Know what needs attention",
                  "Saving, offline and connection messages explain when changes are paused.",
                ],
              ].map(([title, copy]) => (
                <article key={title}>
                  <span>✓</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="pricing wrap" id="pricing">
          <div className="section-heading">
            <div className="eyebrow">ANNOUNCED BUSINESS PLANS</div>
            <h2>A month to find your flow.</h2>
            <p>
              Planned pricing: a 30-day trial, then monthly or annual billing.
              Checkout is not active.
            </p>
          </div>
          <div className="pricing-grid">
            {[
              ["monthly", "Monthly", "10", "month"],
              ["annual", "Annual", "100", "year"],
            ].map(([id, title, price, interval]) => (
              <article key={id}>
                <small>{title.toUpperCase()}</small>
                <h3>
                  US${price}
                  <span>/{interval}</span>
                </h3>
                <p>Announced pricing after the planned trial.</p>
                <a
                  className="button"
                  href={"/queueflow/billing.html?plan=" + id}
                >
                  View {title.toLowerCase()} plan ↗
                </a>
              </article>
            ))}
          </div>
          <p className="pricing-note">
            No trial or charge starts when you select a plan. Merchant approval,
            payment terms and subscription enforcement remain unfinished.
          </p>
        </section>
        <section className="faq wrap" id="questions">
          <div className="section-heading">
            <h2>Before you book.</h2>
          </div>
          <div className="faq-list">
            {questions.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="maker wrap">
          <div className="maker-icon">MH</div>
          <div>
            <div className="eyebrow">BUILT BY MUHAMMAD HADDI</div>
            <h2>
              Useful software.
              <br />
              Honest progress.
            </h2>
            <p>
              An independent project exploring clearer appointment and queue
              workflows.
            </p>
            <div className="maker-links">
              <a
                className="plain-link"
                href="https://github.com/mhaddi12/queueflow"
              >
                Explore the source ↗
              </a>
              <a className="plain-link" href="https://haddidev.xyz/">
                Meet the developer ↗
              </a>
            </div>
          </div>
        </section>
        <section className="closing wrap">
          <h2>Make time for people.</h2>
          <a
            className="button light"
            href="/queueflow/app.html?workspace=cloud"
          >
            Open your workspace ↗
          </a>
        </section>
      </main>
      <footer className="site-footer wrap">
        <b>queueflow</b>
        <p>An independent project by Muhammad Haddi.</p>
        <a href="/queueflow/app.html?workspace=cloud">Sign in ↗</a>
      </footer>
    </>
  );
}
