const test = require("node:test");
const assert = require("node:assert/strict");
const { Readable } = require("node:stream");

const handler = require("../api/capture");

function createMockResponse() {
  const headers = new Map();
  const chunks = [];
  return {
    statusCode: 200,
    setHeader(name, value) {
      headers.set(name, value);
    },
    write(chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    },
    end(chunk) {
      if (chunk) {
        this.write(chunk);
      }
      this.ended = true;
    },
    get body() {
      return Buffer.concat(chunks).toString("utf8");
    },
    get headers() {
      return headers;
    },
  };
}

function createJsonRequest(body) {
  return Readable.from([body], {
    objectMode: false,
  });
}

test("capture handler returns 400 for malformed JSON", async () => {
  const req = createJsonRequest('{"url": ');
  req.method = "POST";
  req.headers = {};

  const res = createMockResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.body, /invalid json/i);
});

test("capture handler returns 413 for oversized payloads", async () => {
  const oversized = JSON.stringify({ url: `https://example.com/${"a".repeat(1024 * 1024 + 32)}` });
  const req = createJsonRequest(oversized);
  req.method = "POST";
  req.headers = {};

  const res = createMockResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 413);
  assert.match(res.body, /too large/i);
});
