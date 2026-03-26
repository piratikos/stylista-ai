import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@google/genai", "@google/generative-ai"],
};

export default nextConfig;
