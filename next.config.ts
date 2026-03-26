import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@google/genai", "@google/generative-ai"],
};

export default nextConfig;
