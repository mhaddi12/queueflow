import type { Metadata } from "next";
import Billing from "../../components/Billing";
export const metadata: Metadata = {
  title: "Business subscription",
  robots: { index: false, follow: true },
};
export default function Page() {
  return (
    <>
      <link rel="stylesheet" href="/queueflow/landing.css" />
      <Billing />
    </>
  );
}
