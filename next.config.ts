import type { NextConfig } from "next";
const config: NextConfig = {
  output: "export",
  basePath: "/queueflow",
  images: { unoptimized: true },
  trailingSlash: false,
};
export default config;
