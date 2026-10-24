import type { Metadata } from "next";
import Workspace from "../../components/Workspace";
export const metadata: Metadata = {
  title: "Private workspace",
  robots: { index: false, follow: true },
};
export default function Page() {
  return (
    <>
      <link rel="stylesheet" href="/queueflow/style.css" />
      <Workspace />
    </>
  );
}
