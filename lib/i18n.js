(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.AppI18n = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const messages = {
    zh: {
      locale: "zh-CN",
      pageTitle: "\u5c0f\u7ea2\u4e66\u4e00\u952e\u5b58\u56fe",
      heroEyebrow: "\u5c0f\u7ea2\u4e66\u56fe\u6587\u4fdd\u5b58",
      heroCopy:
        "\u652f\u6301\u6240\u6709\u5c0f\u7ea2\u4e66\u516c\u5f00\u7b14\u8bb0\u3002\u6574\u7406\u5b8c\u5c31\u80fd\u770b\u6b63\u6587\u3001\u6807\u7b7e\u548c\u56fe\u7247\u89c6\u9891\uff0c\u60f3\u5b58\u54ea\u5f20\u5c31\u70b9\u54ea\u5f20\uff0c\u65e0\u6c34\u5370\u3002",
      fieldLabel: "\u8d34\u5c0f\u7ea2\u4e66\u94fe\u63a5",
      sourcePlaceholder: "\u628a\u5c0f\u7ea2\u4e66\u94fe\u63a5\u6216\u5206\u4eab\u6587\u6848\u8d34\u5230\u8fd9\u91cc",
      captureButton: "\u5f00\u59cb\u6574\u7406",
      captureLoading: "\u6574\u7406\u4e2d\u2026",
      saveAllButton: "\u4fdd\u5b58\u6240\u6709\u56fe\u7247",
      saveAllLoading: "\u51c6\u5907\u4e2d\u2026",
      statusIdle: "\u5f53\u524d\u53ea\u770b\u8fd9\u4e00\u6761\uff0c\u5237\u65b0\u9875\u9762\u4f1a\u91cd\u65b0\u5f00\u59cb\u3002",
      statusNeedUrl: "\u5148\u8d34\u4e00\u6761\u5c0f\u7ea2\u4e66\u94fe\u63a5\u3002",
      statusLoading: "\u6b63\u5728\u6574\u7406\uff0c\u901a\u5e38\u51e0\u79d2\u5c31\u597d\u3002",
      statusDone: "\u6574\u7406\u597d\u4e86\uff0c\u5f80\u4e0b\u5c31\u80fd\u770b\u56fe\u6587\uff0c\u4e5f\u80fd\u76f4\u63a5\u4fdd\u5b58\u3002",
      statusRefresh:
        "\u9884\u89c8\u5df2\u5237\u65b0\uff0c\u4e2a\u522b\u8fd8\u6ca1\u51fa\u6765\u4e5f\u80fd\u76f4\u63a5\u4fdd\u5b58\u3002",
      statusError:
        "\u8fd9\u6761\u5185\u5bb9\u6682\u65f6\u6ca1\u6574\u7406\u51fa\u6765\uff0c\u6362\u4e2a\u94fe\u63a5\u518d\u8bd5\u8bd5\u3002",
      resultLabel: "\u5f53\u524d\u5185\u5bb9",
      resultEmptyTitle: "\u8fd8\u6ca1\u6709\u5185\u5bb9",
      unnamedContent: "\u672a\u547d\u540d\u5185\u5bb9",
      sourceLink: "\u53bb\u539f\u5e16",
      publishedPrefix: "\u53d1\u5e03\u4e8e",
      ipPrefix: "IP\u5f52\u5c5e\u5730",
      unknownAuthor: "\u672a\u77e5\u4f5c\u8005",
      unavailable: "\u6682\u65e0",
      authorLabel: "\u535a\u4e3b",
      likeLabel: "\u70b9\u8d5e",
      collectLabel: "\u6536\u85cf",
      commentLabel: "\u8bc4\u8bba",
      shareLabel: "\u5206\u4eab",
      descriptionLabel: "\u6b63\u6587",
      descriptionEmpty: "\u8fd9\u6761\u5185\u5bb9\u6ca1\u6709\u6b63\u6587\u3002",
      descriptionPlaceholder:
        "\u6574\u7406\u5b8c\u6210\u540e\uff0c\u8fd9\u91cc\u4f1a\u663e\u793a\u53bb\u6389\u6807\u7b7e\u540e\u7684\u6b63\u6587\u3002",
      tagsLabel: "\u6807\u7b7e",
      mediaLabel: "\u5a92\u4f53",
      mediaCountSuffix: "\u9879",
      refreshMedia: "\u91cd\u8bd5\u9884\u89c8",
      mediaErrorTitle: "\u8fd9\u5f20\u56fe\u8fd8\u6ca1\u663e\u793a\u51fa\u6765",
      mediaErrorBody:
        "\u70b9\u4e00\u4e0b\u91cd\u8bd5\u9884\u89c8\uff0c\u6216\u8005\u76f4\u63a5\u4fdd\u5b58\u4e5f\u53ef\u4ee5\u3002",
      imageBadge: "\u56fe\u7247",
      videoBadge: "\u89c6\u9891",
      livePhotoBadge: "LIVE PHOTO",
      saveSingleButton: "\u4fdd\u5b58\u8fd9\u5f20",
      saveSingleLoading: "\u4fdd\u5b58\u4e2d\u2026",
      motionButton: "\u770b\u52a8\u6001\u7248",
      saveFallbackTitle: "\u8fd9\u6761\u5185\u5bb9",
      legalNote:
        "\u514d\u8d23\u58f0\u660e\uff1a\u7248\u6743\u5f52\u5e73\u53f0\u53ca\u4f5c\u8005\u6240\u6709\uff0c\u672c\u7a0b\u5e8f\u4e0d\u50a8\u5b58\u4efb\u4f55\u5185\u5bb9\u3002",
      languageZh: "\u4e2d\u6587",
      languageEn: "EN",
    },
    en: {
      locale: "en-US",
      pageTitle: "RedNote Saver",
      heroEyebrow: "RedNote Saver",
      heroCopy:
        "Works with public RedNote posts on Xiaohongshu. In one pass you can read the caption, tags, photos, and videos. Save any item you want without a watermark.",
      fieldLabel: "Paste a RedNote link",
      sourcePlaceholder: "Paste a public RedNote or Xiaohongshu link here",
      captureButton: "Fetch now",
      captureLoading: "Fetching...",
      saveAllButton: "Save all images",
      saveAllLoading: "Preparing...",
      statusIdle: "Only the current result stays on this page. Refresh to start over.",
      statusNeedUrl: "Paste a Xiaohongshu link first.",
      statusLoading: "Getting everything ready. This usually takes a few seconds.",
      statusDone: "All set. Scroll down to view the post and save what you need.",
      statusRefresh: "Previews reloaded. You can still save any item if one stays blank.",
      statusError: "We could not load this post right now. Try another public link.",
      resultLabel: "Current post",
      resultEmptyTitle: "Nothing here yet",
      unnamedContent: "Untitled post",
      sourceLink: "Open original",
      publishedPrefix: "Published",
      ipPrefix: "IP location",
      unknownAuthor: "Unknown creator",
      unavailable: "N/A",
      authorLabel: "Creator",
      likeLabel: "Likes",
      collectLabel: "Saves",
      commentLabel: "Comments",
      shareLabel: "Shares",
      descriptionLabel: "Caption",
      descriptionEmpty: "No caption available.",
      descriptionPlaceholder: "Once the post is ready, the cleaned caption will appear here.",
      tagsLabel: "Tags",
      mediaLabel: "Media",
      mediaCountSuffix: "items",
      refreshMedia: "Reload previews",
      mediaErrorTitle: "This preview did not load",
      mediaErrorBody: "Try reloading the preview, or save the original file directly.",
      imageBadge: "IMAGE",
      videoBadge: "VIDEO",
      livePhotoBadge: "LIVE PHOTO",
      saveSingleButton: "Save this",
      saveSingleLoading: "Saving...",
      motionButton: "View motion",
      saveFallbackTitle: "This RedNote post",
      legalNote:
        "Disclaimer: All rights belong to the platform and the original creator. This tool does not store any content.",
      languageZh: "ZH",
      languageEn: "EN",
    },
  };

  function resolveLocale(preferredLocale) {
    if (typeof preferredLocale !== "string" || !preferredLocale.trim()) {
      return "zh";
    }

    const normalized = preferredLocale.toLowerCase();
    if (normalized.startsWith("en")) {
      return "en";
    }
    if (normalized.startsWith("zh")) {
      return "zh";
    }
    return "zh";
  }

  function getMessages(locale) {
    return messages[resolveLocale(locale)];
  }

  return {
    messages,
    resolveLocale,
    getMessages,
  };
});
