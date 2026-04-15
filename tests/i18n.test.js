const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { getMessages, resolveLocale } = require("../lib/i18n");

test("resolveLocale supports zh and en with sensible fallback", () => {
  assert.equal(resolveLocale("zh-CN"), "zh");
  assert.equal(resolveLocale("en-US"), "en");
  assert.equal(resolveLocale("fr-CA"), "zh");
  assert.equal(resolveLocale(undefined), "zh");
});

test("getMessages returns product-ready English copy", () => {
  const copy = getMessages("en");

  assert.equal(copy.heroEyebrow, "RedNote Saver");
  assert.equal(copy.captureButton, "Fetch now");
  assert.equal(copy.saveAllButton, "Save all images");
  assert.equal(copy.sourceLink, "Open original");
  assert.match(copy.heroCopy, /public RedNote posts/i);
  assert.match(copy.heroCopy, /Xiaohongshu/i);
  assert.match(copy.statusIdle, /refresh to start over/i);
});

test("index includes a top language switcher", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

  assert.match(html, /id="languageSwitch"/);
  assert.match(html, /data-lang="zh"/);
  assert.match(html, /data-lang="en"/);
});
