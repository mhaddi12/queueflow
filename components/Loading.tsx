import type { View } from "../lib/workspace-store";

function Bone({ className = "" }: { className?: string }) {
  return <span className={"shimmer " + className} />;
}
function Panel({ rows = 4 }: { rows?: number }) {
  return (
    <section className="panel skeleton-panel">
      <div className="skeleton-panel-heading"><Bone className="sk-title" /><Bone className="sk-short" /></div>
      {Array.from({ length: rows }, (_, index) => (
        <div className="skeleton-row" key={index}>
          <Bone className="sk-avatar" />
          <div className="skeleton-copy"><Bone className="sk-line" /><Bone className="sk-short" /></div>
          <Bone className="sk-badge" />
        </div>
      ))}
    </section>
  );
}
export function ContentSkeleton({ view = "overview" }: { view?: View }) {
  return (
    <div aria-hidden="true" className="skeleton-content">
      {(view === "overview" || view === "queue") && (
        <div className="stats">{Array.from({ length: 4 }, (_, index) => (
          <section className="stat" key={index}><Bone className="sk-line" /><Bone className="sk-number" /><Bone className="sk-short" /></section>
        ))}</div>
      )}
      {view === "overview" ? <div className="dashboard-grid"><Panel rows={5} /><Panel rows={3} /></div>
        : view === "team" || view === "settings" ? <div className="settings-grid">{[0, 1, 2].map(index => <Panel key={index} rows={3} />)}</div>
          : <Panel rows={view === "appointments" ? 6 : 4} />}
    </div>
  );
}
export function PendingIndicator({ label = "Saving changes…" }: { label?: string }) {
  return <div className="pending-indicator" role="status"><span className="shimmer pending-track" aria-hidden="true" /><span>{label}</span></div>;
}
export default function WorkspaceSkeleton({ view = "overview" }: { view?: View }) {
  return (
    <div className="loading-shell" role="status" aria-label="Loading company workspace" aria-busy="true">
      <span className="sr-only">Loading company workspace…</span>
      <aside className="sidebar skeleton-sidebar" aria-hidden="true">
        <div className="brand"><span className="brandmark">q</span>queueflow</div>
        <div className="business"><Bone className="sk-avatar" /><div className="skeleton-copy"><Bone className="sk-line" /><Bone className="sk-short" /></div></div>
        <div className="skeleton-nav">{[0, 1, 2, 3, 4].map(index => <Bone className="sk-nav" key={index} />)}</div>
        <div className="sidebottom"><Bone className="sk-line" /></div>
      </aside>
      <div className="workspace">
        <header aria-hidden="true"><Bone className="sk-title" /><Bone className="sk-badge" /></header>
        <main>
          <div className="page-heading" aria-hidden="true"><div className="skeleton-heading"><Bone className="sk-short" /><Bone className="sk-heading" /><Bone className="sk-line" /></div><Bone className="sk-button" /></div>
          <ContentSkeleton view={view} />
        </main>
      </div>
    </div>
  );
}
