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
      pageTitle: "小红书一键存图",
      heroEyebrow: "小红书图文保存",
      heroCopy: "支持所有小红书公开笔记。整理完就能看正文、标签和图片视频，想存哪张就点哪张，无水印。",
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
      resultLabel: "当前内容",
      resultEmptyTitle: "还没有内容",
      unnamedContent: "未命名内容",
      sourceLink: "去原帖",
      publishedPrefix: "发布于",
      ipPrefix: "IP归属地",
      unknownAuthor: "未知作者",
      unavailable: "暂无",
      authorLabel: "博主",
      likeLabel: "点赞",
      collectLabel: "收藏",
      commentLabel: "评论",
      shareLabel: "分享",
      descriptionLabel: "正文",
      descriptionEmpty: "这条内容没有正文。",
      descriptionPlaceholder: "整理完成后，这里会显示去掉标签后的正文。",
      tagsLabel: "标签",
      mediaLabel: "媒体",
      mediaCountSuffix: "项",
      refreshMedia: "重试预览",
      mediaErrorTitle: "这张图还没显示出来",
      mediaErrorBody: "点一下重试预览，或者直接保存也可以。",
      imageBadge: "图片",
      videoBadge: "视频",
      livePhotoBadge: "LIVE PHOTO",
      saveSingleButton: "保存这张",
      saveSingleLoading: "保存中…",
      motionButton: "看动态版",
      saveFallbackTitle: "这条内容",
      legalNote: "免责声明：版权归平台及作者所有，本程序不储存任何内容。",
      languageZh: "中文",
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
      captureLoading: "Fetching…",
      saveAllButton: "Save all images",
      saveAllLoading: "Preparing…",
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
      mediaErrorBody: "Try reloading the preview, or just save the original file directly.",
      imageBadge: "IMAGE",
      videoBadge: "VIDEO",
      livePhotoBadge: "LIVE PHOTO",
      saveSingleButton: "Save this",
      saveSingleLoading: "Saving…",
      motionButton: "View motion",
      saveFallbackTitle: "This RedNote post",
      legalNote:
        "Disclaimer: All rights belong to the platform and the original creator. This tool does not store any content.",
      languageZh: "中文",
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
