export const BASE_API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export const WS_URL =
  import.meta.env.VITE_WS_URL || "ws://localhost:3000";

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ??
  "960225258387-5p5rlg0fcc95cmdk0l5jj9hm394apio0.apps.googleusercontent.com";

// 🔥 ЕДИНЫЙ ФЛАГ
export const USE_MOCK =
  import.meta.env.VITE_USE_MOCK === "true";