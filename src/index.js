const R2_PREFIXES = ["/Build/", "/StreamingAssets/"];

function contentTypeFor(key) {
  if (/\.framework\.js\.unityweb$/i.test(key) || /\.js$/i.test(key)) {
    return "application/javascript";
  }
  if (/\.wasm\.unityweb$/i.test(key)) return "application/wasm";
  if (/\.json(\.unityweb)?$/i.test(key)) return "application/json";
  return "application/octet-stream";
}

function applyAssetHeaders(headers, obj, key) {
  if (typeof obj.writeHttpMetadata === "function") obj.writeHttpMetadata(headers);
  if (!headers.get("Content-Type")) headers.set("Content-Type", contentTypeFor(key));
  if (!headers.get("Content-Encoding") && /\.unityweb$/i.test(key)) {
    headers.set("Content-Encoding", "gzip");
  }
  if (!headers.get("Cache-Control")) {
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("X-Content-Type-Options", "nosniff");
  if (typeof obj.size === "number") headers.set("Content-Length", String(obj.size));
  if (obj.httpEtag) headers.set("ETag", obj.httpEtag);
}

async function serveLargeAsset(request, env, key) {
  const bucket = env.GAME_ASSETS;
  if (!bucket) return null;

  const method = request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") return null;

  const obj = method === "HEAD" ? await bucket.head(key) : await bucket.get(key);
  if (!obj) return null;

  const headers = new Headers();
  applyAssetHeaders(headers, obj, key);
  const encoded = headers.has("Content-Encoding");

  return new Response(method === "HEAD" ? null : obj.body, {
    status: 200,
    headers,
    encodeBody: encoded ? "manual" : "automatic",
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (R2_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
      const fromR2 = await serveLargeAsset(request, env, url.pathname.slice(1));
      if (fromR2) return fromR2;
    }
    return env.ASSETS.fetch(request);
  },
};
