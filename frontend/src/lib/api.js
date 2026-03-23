/**
 * Backend mounts JSON routes under `/api` (backend: app.use("/api", apiRouter)).
 *
 * - If NEXT_PUBLIC_API_URL is set → use it (+ /api if missing).
 * - Else in the browser on localhost → http://localhost:5001/api (Next dev + Express local).
 * - Else in the browser (e.g. Vercel) → same origin /api (monorepo: front + API on one domain).
 * - Else (SSR without window) → http://localhost:5001/api.
 */
export function getApiBase() {
  const env = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    if (env) {
      const origin = env.replace(/\/+$/, "");
      const envHost = (() => {
        try {
          return new URL(origin).hostname;
        } catch {
          return "";
        }
      })();
      const envIsLocalhost = envHost === "localhost" || envHost === "127.0.0.1";
      const browserIsLocalhost = h === "localhost" || h === "127.0.0.1";
      // In production browsers, ignore localhost API env values to avoid broken deploys.
      if (envIsLocalhost && !browserIsLocalhost) {
        return `${window.location.origin.replace(/\/+$/, "")}/api`;
      }
      return origin.endsWith("/api") ? origin : `${origin}/api`;
    }
    if (h === "localhost" || h === "127.0.0.1") {
      return "http://localhost:5001/api";
    }
    return `${window.location.origin.replace(/\/+$/, "")}/api`;
  }
  if (env) {
    const origin = env.replace(/\/+$/, "");
    return origin.endsWith("/api") ? origin : `${origin}/api`;
  }
  return "http://localhost:5001/api";
}

/** True when requests use the default local Express URL (localhost:5001), not same-origin prod. */
export function isUsingDefaultLocalApi() {
  if (process.env.NEXT_PUBLIC_API_URL) return false;
  if (typeof window === "undefined") return true;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

const storageKeys = {
  access: "storeweb:v2:accessToken",
  refresh: "storeweb:v2:refreshToken",
  user: "storeweb:v2:user",
};

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(storageKeys.user);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredAuth({ user, accessToken, refreshToken }) {
  if (user) localStorage.setItem(storageKeys.user, JSON.stringify(user));
  if (accessToken) localStorage.setItem(storageKeys.access, accessToken);
  if (refreshToken) localStorage.setItem(storageKeys.refresh, refreshToken);
}

export function clearStoredAuth() {
  localStorage.removeItem(storageKeys.user);
  localStorage.removeItem(storageKeys.access);
  localStorage.removeItem(storageKeys.refresh);
}

function getAccessToken() {
  return localStorage.getItem(storageKeys.access);
}

function getRefreshToken() {
  return localStorage.getItem(storageKeys.refresh);
}

async function refreshTokens() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("no_refresh_token");
  const res = await fetch(`${getApiBase()}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error("refresh_failed");
  const data = await res.json();
  setStoredAuth({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.accessToken;
}

export async function api(path, options = {}) {
  const url = path.startsWith("http") ? path : `${getApiBase()}${path}`;
  const headers = new Headers(options.headers || {});
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");

  const attempt = async (accessTokenOverride) => {
    if (accessTokenOverride) headers.set("Authorization", `Bearer ${accessTokenOverride}`);
    const res = await fetch(url, { ...options, headers });
    return res;
  };

  let res = await attempt();
  if (res.status === 401 && getRefreshToken()) {
    try {
      const newAccess = await refreshTokens();
      res = await attempt(newAccess);
    } catch {
      // fallthrough
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(text || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

