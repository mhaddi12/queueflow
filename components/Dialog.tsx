"use client";
import { PendingIndicator } from "./Loading";
import { useEffect, useId, useRef, type ReactNode } from "react";
export default function Dialog({
  title,
  children,
  close,
  busy = false,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
  busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    titleId = useId();
  useEffect(() => {
    const dialog = ref.current!,
      scroll = window.scrollY,
      oldStyle = document.body.getAttribute("style") || "";
    document.body.style.position = "fixed";
    document.body.style.top = "-" + scroll + "px";
    document.body.style.width = "100%";
    document.documentElement.classList.add("viewport-locked");
    dialog.showModal();
    dialog.scrollTop = 0;
    return () => {
      dialog.close();
      document.body.setAttribute("style", oldStyle);
      document.documentElement.classList.remove("viewport-locked");
      window.scrollTo(0, scroll);
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) close();
      }}
    >
      <div className="modal-head">
        <h2 id={titleId}>{title}</h2>
        <button
          type="button"
          className="close"
          aria-label="Close dialog"
          disabled={busy}
          onClick={close}
        >
          ×
        </button>
      </div>
      {busy && <PendingIndicator label="Please wait…" />}
      {children}
    </dialog>
  );
}
