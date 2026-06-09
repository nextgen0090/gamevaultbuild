// gamevaultbuild Worker — hybrid routing (no user-facing subdomains)
//
//   https://gamevault222.com/             → Worker assets (Unity game)
//   https://gamevault222.com/adminPanel/  → AWS nginx → port 4000
//   https://gamevault222.com/api/         → AWS nginx → port 5036
//
// REQUIRED in Cloudflare dashboard:
//   Workers → gamevaultbuild → Settings → Compatibility flags
//   Add: global_fetch_strictly_public
//
// DNS: @ → Worker gamevaultbuild (proxied). No A record on @.
//
// 522 fix: fetch must NOT loop back to this Worker. We use resolveOverride
// to connect straight to AWS on port 80 (nginx handles routing).

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
      headers.set("X-Forwarded-Host", "gamevault222.com");
      headers.set("CF-Connecting-IP", request.headers.get("CF-Connecting-IP") || "");

      // HTTP to origin port 80 — nginx routes to 4000/5036. Avoids TLS loop on 443.
      const targetUrl = `http://gamevault222.com${url.pathname}${url.search}`;

      return fetch(
        new Request(targetUrl, {
          method: request.method,
          headers,
          body: request.body,
          redirect: "manual",
          cf: {
            resolveOverride: AWS_IP,
            cacheTtl: 0,
          },
        })
      );
    }

    return env.ASSETS.fetch(request);
  },
};
