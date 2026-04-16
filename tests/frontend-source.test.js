const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");
}

test("app.js relies on shared i18n instead of embedding a fallback catalog", () => {
  const source = readRepoFile("app.js");

  assert.doesNotMatch(source, /window\.AppI18n\s*\|\|\s*\{/);
  assert.doesNotMatch(source, /pageTitle:\s*"/);
});

test("top-level frontend source files avoid literal CJK text", () => {
  for (const file of ["app.js", "index.html", "lib/i18n.js"]) {
    const source = readRepoFile(file);
    assert.doesNotMatch(source, /[\u4e00-\u9fff]/, `${file} should stay English-only at source level`);
  }
});
