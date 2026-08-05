import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Expose assistant model names to client picker while keeping server helpers on AI_ASSISTANT_* env.
  env: {
    NEXT_PUBLIC_AI_ASSISTANT_DEFAULT_MODEL:
      process.env.AI_ASSISTANT_DEFAULT_MODEL || process.env.NEXT_PUBLIC_AI_ASSISTANT_DEFAULT_MODEL,
    NEXT_PUBLIC_AI_ASSISTANT_SEARCH_MODEL:
      process.env.AI_ASSISTANT_SEARCH_MODEL || process.env.NEXT_PUBLIC_AI_ASSISTANT_SEARCH_MODEL,
    NEXT_PUBLIC_AI_ASSISTANT_ALLOWED_MODELS:
      process.env.AI_ASSISTANT_ALLOWED_MODELS || process.env.NEXT_PUBLIC_AI_ASSISTANT_ALLOWED_MODELS,
  },
};

export default nextConfig;
