(function () {
  const i18n = window.AppI18n || {
    resolveLocale(locale) {
      return String(locale || "").toLowerCase().startsWith("en") ? "en" : "zh";
    },
    getMessages() {
      return {
        locale: "zh-CN",
        pageTitle: "小红书一键存图",
        heroEyebrow: "小红书图文保存",
        heroCopy:
          "支持所有小红书公开笔记。整理完就能看正文、标签和图片视频，想存哪张就点哪张，无水印。",
        fieldLabel: "贴小红书链接",
        sourcePlaceholder: "把小红书链接或分享文案贴到这里",
        captureButton: "开始整理",
        captureLoading: "整理中…",
        saveAllButton: "保存所有图片",
        saveAllLoading: "准备中…",
        statusIdle: "当前只看这一条，刷新页面会重新开始。",
        statusNeedUrl: "先贴一条小红书链接。",
        statusLoading: "正在整理，通常几秒就好。",
        statusDone: "整理好了，往下就能看图文，也能直接保存。",
        statusRefresh: "预览已刷新，个别还没出来也能直接保存。",
        statusError: "这条内容暂时没整理出来，换个链接再试试。",
        resultEmptyTitle: "还没有内容",
        unnamedContent: "未命名内容",
        sourceLink: "去原帖",
        publishedPrefix: "发布于",
        ipPrefix: "IP归属地",
        unknownAuthor: "未知作者",
        unavailable: "暂无",
        descriptionEmpty: "这条内容没有正文。",
        descriptionPlaceholder: "整理完成后，这里会显示去掉标签后的正文。",
        mediaCountSuffix: "项",
        mediaErrorTitle: "这张图还没显示出来",
        mediaErrorBody: "点一下重试预览，或者直接保存也可以。",
        imageBadge: "图片",
        videoBadge: "视频",
        livePhotoBadge: "LIVE PHOTO",
        saveSingleButton: "保存这张",
        saveSingleLoading: "保存中…",
        motionButton: "看动态版",
        saveFallbackTitle: "这条内容",
      };
    },
  };

  const state = {
    capture: null,
    previewObjectUrls: new Set(),
    locale: i18n.resolveLocale(localStorage.getItem("xhs-ui-language") || navigator.language),
    statusKey: "statusIdle",
    statusTone: null,
    captureBusy: false,
    saveAllBusy: false,
  };

  const elements = {
    sourceInput: document.getElementById("sourceInput"),
    captureButton: document.getElementById("captureButton"),
    statusText: document.getElementById("statusText"),
    resultSection: document.getElementById("resultSection"),
    resultTitle: document.getElementById("resultTitle"),
    sourceLink: document.getElementById("sourceLink"),
    saveAllButton: document.getElementById("saveAllButton"),
    metaRow: document.getElementById("metaRow"),
    publishedPill: document.getElementById("publishedPill"),
    ipPill: document.getElementById("ipPill"),
    statsGrid: document.getElementById("statsGrid"),
    authorValue: document.getElementById("authorValue"),
    likeValue: document.getElementById("likeValue"),
    collectValue: document.getElementById("collectValue"),
    commentValue: document.getElementById("commentValue"),
    shareValue: document.getElementById("shareValue"),
    descriptionValue: document.getElementById("descriptionValue"),
    tagsSection: document.getElementById("tagsSection"),
    tagsValue: document.getElementById("tagsValue"),
    mediaSection: document.getElementById("mediaSection"),
    mediaCount: document.getElementById("mediaCount"),
    mediaGrid: document.getElementById("mediaGrid"),
    refreshMediaButton: document.getElementById("refreshMediaButton"),
    languageButtons: Array.from(document.querySelectorAll("[data-lang]")),
    translatableNodes: Array.from(document.querySelectorAll("[data-i18n]")),
    placeholderNodes: Array.from(document.querySelectorAll("[data-i18n-placeholder]")),
  };

  function messages() {
    return i18n.getMessages(state.locale);
  }

  function t(key) {
    return messages()[key] || "";
  }

  function applyStatus() {
    elements.statusText.textContent = t(state.statusKey || "statusIdle");
    elements.statusText.classList.remove("is-error", "is-success");
    if (state.statusTone) {
      elements.statusText.classList.add(state.statusTone);
    }
  }

  function setStatusByKey(key, tone) {
    state.statusKey = key;
    state.statusTone = tone || null;
    applyStatus();
  }

  function updateButtonStates() {
    elements.captureButton.disabled = state.captureBusy;
    elements.captureButton.textContent = state.captureBusy ? t("captureLoading") : t("captureButton");

    const hasMedia = Boolean(state.capture && Array.isArray(state.capture.media) && state.capture.media.length);
    elements.saveAllButton.disabled = !hasMedia || state.saveAllBusy;
    elements.saveAllButton.textContent = state.saveAllBusy ? t("saveAllLoading") : t("saveAllButton");
  }

  function applyStaticCopy() {
    document.title = t("pageTitle");
    document.documentElement.lang = state.locale === "en" ? "en" : "zh-CN";
    document.documentElement.dataset.uiLanguage = state.locale;

    elements.translatableNodes.forEach((node) => {
      const key = node.dataset.i18n;
      if (key) {
        node.textContent = t(key);
      }
    });

    elements.placeholderNodes.forEach((node) => {
      const key = node.dataset.i18nPlaceholder;
      if (key) {
        node.placeholder = t(key);
      }
    });

    elements.languageButtons.forEach((button) => {
      const active = button.dataset.lang === state.locale;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    if (!state.capture) {
      elements.resultTitle.textContent = t("resultEmptyTitle");
      elements.descriptionValue.textContent = t("descriptionPlaceholder");
    }

    updateButtonStates();
    applyStatus();
  }

  function applyLanguage(locale) {
    state.locale = i18n.resolveLocale(locale);
    localStorage.setItem("xhs-ui-language", state.locale);
    applyStaticCopy();
    if (state.capture) {
      renderCapture(state.capture);
    }
  }

  function formatDateTime(value) {
    if (!value) return t("unavailable");
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return t("unavailable");
    return new Intl.DateTimeFormat(messages().locale, {
      year: "numeric",
      month: state.locale === "en" ? "short" : "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(parsed);
  }

  function formatCount(value) {
    return value == null ? t("unavailable") : new Intl.NumberFormat(messages().locale).format(value);
  }

  function withBust(url, token) {
    if (!url) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}reload=${token}`;
  }

  async function fetchBlob(url, extra = {}) {
    const response = await fetch(url, extra);
    if (!response.ok) {
      throw new Error("media request failed");
    }
    return response.blob();
  }

  function guessExtension(mimeType, kind) {
    if (!mimeType) return kind === "video" ? "mp4" : "jpg";
    if (mimeType.includes("png")) return "png";
    if (mimeType.includes("webp")) return "webp";
    if (mimeType.includes("gif")) return "gif";
    if (mimeType.includes("avif")) return "avif";
    if (mimeType.includes("mp4")) return "mp4";
    if (mimeType.includes("quicktime")) return "mov";
    return kind === "video" ? "mp4" : "jpg";
  }

  function registerObjectUrl(objectUrl) {
    state.previewObjectUrls.add(objectUrl);
    return objectUrl;
  }

  function clearPreviewObjectUrls() {
    for (const url of state.previewObjectUrls) {
      URL.revokeObjectURL(url);
    }
    state.previewObjectUrls.clear();
  }

  async function shareOrDownload(url, filename, kind) {
    const blob = await fetchBlob(url);
    const extension = guessExtension(blob.type, kind);
    const file = new File([blob], `${filename}.${extension}`, {
      type: blob.type || (kind === "video" ? "video/mp4" : "image/jpeg"),
    });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: filename });
      return;
    }

    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  async function saveAllMedia() {
    if (!state.capture || !Array.isArray(state.capture.media) || !state.capture.media.length) {
      return;
    }

    try {
      const files = [];
      for (const media of state.capture.media) {
        const blob = await fetchBlob(media.downloadUrl);
        const extension = guessExtension(blob.type, media.kind);
        files.push(
          new File([blob], `${state.capture.title || t("saveFallbackTitle")}-${media.index}.${extension}`, {
            type: blob.type || (media.kind === "video" ? "video/mp4" : "image/jpeg"),
          }),
        );
      }

      if (navigator.share && navigator.canShare && navigator.canShare({ files })) {
        await navigator.share({ files, title: state.capture.title || t("saveFallbackTitle") });
        return;
      }
    } catch (error) {
      console.warn("share all fallback", error);
    }

    for (const media of state.capture.media) {
      // eslint-disable-next-line no-await-in-loop
      await shareOrDownload(
        media.downloadUrl,
        `${state.capture.title || t("saveFallbackTitle")}-${media.index}`,
        media.kind,
      );
    }
  }

  function setCardPreviewState(card, errorState, broken) {
    card.classList.toggle("is-broken", broken);
    errorState.classList.toggle("hidden", !broken);
  }

  function buildPreviewCandidates(media) {
    const seen = new Set();
    const values = [media.previewUrl, ...(media.previewFallbackUrls || [])].filter(Boolean);
    return values.filter((value) => {
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }

  async function loadImagePreview(preview, media, card, errorState, bustToken = null) {
    const candidates = buildPreviewCandidates(media).map((value) =>
      bustToken ? withBust(value, bustToken) : value,
    );

    for (const candidate of candidates) {
      try {
        const blob = await fetchBlob(candidate, { cache: "no-store" });
        const objectUrl = registerObjectUrl(URL.createObjectURL(blob));
        preview.dataset.originalSrc = candidate;
        preview.src = objectUrl;
        setCardPreviewState(card, errorState, false);
        return;
      } catch (error) {
        console.warn("preview candidate failed", candidate, error);
      }
    }

    preview.removeAttribute("src");
    setCardPreviewState(card, errorState, true);
  }

  function createMediaCard(media) {
    const card = document.createElement("article");
    card.className = "media-card";

    const figure = document.createElement("figure");
    figure.className = "media-figure";

    const errorState = document.createElement("figcaption");
    errorState.className = "media-error hidden";
    errorState.innerHTML = `
      <strong>${t("mediaErrorTitle")}</strong>
      <span>${t("mediaErrorBody")}</span>
    `;

    let preview;
    if (media.kind === "video") {
      preview = document.createElement("video");
      preview.className = "media-preview video";
      preview.controls = true;
      preview.playsInline = true;
      preview.preload = "metadata";
      preview.dataset.originalSrc = media.previewUrl;
      preview.addEventListener("error", () => setCardPreviewState(card, errorState, true));
      preview.addEventListener("loadeddata", () => setCardPreviewState(card, errorState, false));
      preview.src = media.previewUrl;
    } else {
      preview = document.createElement("img");
      preview.className = "media-preview";
      preview.alt = `${t("mediaLabel")} ${media.index}`;
      preview.decoding = "async";
      preview.addEventListener("error", () => setCardPreviewState(card, errorState, true));
      preview.addEventListener("load", () => setCardPreviewState(card, errorState, false));
      void loadImagePreview(preview, media, card, errorState);
    }

    const badge = document.createElement("span");
    badge.className = "media-badge";
    badge.textContent =
      media.kind === "video" ? t("videoBadge") : media.isLivePhoto ? t("livePhotoBadge") : t("imageBadge");

    figure.appendChild(preview);
    figure.appendChild(badge);
    figure.appendChild(errorState);

    const actions = document.createElement("div");
    actions.className = "media-actions";

    const saveButton = document.createElement("button");
    saveButton.className = "save-button";
    saveButton.textContent = t("saveSingleButton");
    saveButton.addEventListener("click", async () => {
      saveButton.disabled = true;
      const originalText = saveButton.textContent;
      saveButton.textContent = t("saveSingleLoading");
      try {
        await shareOrDownload(
          media.downloadUrl,
          `${state.capture.title || t("saveFallbackTitle")}-${media.index}`,
          media.kind,
        );
      } finally {
        saveButton.disabled = false;
        saveButton.textContent = originalText;
      }
    });
    actions.appendChild(saveButton);

    if (media.motionUrl) {
      const motionButton = document.createElement("button");
      motionButton.className = "save-button secondary";
      motionButton.textContent = t("motionButton");
      motionButton.addEventListener("click", () => {
        window.open(media.motionUrl, "_blank", "noopener,noreferrer");
      });
      actions.appendChild(motionButton);
    }

    card.appendChild(figure);
    card.appendChild(actions);
    return card;
  }

  function renderCapture(capture) {
    clearPreviewObjectUrls();
    state.capture = capture;
    elements.resultSection.classList.remove("is-empty");
    elements.resultTitle.textContent = capture.title || t("unnamedContent");
    elements.sourceLink.classList.toggle("hidden", !capture.sourceUrl);
    elements.sourceLink.href = capture.sourceUrl || "#";

    elements.metaRow.classList.remove("hidden");
    elements.publishedPill.textContent = `${t("publishedPrefix")} ${formatDateTime(capture.publishedAt)}`;
    elements.publishedPill.classList.remove("hidden");
    elements.ipPill.textContent = `${t("ipPrefix")} ${capture.ipLocation || t("unavailable")}`;
    elements.ipPill.classList.remove("hidden");

    elements.statsGrid.classList.remove("hidden");
    elements.authorValue.textContent =
      capture.author && capture.author.name ? capture.author.name : t("unknownAuthor");
    elements.likeValue.textContent = formatCount(capture.interactions && capture.interactions.likeCount);
    elements.collectValue.textContent = formatCount(
      capture.interactions && capture.interactions.collectedCount,
    );
    elements.commentValue.textContent = formatCount(
      capture.interactions && capture.interactions.commentCount,
    );
    elements.shareValue.textContent = formatCount(
      capture.interactions && capture.interactions.shareCount,
    );
    elements.descriptionValue.textContent = capture.description || t("descriptionEmpty");

    const tags = Array.isArray(capture.tags) ? capture.tags : [];
    elements.tagsValue.innerHTML = "";
    elements.tagsSection.classList.toggle("hidden", tags.length === 0);
    tags.forEach((tag) => {
      const chip = document.createElement("span");
      chip.className = "tag-chip";
      chip.textContent = tag;
      elements.tagsValue.appendChild(chip);
    });

    const media = Array.isArray(capture.media) ? capture.media : [];
    elements.mediaSection.classList.toggle("hidden", media.length === 0);
    elements.mediaCount.textContent = media.length ? `${media.length} ${t("mediaCountSuffix")}` : "";
    elements.refreshMediaButton.classList.toggle("hidden", media.length === 0);
    elements.mediaGrid.innerHTML = "";
    media.forEach((item) => elements.mediaGrid.appendChild(createMediaCard(item)));
    updateButtonStates();
  }

  async function refreshMediaPreviews() {
    const token = Date.now();
    const cards = Array.from(elements.mediaGrid.querySelectorAll(".media-card"));
    const tasks = cards.map(async (card, index) => {
      const media = state.capture && state.capture.media ? state.capture.media[index] : null;
      const preview = card.querySelector(".media-preview");
      const errorState = card.querySelector(".media-error");
      if (!media || !preview || !errorState) {
        return;
      }

      if (media.kind === "video") {
        preview.dataset.originalSrc = media.previewUrl;
        preview.src = withBust(media.previewUrl, token);
        card.classList.remove("is-broken");
        errorState.classList.add("hidden");
        preview.load();
        return;
      }

      await loadImagePreview(preview, media, card, errorState, token);
    });

    await Promise.all(tasks);
    setStatusByKey("statusRefresh");
  }

  async function submitCapture() {
    const source = elements.sourceInput.value.trim();
    if (!source) {
      setStatusByKey("statusNeedUrl", "is-error");
      elements.sourceInput.focus();
      return;
    }

    state.captureBusy = true;
    updateButtonStates();
    setStatusByKey("statusLoading");

    try {
      const response = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: source }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "capture failed");
      }
      renderCapture(payload);
      setStatusByKey("statusDone", "is-success");
    } catch (error) {
      console.warn("capture failed", error);
      setStatusByKey("statusError", "is-error");
    } finally {
      state.captureBusy = false;
      updateButtonStates();
    }
  }

  applyStaticCopy();
  updateButtonStates();

  elements.captureButton.addEventListener("click", submitCapture);
  elements.saveAllButton.addEventListener("click", async () => {
    state.saveAllBusy = true;
    updateButtonStates();
    try {
      await saveAllMedia();
    } finally {
      state.saveAllBusy = false;
      updateButtonStates();
    }
  });
  elements.refreshMediaButton.addEventListener("click", () => {
    void refreshMediaPreviews();
  });
  elements.languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyLanguage(button.dataset.lang);
    });
  });
  window.addEventListener("beforeunload", clearPreviewObjectUrls);
})();
