/**
 * Serves Unity WebGL static assets only.
 * /api, /adminPanel, /ws, /webhook bypass the Worker via Cloudflare Routes
 * and hit AWS nginx directly.
 */

const BUILD_ALIASES = {
  "/build.wasm": "/Build/Builds.wasm.unityweb",
  "/build.data": "/Build/Builds.data.unityweb",
  "/build.framework.js": "/Build/Builds.framework.js.unityweb",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let path = url.pathname;

    const alias = BUILD_ALIASES[path.toLowerCase()];
    if (alias) {
      url.pathname = alias;
      request = new Request(url, request);
      path = alias;
    }

    const response = await env.ASSETS.fetch(request);

    if (path.endsWith(".unityweb")) {
      const headers = new Headers(response.headers);
      headers.set("Content-Encoding", "gzip");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  },
};
