import type { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = {
  metadataBase: new URL("https://mhaddi12.github.io/queueflow/"),
  title: {
    default: "QueueFlow — Appointment and Queue Manager",
    template: "%s | QueueFlow",
  },
  description:
    "Explore QueueFlow, an appointment and queue management preview by Muhammad Haddi. Organize bookings, check-ins and service workflows.",
  verification: { google: "nPCJDnUVX0XKUCYtDX-aHson58DntpXWJF0Mym0f8eg" },
  icons: { icon: "/queueflow/icon.svg" },
  openGraph: {
    type: "website",
    siteName: "QueueFlow",
    title: "QueueFlow — Make time for people",
    description:
      "Appointment scheduling and queue management in one focused workspace.",
    images: [
      {
        url: "https://mhaddi12.github.io/queueflow/social-card.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QueueFlow — Make time for people",
    description: "Explore an appointment and queue management preview.",
    images: ["https://mhaddi12.github.io/queueflow/social-card.png"],
  },
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#163e32" />
      </head>
      <body>{children}</body>
    </html>
  );
}
