/**
 * Proxy /api, /ws, /webhook to AWS.
 * Workers cannot fetch bare IPs (Cloudflare error 1003).
 * Set ORIGIN_BASE_URL to your EC2 public DNS (no extra Cloudflare subdomain needed).
 * Example: http://ec2-54-91-135-167.compute-1.amazonaws.com
 */
const FALLBACK_ORIGIN = "http://54.91.135.167";

const BACKEND_PREFIXES = ["/api", "/ws", "/webhook"];

function isBackendPath(pathname) {
  const lower = pathname.toLowerCase();
  return BACKEND_PREFIXES.some((prefix) => lower.startsWith(prefix.toLowerCase()));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const originBase = (env.ORIGIN_BASE_URL || FALLBACK_ORIGIN).replace(/\/$/, "");

    if (isBackendPath(path)) {
      const targetUrl = new URL(originBase);
      targetUrl.pathname = path;
      targetUrl.search = url.search;

      const headers = new Headers(request.headers);
      headers.delete("host");
      headers.set("X-Forwarded-Host", url.host);
      headers.set("X-Forwarded-Proto", url.protocol.replace(":", ""));
      headers.set("X-Real-IP", request.headers.get("CF-Connecting-IP") || "");

      return fetch(targetUrl.toString(), {
        method: request.method,
        headers,
        body: request.method === "GET" || request.method === "HEAD" ? null : request.body,
        redirect: "manual",
      });
    }

    return env.ASSETS.fetch(request);
  },
};
