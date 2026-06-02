const AWS_ORIGIN = "http://54.91.135.167";

const BACKEND_PREFIXES = ["/api", "/ws", "/webhook", "/adminPanel"];

function isBackendPath(pathname) {
  const lower = pathname.toLowerCase();
  return BACKEND_PREFIXES.some((prefix) => lower.startsWith(prefix.toLowerCase()));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (isBackendPath(path)) {
      const targetUrl = new URL(AWS_ORIGIN);
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
