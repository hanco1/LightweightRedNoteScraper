const test = require("node:test");
const assert = require("node:assert/strict");
const { Readable } = require("node:stream");

const handler = require("../api/media");

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

test("media handler supports HEAD requests without streaming a body", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () =>
    new Response("demo", {
      status: 200,
      headers: {
        "content-type": "image/webp",
        "content-length": "4",
        etag: "abc",
      },
    });

  try {
    const req = new Readable({ read() {} });
    req.method = "HEAD";
    req.url = "/api/media?url=https%3A%2F%2Fsns-webpic-qc.xhscdn.com%2Fdemo.webp";
    req.headers = {};

    const res = createMockResponse();
    await handler(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.headers.get("Content-Type"), "image/webp");
    assert.equal(res.body, "");
  } finally {
    global.fetch = originalFetch;
  }
});
