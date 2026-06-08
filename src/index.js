const AWS_ORIGIN = "http://origin.gamevault222.com";

function shouldSendToAws(pathname) {
  return (
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname === "/ws" ||
    pathname.startsWith("/ws/") ||
    pathname === "/webhook" ||
    pathname.startsWith("/webhook/") ||
    pathname === "/adminPanel" ||
    pathname.startsWith("/adminPanel/") ||
    pathname === "/adminpanel" ||
    pathname.startsWith("/adminpanel/")
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (shouldSendToAws(url.pathname)) {
      const targetUrl = new URL(url.pathname + url.search, AWS_ORIGIN);
      return fetch(
        new Request(targetUrl.toString(), {
          method: request.method,
          headers: request.headers,
          body: request.body,
          redirect: "manual",
        })
      );
    }
    return env.ASSETS.fetch(request);
  },
};
