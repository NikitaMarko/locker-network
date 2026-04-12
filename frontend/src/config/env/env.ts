export const SERVER_URL = import.meta.env.VITE_API_URL_CLOUDFRONT ?? import.meta.env.VITE_API_URL_BACKEND;
export const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();