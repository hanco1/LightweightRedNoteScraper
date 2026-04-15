const vm = require("node:vm");

const URL_PATTERN = /https?:\/\/[^\s<>"']+/g;
const CLOSED_TAG_PATTERN = /#([^#\r\n]*?\S)#/g;
const LOOSE_TAG_PATTERN = /#([^\s#][^\s#\r\n]*)/g;
const XHS_ALLOWED_HOSTS = [/(\.|^)xiaohongshu\.com$/i, /(\.|^)xhscdn\.com$/i];
const REQUEST_HEADERS = {
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
  referer: "https://www.xiaohongshu.com/explore",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
};

function normalizeAssetUrl(rawUrl) {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    return "";
  }

  try {
    const parsed = new URL(rawUrl.trim());
    if (
      parsed.protocol === "http:" &&
      XHS_ALLOWED_HOSTS.some((pattern) => pattern.test(parsed.hostname))
    ) {
      parsed.protocol = "https:";
      return parsed.toString();
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function extractPublicUrl(input) {
  const raw = String(input || "");
  const matches = raw.match(URL_PATTERN) || [];
  for (const match of matches) {
    const cleaned = match.replace(/[.,;:!?)'"]+$/g, "");
    try {
      const parsed = new URL(cleaned);
      if (
        /(^|\.)xiaohongshu\.com$/i.test(parsed.hostname) ||
        /(^|\.)xhslink\.com$/i.test(parsed.hostname)
      ) {
        return cleaned;
      }
    } catch {
      // ignore malformed URLs
    }
  }

  throw new Error("No public Xiaohongshu or RedNote link was found in the input.");
}

function extractStateBlob(html) {
  const source = String(html || "");
  const needle = "window.__INITIAL_STATE__=";
  const start = source.lastIndexOf(needle);
  if (start < 0) {
    throw new Error("Could not find note state data on the public page.");
  }

  const from = start + needle.length;
  const end = source.indexOf("</script>", from);
  if (end < 0) {
    throw new Error("The note state payload is incomplete.");
  }

  return source.slice(from, end).trim().replace(/;\s*$/, "");
}

function parseInitialState(blob) {
  const normalized = String(blob || "")
    .replace(/:\s*undefined\b/g, ":null")
    .replace(/:\s*NaN\b/g, ":null")
    .replace(/:\s*Infinity\b/g, ":null");

  try {
    return vm.runInNewContext(`(${normalized})`, Object.create(null), {
      timeout: 1000,
    });
  } catch (error) {
    throw new Error(`Failed to parse note state: ${error.message}`);
  }
}

function deepGet(target, path) {
  let current = target;
  for (const key of path) {
    if (current == null) {
      return undefined;
    }
    current = current[key];
  }
  return current;
}

function resolveNote(state) {
  const phone = deepGet(state, ["noteData", "data", "noteData"]);
  if (phone && typeof phone === "object") {
    return phone;
  }

  const detailMap = deepGet(state, ["note", "noteDetailMap"]);
  if (detailMap && typeof detailMap === "object") {
    const first = Object.values(detailMap)[0];
    if (first && typeof first === "object" && first.note) {
      return first.note;
    }
  }

  throw new Error("Could not find note details on the public page.");
}

function normalizeTagLabel(rawTag) {
  const cleaned = String(rawTag || "")
    .trim()
    .replace(/^#+|#+$/g, "")
    .replace(/\[\u8bdd\u9898\]$/u, "");
  return cleaned ? `#${cleaned}` : "";
}

function normalizeDescription(value) {
  const lines = String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim());

  const compact = [];
  let lastBlank = true;
  for (const line of lines) {
    if (!line) {
      if (!lastBlank) {
        compact.push("");
      }
      lastBlank = true;
      continue;
    }
    compact.push(line);
    lastBlank = false;
  }

  while (compact.length && compact[compact.length - 1] === "") {
    compact.pop();
  }

  return compact.join("\n");
}

function uniqueTags(values) {
  const seen = new Set();
  const tags = [];
  for (const value of values) {
    const tag = normalizeTagLabel(value);
    if (!tag) {
      continue;
    }
    const lower = tag.toLowerCase();
    if (seen.has(lower)) {
      continue;
    }
    seen.add(lower);
    tags.push(tag);
  }
  return tags;
}

function splitDescriptionAndTags(description, tagList = []) {
  const source = String(description || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const closedTags = [...source.matchAll(CLOSED_TAG_PATTERN)].map((match) =>
    normalizeTagLabel(match[1]),
  );
  const withoutClosed = source.replace(CLOSED_TAG_PATTERN, " ");
  const looseTags = [...withoutClosed.matchAll(LOOSE_TAG_PATTERN)].map((match) =>
    normalizeTagLabel(match[1]),
  );
  const stripped = withoutClosed.replace(LOOSE_TAG_PATTERN, " ");
  const tagsFromList = Array.isArray(tagList)
    ? tagList.map((item) => (item && typeof item === "object" ? item.name : item))
    : [];

  return {
    description: normalizeDescription(stripped),
    tags: uniqueTags([...tagsFromList, ...closedTags, ...looseTags]),
  };
}

function normalizeCount(value) {
  if (value == null || value === "") {
    return null;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
}

function resolveDisplayTitle(title, description, fallback) {
  const preferred = String(title || "").trim();
  if (preferred) {
    return preferred;
  }

  const lines = normalizeDescription(description)
    .split("\n")
    .map((line) => line.replace(/^#+/g, "").trim())
    .filter(Boolean);

  return lines[0] || String(fallback || "").trim() || "Untitled post";
}

function selectImageUrl(image) {
  if (!image || typeof image !== "object") {
    return "";
  }

  const infoList = Array.isArray(image.infoList) ? image.infoList : [];
  const preferredInfo = infoList.find((item) => item?.imageScene === "WB_DFT");
  return normalizeAssetUrl(
    firstNonEmpty(
      image.urlDefault,
      image.url,
      preferredInfo?.url,
      infoList[0]?.url,
      image.urlPre,
    ),
  );
}

function selectImagePreviewUrl(image) {
  if (!image || typeof image !== "object") {
    return "";
  }

  const infoList = Array.isArray(image.infoList) ? image.infoList : [];
  const previewInfo = infoList.find((item) => item?.imageScene === "WB_PRV");
  return normalizeAssetUrl(
    firstNonEmpty(
      image.urlPre,
      previewInfo?.url,
      image.urlDefault,
      image.url,
      infoList[0]?.url,
    ),
  );
}

function selectImageDownloadUrl(image) {
  if (!image || typeof image !== "object") {
    return "";
  }

  const infoList = Array.isArray(image.infoList) ? image.infoList : [];
  const defaultInfo = infoList.find((item) => item?.imageScene === "WB_DFT");
  return normalizeAssetUrl(
    firstNonEmpty(
      image.urlDefault,
      defaultInfo?.url,
      image.url,
      image.urlPre,
      infoList[0]?.url,
    ),
  );
}

function selectImageFallbackUrls(image) {
  if (!image || typeof image !== "object") {
    return [];
  }

  const infoList = Array.isArray(image.infoList) ? image.infoList : [];
  const candidates = [
    image.urlDefault,
    image.url,
    image.urlPre,
    infoList[0]?.url,
    ...infoList.map((item) => item?.url),
  ]
    .map((item) => normalizeAssetUrl(item))
    .filter(Boolean);

  return [...new Set(candidates)];
}

function pickStreamUrl(streamGroup) {
  if (!Array.isArray(streamGroup) || streamGroup.length === 0) {
    return "";
  }

  const sorted = [...streamGroup].sort((left, right) => {
    const leftDefault = Number(left?.defaultStream || 0);
    const rightDefault = Number(right?.defaultStream || 0);
    if (leftDefault !== rightDefault) {
      return rightDefault - leftDefault;
    }

    const leftHeight = Number(left?.height || 0);
    const rightHeight = Number(right?.height || 0);
    return rightHeight - leftHeight;
  });

  const chosen = sorted[0] || {};
  return firstNonEmpty(chosen.masterUrl, chosen.backupUrls?.[0]);
}

function selectLivePhotoMotionUrl(image) {
  if (!image?.livePhoto) {
    return "";
  }

  const stream = image.stream || {};
  return normalizeAssetUrl(
    firstNonEmpty(
      pickStreamUrl(stream.h264),
      pickStreamUrl(stream.h265),
      pickStreamUrl(stream.h266),
      pickStreamUrl(stream.av1),
    ),
  );
}

function selectVideoUrl(note) {
  const consumerKey = firstNonEmpty(note?.video?.consumer?.originVideoKey);
  if (consumerKey) {
    return normalizeAssetUrl(
      consumerKey.startsWith("http")
        ? consumerKey
        : `https://sns-video-bd.xhscdn.com/${consumerKey}`,
    );
  }

  const stream = note?.video?.media?.stream || {};
  return normalizeAssetUrl(
    firstNonEmpty(
      pickStreamUrl(stream.h264),
      pickStreamUrl(stream.h265),
      pickStreamUrl(stream.h266),
      pickStreamUrl(stream.av1),
    ),
  );
}

function buildMediaProxyPath(targetUrl) {
  return `/api/media?url=${encodeURIComponent(targetUrl)}`;
}

function buildMediaItem({
  index,
  kind,
  previewUrl,
  downloadUrl,
  previewFallbackUrls = [],
  isLivePhoto = false,
  motionUrl = "",
  width = null,
  height = null,
}) {
  return {
    id: `${kind}-${index}`,
    index,
    kind,
    isLivePhoto,
    previewUrl: buildMediaProxyPath(previewUrl),
    downloadUrl: buildMediaProxyPath(downloadUrl),
    previewFallbackUrls: previewFallbackUrls.map((url) => buildMediaProxyPath(url)),
    motionUrl: motionUrl ? buildMediaProxyPath(motionUrl) : null,
    width,
    height,
  };
}

function normalizeCapturePayload({ inputUrl, resolvedUrl, state }) {
  const note = resolveNote(state);
  const { description, tags } = splitDescriptionAndTags(note.desc, note.tagList);
  const title = resolveDisplayTitle(note.title, note.desc, note.noteId);
  const authorName = firstNonEmpty(note.user?.nickname, note.user?.nickName, "Unknown author");
  const timestamp = Number(note.time || 0);
  const publishedAt =
    Number.isFinite(timestamp) && timestamp > 0 ? new Date(timestamp).toISOString() : null;
  const ipLocation = firstNonEmpty(note.ipLocation, note.ipAddress, note.user?.ipLocation) || null;

  const interactions = {
    likeCount: normalizeCount(note.interactInfo?.likedCount),
    collectedCount: normalizeCount(note.interactInfo?.collectedCount),
    commentCount: normalizeCount(note.interactInfo?.commentCount),
    shareCount: normalizeCount(note.interactInfo?.sharedCount ?? note.interactInfo?.shareCount),
  };

  let media = [];
  if (note.type === "video") {
    const videoUrl = selectVideoUrl(note);
    if (videoUrl) {
      media = [
        buildMediaItem({
          index: 1,
          kind: "video",
          previewUrl: videoUrl,
          downloadUrl: videoUrl,
          width: note.video?.media?.stream?.h264?.[0]?.width ?? null,
          height: note.video?.media?.stream?.h264?.[0]?.height ?? null,
        }),
      ];
    }
  } else {
    media = (Array.isArray(note.imageList) ? note.imageList : [])
      .map((image, index) => {
        const previewUrl = selectImagePreviewUrl(image);
        const downloadUrl = selectImageDownloadUrl(image);
        if (!previewUrl || !downloadUrl) {
          return null;
        }

        return buildMediaItem({
          index: index + 1,
          kind: "image",
          previewUrl,
          downloadUrl,
          previewFallbackUrls: selectImageFallbackUrls(image).filter((url) => url !== previewUrl),
          isLivePhoto: Boolean(image.livePhoto),
          motionUrl: selectLivePhotoMotionUrl(image),
          width: image.width ?? null,
          height: image.height ?? null,
        });
      })
      .filter(Boolean);
  }

  return {
    title,
    description,
    tags,
    author: {
      id: firstNonEmpty(note.user?.userId),
      name: authorName,
    },
    publishedAt,
    ipLocation,
    interactions,
    sourceUrl: firstNonEmpty(resolvedUrl, inputUrl),
    feedId: firstNonEmpty(note.noteId),
    noteType: firstNonEmpty(note.type),
    media,
  };
}

async function fetchCaptureFromPublicLink(rawInput) {
  const inputUrl = extractPublicUrl(rawInput);
  const response = await fetch(inputUrl, {
    headers: REQUEST_HEADERS,
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Public page request failed with status ${response.status}.`);
  }

  const resolvedUrl = response.url || inputUrl;
  const html = await response.text();
  const blob = extractStateBlob(html);
  const state = parseInitialState(blob);
  return normalizeCapturePayload({ inputUrl, resolvedUrl, state });
}

function validateProxyTarget(rawTarget) {
  try {
    const target = new URL(normalizeAssetUrl(String(rawTarget || "")));
    if (target.protocol !== "http:" && target.protocol !== "https:") {
      return null;
    }
    if (!XHS_ALLOWED_HOSTS.some((pattern) => pattern.test(target.hostname))) {
      return null;
    }
    return target.toString();
  } catch {
    return null;
  }
}

module.exports = {
  REQUEST_HEADERS,
  buildMediaProxyPath,
  extractPublicUrl,
  extractStateBlob,
  fetchCaptureFromPublicLink,
  normalizeCapturePayload,
  normalizeAssetUrl,
  parseInitialState,
  splitDescriptionAndTags,
  validateProxyTarget,
};
