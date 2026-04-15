const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('rendered diagram SVG previews exist and contain svg markup', () => {
  const repoRoot = path.resolve(__dirname, '..');
  const userFlowSvg = path.join(repoRoot, 'docs', 'diagrams', 'user-flow.svg');
  const architectureSvg = path.join(repoRoot, 'docs', 'diagrams', 'architecture.svg');

  for (const file of [userFlowSvg, architectureSvg]) {
    assert.ok(fs.existsSync(file), `${path.basename(file)} should exist`);
    const content = fs.readFileSync(file, 'utf8');
    assert.match(content, /<svg[\s>]/);
    assert.match(content, /<rect/);
    assert.match(content, /<path/);
  }
});
