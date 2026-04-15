import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

import captureHandler from "./api/capture.js";
import mediaHandler from "./api/media.js";

const rootDir = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)));
const port = Number(process.env.PORT || 3015);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function serveFile(filePath, res) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.statusCode = 404;
    res.end("Not found");
    return;
  }

  const ext = path.extname(filePath);
  res.statusCode = 200;
  res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  req.query = Object.fromEntries(parsedUrl.searchParams.entries());

  if (parsedUrl.pathname === "/api/capture") {
    await captureHandler(req, res);
    return;
  }

  if (parsedUrl.pathname === "/api/media") {
    await mediaHandler(req, res);
    return;
  }

  if (parsedUrl.pathname === "/iphone") {
    serveFile(path.join(rootDir, "iphone", "index.html"), res);
    return;
  }

  const targetPath =
    parsedUrl.pathname === "/"
      ? path.join(rootDir, "index.html")
      : path.join(rootDir, decodeURIComponent(parsedUrl.pathname.slice(1)));

  serveFile(targetPath, res);
});

server.listen(port, () => {
  console.log(`Vercel iPhone MVP running at http://127.0.0.1:${port}`);
});
