/**
 * Serves Unity WebGL static assets only.
 * /api, /adminPanel, /ws, /webhook bypass the Worker via Cloudflare Routes
 * and hit AWS nginx directly.
 */
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const path = new URL(request.url).pathname;
    // Unity .unityweb files are gzip-compressed; header enables faster startup.
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
