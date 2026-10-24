import { mkdir, copyFile } from "node:fs/promises";
await mkdir("public", { recursive: true });
for (const file of [
  "style.css",
  "landing.css",
  "icon.svg",
  "social-card.png",
  ".nojekyll",
])
  await copyFile("dist/" + file, "public/" + file);
