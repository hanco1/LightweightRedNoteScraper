const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildMediaProxyPath,
  extractPublicUrl,
  extractStateBlob,
  normalizeAssetUrl,
  normalizeCapturePayload,
  parseInitialState,
  splitDescriptionAndTags,
  validateProxyTarget,
} = require("../lib/xhs");

test("extractPublicUrl finds a Xiaohongshu url inside share text", () => {
  const input =
    "21 【Sample title - Demo Author | Xiaohongshu】 token https://www.xiaohongshu.com/discovery/item/69d4daac000000001a02b9be?source=webshare&xsec_token=abc";

  assert.equal(
    extractPublicUrl(input),
    "https://www.xiaohongshu.com/discovery/item/69d4daac000000001a02b9be?source=webshare&xsec_token=abc",
  );
});

test("splitDescriptionAndTags separates text and hashtags", () => {
  const result = splitDescriptionAndTags(
    "First line of body\n#VancouverFood[话题]# #HotPotTonight#",
    [{ name: "VancouverFood[话题]" }],
  );

  assert.equal(result.description, "First line of body");
  assert.deepEqual(result.tags, ["#VancouverFood", "#HotPotTonight"]);
});

test("normalizeAssetUrl upgrades xhscdn media urls to https", () => {
  assert.equal(
    normalizeAssetUrl("http://sns-webpic-qc.xhscdn.com/demo.jpg"),
    "https://sns-webpic-qc.xhscdn.com/demo.jpg",
  );
});

test("extractStateBlob and parseInitialState support JS object state blobs", () => {
  const html = `
    <html><body>
      <script>console.log('ignore');</script>
      <script>window.__INITIAL_STATE__={
        global:{pwaAddDesktopPrompt:undefined},
        note:{noteDetailMap:{"abc":{note:{
          noteId:"69d4daac000000001a02b9be",
          title:"Sample note title",
          desc:"Sample body content #TagA#",
          time:1775557292000,
          ipLocation:"Shaanxi",
          type:"normal",
          user:{userId:"user-1",nickname:"Demo Author"},
          interactInfo:{likedCount:"1506",collectedCount:"162",commentCount:"64",shareCount:"32"},
          tagList:[{name:"TagA"}],
          imageList:[{
            urlDefault:"http://sns-webpic-qc.xhscdn.com/1-default.webp",
            urlPre:"http://sns-webpic-qc.xhscdn.com/1-preview.webp",
            width:1080,
            height:1440,
            livePhoto:false
          }]
        }}}}
      };</script>
    </body></html>
  `;

  const blob = extractStateBlob(html);
  const state = parseInitialState(blob);
  const payload = normalizeCapturePayload({
    inputUrl:
      "https://www.xiaohongshu.com/discovery/item/69d4daac000000001a02b9be?source=webshare",
    resolvedUrl:
      "https://www.xiaohongshu.com/explore/69d4daac000000001a02b9be?xsec_token=abc",
    state,
  });

  assert.equal(payload.feedId, "69d4daac000000001a02b9be");
  assert.equal(payload.title, "Sample note title");
  assert.equal(payload.author.name, "Demo Author");
  assert.equal(payload.publishedAt, "2026-04-07T10:21:32.000Z");
  assert.equal(payload.ipLocation, "Shaanxi");
  assert.equal(payload.interactions.collectedCount, 162);
  assert.equal(payload.media.length, 1);
  assert.equal(payload.media[0].kind, "image");
  assert.ok(
    payload.media[0].previewUrl.startsWith(
      "/api/media?url=https%3A%2F%2Fsns-webpic-qc.xhscdn.com%2F1-preview.webp",
    ),
  );
  assert.ok(
    payload.media[0].downloadUrl.startsWith(
      "/api/media?url=https%3A%2F%2Fsns-webpic-qc.xhscdn.com%2F1-default.webp",
    ),
  );
});

test("normalizeCapturePayload preserves live photo positional motion urls", () => {
  const state = {
    note: {
      noteDetailMap: {
        demo: {
          note: {
            noteId: "abc123",
            title: "",
            desc: "This is the body text #TagA#",
            type: "normal",
            time: 1775557292000,
            user: { userId: "u1", nickname: "Demo Writer" },
            interactInfo: {},
            tagList: [],
            imageList: [
              {
                urlDefault: "http://sns-webpic-qc.xhscdn.com/1.jpg",
                urlPre: "http://sns-webpic-qc.xhscdn.com/1-preview.jpg",
                width: 100,
                height: 100,
                livePhoto: false,
              },
              {
                urlDefault: "http://sns-webpic-qc.xhscdn.com/2.jpg",
                urlPre: "http://sns-webpic-qc.xhscdn.com/2-preview.jpg",
                width: 100,
                height: 100,
                livePhoto: true,
                stream: { h264: [{ masterUrl: "http://sns-video-bd.xhscdn.com/2.mp4" }] },
              },
            ],
          },
        },
      },
    },
  };

  const payload = normalizeCapturePayload({
    inputUrl: "https://www.xiaohongshu.com/explore/abc123",
    resolvedUrl: "https://www.xiaohongshu.com/explore/abc123",
    state,
  });

  assert.equal(payload.media[0].motionUrl, null);
  assert.equal(payload.media[1].isLivePhoto, true);
  assert.equal(
    payload.media[1].motionUrl,
    "/api/media?url=https%3A%2F%2Fsns-video-bd.xhscdn.com%2F2.mp4",
  );
});

test("validateProxyTarget only allows Xiaohongshu media hosts", () => {
  assert.equal(
    validateProxyTarget("http://sns-webpic-qc.xhscdn.com/demo.jpg"),
    "https://sns-webpic-qc.xhscdn.com/demo.jpg",
  );
  assert.equal(
    validateProxyTarget("https://www.xiaohongshu.com/explore/demo"),
    "https://www.xiaohongshu.com/explore/demo",
  );
  assert.equal(validateProxyTarget("https://evil.example/demo.jpg"), null);
});

test("buildMediaProxyPath encodes target url", () => {
  assert.equal(
    buildMediaProxyPath("https://sns-webpic-qc.xhscdn.com/demo.jpg"),
    "/api/media?url=https%3A%2F%2Fsns-webpic-qc.xhscdn.com%2Fdemo.jpg",
  );
});
