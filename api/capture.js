const { fetchCaptureFromPublicLink } = require("../lib/xhs");

const MAX_BODY_BYTES = 1024 * 1024;

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string" && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      throw createHttpError(400, "Invalid JSON payload.");
    }
  }

  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;
    if (totalBytes > MAX_BODY_BYTES) {
      throw createHttpError(413, "Request body is too large.");
    }
    chunks.push(buffer);
  }

  if (!chunks.length) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw createHttpError(400, "Invalid JSON payload.");
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Only POST /api/capture is supported." }));
    return;
  }

  try {
    const body = await readJsonBody(req);
    const input = typeof body.url === "string" ? body.url : "";
    if (!input.trim()) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(
        JSON.stringify({
          error: "Please paste one public Xiaohongshu or RedNote link first.",
        }),
      );
      return;
    }

    const payload = await fetchCaptureFromPublicLink(input);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(payload));
  } catch (error) {
    res.statusCode =
      error && typeof error === "object" && Number.isInteger(error.statusCode)
        ? error.statusCode
        : 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Capture failed. Please try again.",
      }),
    );
  }
};
