const { REQUEST_HEADERS, validateProxyTarget } = require("../lib/xhs");

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Only GET/HEAD /api/media is supported." }));
    return;
  }

  const searchURL = new URL(req.url, "http://localhost");
  const target = validateProxyTarget(req.query?.url || searchURL.searchParams.get("url"));
  if (!target) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Unsupported media target." }));
    return;
  }

  const upstreamHeaders = { ...REQUEST_HEADERS };
  if (req.headers?.range) {
    upstreamHeaders.range = req.headers.range;
  }

  const upstream = await fetch(target, {
    method: "GET",
    headers: upstreamHeaders,
    redirect: "follow",
  });

  if (!upstream.ok || !upstream.body) {
    res.statusCode = upstream.status || 502;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Media request failed." }));
    return;
  }

  res.statusCode = upstream.status || 200;
  const passthroughHeaders = [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
    "etag",
    "last-modified",
  ];
  for (const headerName of passthroughHeaders) {
    const value = upstream.headers.get(headerName);
    if (value) {
      res.setHeader(
        headerName
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("-"),
        value,
      );
    }
  }
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  const reader = upstream.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    res.write(Buffer.from(value));
  }
  res.end();
};
