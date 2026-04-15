# Lightweight RedNote Scraper

[English](./README.md) · [简体中文](./README.zh-CN.md)

一个轻量、面向手机访问的小红书公开笔记抓取工具。

贴入一条公开链接，就可以读取正文、标签、图片、视频和 Live Photo 动态资源，并直接在手机浏览器里保存需要的内容。无广告、无账号登录、无 cookies、无服务端历史记录。

## 为什么做这个项目

- 轻量：没有数据库、没有登录流程、没有厚重后台
- 快：一次只抓一条公开笔记，结果立刻返回
- 手机优先：界面围绕 iPhone 等移动浏览器设计
- 干净：没有广告、没有跟踪弹层、没有多余设置

## 功能亮点

- 支持公开的小红书 / RedNote 笔记
- 手机网页可直接使用，支持中英文切换
- 不需要账号，也不保存 cookies 或任何账号信息
- 不保留服务端历史记录，刷新页面后当前结果即清空
- 支持单个媒体保存，也支持一键保存全部媒体
- 图片与视频通过同域代理预览和下载，兼容性更稳

## 功能边界

- 仅支持公开笔记
- 不抓评论
- 不登录账号
- 不做批量任务
- 不保存服务端历史

## 技术栈

- 前端：原生 `HTML + CSS + JavaScript`
- 后端：Vercel Serverless Functions（Node.js）
- 解析：从公开页面提取 `window.__INITIAL_STATE__`
- 预览与下载：同域媒体代理 `/api/media`
- 持久化：无数据库、无服务端长期存储

## 目录结构

```text
.
├─ api/
│  ├─ capture.js
│  └─ media.js
├─ docs/
│  ├─ architecture.md
│  ├─ architecture.zh-CN.md
│  ├─ user-flow.md
│  ├─ user-flow.zh-CN.md
│  └─ diagrams/
│     ├─ architecture.drawio
│     └─ user-flow.drawio
├─ iphone/
│  └─ index.html
├─ lib/
│  ├─ i18n.js
│  └─ xhs.js
├─ tests/
│  ├─ i18n.test.js
│  ├─ media.test.js
│  └─ xhs.test.js
├─ app.js
├─ dev-server.mjs
├─ index.html
├─ styles.css
└─ vercel.json
```

## 本地运行

要求：

- Node.js 20+

安装与启动：

```bash
npm install
npm test
npm run dev
```

默认本地地址：

- `http://127.0.0.1:3015`

## 部署到 Vercel

```bash
npm install
npm test
vercel
vercel --prod
```

## 文档

- 英文 README：[`README.md`](./README.md)
- 用户流程（英文）：[`docs/user-flow.md`](./docs/user-flow.md)
- 用户流程（中文）：[`docs/user-flow.zh-CN.md`](./docs/user-flow.zh-CN.md)
- 架构说明（英文）：[`docs/architecture.md`](./docs/architecture.md)
- 架构说明（中文）：[`docs/architecture.zh-CN.md`](./docs/architecture.zh-CN.md)
- 用户流程图：[`docs/diagrams/user-flow.drawio`](./docs/diagrams/user-flow.drawio)
- 架构图：[`docs/diagrams/architecture.drawio`](./docs/diagrams/architecture.drawio)

## 安全与隐私

本项目不保存账号 cookies，也不在服务端永久存储抓取内容。

它只在你发起请求时临时抓取公开页面，并将结果返回给当前会话。
