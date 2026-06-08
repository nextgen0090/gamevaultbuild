/**
 * Serves Unity WebGL static assets only.
 * /api, /adminPanel, /ws, /webhook bypass the Worker via Cloudflare Routes
 * and hit AWS nginx directly.
 */
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
