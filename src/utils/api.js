// Central place for the backend's base URL.
// Locally this falls back to http://localhost:5000.
// In production, set VITE_API_URL in your hosting provider's
// environment variables to your deployed backend's URL
// (e.g. https://your-backend.onrender.com) — no trailing slash.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";
