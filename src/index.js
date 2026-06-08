const API_ORIGIN = "https://api.gamevault222.com";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (
      path.startsWith("/api") ||
      path.startsWith("/ws") ||
      path.startsWith("/webhook") ||
      path.startsWith("/adminPanel") ||
      path.toLowerCase().startsWith("/adminpanel")
    ) {
      const target = API_ORIGIN + path + url.search;
      return fetch(new Request(target, request));
    }
    return env.ASSETS.fetch(request);
  },
};
