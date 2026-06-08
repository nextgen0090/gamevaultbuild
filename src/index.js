export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Later you can enable these if needed:
    // if (url.pathname.startsWith("/api/")) {
    //   return fetch("https://YOUR_AWS_BACKEND_DOMAIN" + url.pathname + url.search, request);
    // }

    // if (url.pathname.startsWith("/ws/")) {
    //   return fetch("https://YOUR_AWS_BACKEND_DOMAIN" + url.pathname + url.search, request);
    // }

    return env.ASSETS.fetch(request);
  },
};