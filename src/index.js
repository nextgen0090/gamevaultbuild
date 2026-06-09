// gamevaultbuild Worker — hybrid routing (no subdomains)
//
//   https://gamevault222.com/             → Cloudflare Worker assets (Unity game)
//   https://gamevault222.com/adminPanel/  → AWS nginx → port 4000
//   https://gamevault222.com/api/         → AWS nginx → port 5036
//   https://gamevault222.com/ws/          → AWS nginx → port 5036
//   https://gamevault222.com/webhook/     → AWS nginx → port 5036
//
// DNS required:
//   @ → Worker gamevaultbuild (proxied)   — NOT an A record to AWS
//
// Uses cf.resolveOverride to reach AWS by IP without api.* or origin.* subdomains.
// Do NOT use http://54.91.135.167 as the fetch URL host — that causes error 1003.

const AWS_IP = "54.91.135.167";

function shouldProxyToAws(pathname) {
  return (
    pathname === "/adminPanel" ||
    pathname.startsWith("/adminPanel/") ||
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname === "/ws" ||
    pathname.startsWith("/ws/") ||
    pathname === "/webhook" ||
    pathname.startsWith("/webhook/")
  );
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (shouldProxyToAws(url.pathname)) {
      const headers = new Headers(request.headers);
      headers.set("Host", "gamevault222.com");
      headers.set("X-Forwarded-Proto", "https");

      const targetUrl = `https://gamevault222.com${url.pathname}${url.search}`;

      return fetch(
        new Request(targetUrl, {
          method: request.method,
          headers,
          body: request.body,
          redirect: "manual",
          cf: { resolveOverride: AWS_IP },
        })
      );
    }

    return env.ASSETS.fetch(request);
  },
};
