import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const diagramsDir = path.join(repoRoot, 'docs', 'diagrams');

const files = [
  { input: 'user-flow.drawio', output: 'user-flow.svg', title: 'User flow' },
  { input: 'architecture.drawio', output: 'architecture.svg', title: 'Architecture' },
];

function decodeXml(value = '') {
  return value
    .replace(/&#xa;/g, '\n')
    .replace(/&#10;/g, '\n')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function escapeXml(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseStyle(rawStyle = '') {
  const style = {};
  for (const part of rawStyle.split(';')) {
    if (!part || !part.includes('=')) continue;
    const [key, value] = part.split('=');
    style[key] = value;
  }
  return style;
}

function wrapLine(line, maxChars) {
  if (!line || line.length <= maxChars) return [line];
  const words = line.split(' ');
  if (words.length === 1) {
    const chunks = [];
    for (let i = 0; i < line.length; i += maxChars) {
      chunks.push(line.slice(i, i + maxChars));
    }
    return chunks;
  }

  const wrapped = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }
    if (current) wrapped.push(current);
    current = word;
  }
  if (current) wrapped.push(current);
  return wrapped;
}

function buildTextLines(text, width, fontSize) {
  const avgChar = Math.max(fontSize * 0.58, 7);
  const maxChars = Math.max(Math.floor((width - 26) / avgChar), 8);
  return decodeXml(text)
    .split('\n')
    .flatMap((line) => wrapLine(line, maxChars));
}

function parseVertices(xml) {
  const vertices = [];
  const regex =
    /<mxCell id="([^"]+)" value="([\s\S]*?)" style="([^"]*?)" vertex="1" parent="1">\s*<mxGeometry x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)" as="geometry"\/>\s*<\/mxCell>/g;

  let match;
  while ((match = regex.exec(xml))) {
    const [, id, value, rawStyle, x, y, width, height] = match;
    vertices.push({
      id,
      value,
      style: parseStyle(rawStyle),
      x: Number(x),
      y: Number(y),
      width: Number(width),
      height: Number(height),
    });
  }
  return vertices;
}

function parseEdges(xml) {
  const edges = [];
  const regex =
    /<mxCell id="([^"]+)" edge="1" parent="1" source="([^"]+)" target="([^"]+)" style="([^"]*?)">\s*<mxGeometry relative="1" as="geometry"\/>\s*<\/mxCell>/g;

  let match;
  while ((match = regex.exec(xml))) {
    const [, id, source, target, rawStyle] = match;
    edges.push({ id, source, target, style: parseStyle(rawStyle) });
  }
  return edges;
}

function edgePoints(source, target) {
  const sourceCenter = {
    x: source.x + source.width / 2,
    y: source.y + source.height / 2,
  };
  const targetCenter = {
    x: target.x + target.width / 2,
    y: target.y + target.height / 2,
  };
  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  if (Math.abs(dx) >= Math.abs(dy)) {
    const start = {
      x: dx >= 0 ? source.x + source.width : source.x,
      y: sourceCenter.y,
    };
    const end = {
      x: dx >= 0 ? target.x : target.x + target.width,
      y: targetCenter.y,
    };
    const midX = (start.x + end.x) / 2;
    return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
  }

  const start = {
    x: sourceCenter.x,
    y: dy >= 0 ? source.y + source.height : source.y,
  };
  const end = {
    x: targetCenter.x,
    y: dy >= 0 ? target.y : target.y + target.height,
  };
  const midY = (start.y + end.y) / 2;
  return `M ${start.x} ${start.y} L ${start.x} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y}`;
}

function renderVertex(vertex) {
  const fill = vertex.style.fillColor || '#ffffff';
  const stroke = vertex.style.strokeColor || '#d9dce2';
  const fontColor = vertex.style.fontColor || '#1f2329';
  const fontSize = Number(vertex.style.fontSize || 14);
  const fontWeight = vertex.style.fontStyle === '1' ? 700 : 600;
  const rx = vertex.style.rounded === '1' ? 18 : 8;
  const lines = buildTextLines(vertex.value, vertex.width, fontSize);
  const lineHeight = fontSize * 1.35;
  const totalHeight = lines.length * lineHeight;
  const startY = vertex.y + vertex.height / 2 - totalHeight / 2 + fontSize * 0.8;
  const text = lines
    .map((line, index) => {
      const y = startY + index * lineHeight;
      return `<tspan x="${vertex.x + vertex.width / 2}" y="${y}">${escapeXml(line)}</tspan>`;
    })
    .join('');

  return `
    <g>
      <rect x="${vertex.x}" y="${vertex.y}" width="${vertex.width}" height="${vertex.height}" rx="${rx}" ry="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <text text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" fill="${fontColor}">${text}</text>
    </g>`;
}

function renderEdge(edge, verticesById) {
  const source = verticesById.get(edge.source);
  const target = verticesById.get(edge.target);
  if (!source || !target) return '';
  const stroke = edge.style.strokeColor || '#ff8ca0';
  return `<path d="${edgePoints(source, target)}" fill="none" stroke="${stroke}" stroke-width="3" marker-end="url(#arrow)"/>`;
}

function buildSvg(title, xml) {
  const vertices = parseVertices(xml);
  const edges = parseEdges(xml);
  const verticesById = new Map(vertices.map((vertex) => [vertex.id, vertex]));
  const maxX = Math.max(...vertices.map((vertex) => vertex.x + vertex.width), 0) + 60;
  const maxY = Math.max(...vertices.map((vertex) => vertex.y + vertex.height), 0) + 80;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${maxX}" height="${maxY}" viewBox="0 0 ${maxX} ${maxY}" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffaf7"/>
      <stop offset="100%" stop-color="#fff1f4"/>
    </linearGradient>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#ff8ca0"/>
    </marker>
  </defs>
  <rect width="${maxX}" height="${maxY}" rx="28" ry="28" fill="url(#bg)"/>
  <text x="40" y="56" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif" font-size="28" font-weight="700" fill="#1f2329">${escapeXml(title)}</text>
  ${edges.map((edge) => renderEdge(edge, verticesById)).join('\n')}
  ${vertices.map((vertex) => renderVertex(vertex)).join('\n')}
</svg>`;
}

async function main() {
  for (const file of files) {
    const inputPath = path.join(diagramsDir, file.input);
    const outputPath = path.join(diagramsDir, file.output);
    const xml = await fs.readFile(inputPath, 'utf8');
    const svg = buildSvg(file.title, xml);
    await fs.writeFile(outputPath, svg, 'utf8');
  }
}

await main();
