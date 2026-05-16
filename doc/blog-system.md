# Xiaocheng Blog 日志系统 · 工作笔记

> 记录 2026-05-16 这次给个人博客加日志专栏的全部工作，方便之后扩展、复用。

---

## 一、当前状态（master @ be26966）

- 路由：**HashRouter**，链接形如 `https://xiaocheng123.github.io/#/blog/2026-5-16`
- 部署：push 到 `master` → GitHub Action（`.github/workflows/webpack.yml`）→ `gh-pages` 分支
- 站点是 GitHub **用户站点**（user site），根域名 `xiaocheng123.github.io`，**不带项目前缀**

## 二、目录结构

```
src/blog/
├── posts.js          # 文章数据源（数组 + getPostBySlug）
├── BlogList.jsx      # 列表页（路由 /blog）
├── BlogPost.jsx      # 详情页（路由 /blog/:slug）
├── Sakura.jsx        # 樱花飘落 SVG 动画
├── useMotionPrefs.js # 检测 prefers-reduced-motion + 移动端
├── useShare.js       # 注入 og/twitter meta + 微信 JS-SDK 分享配置
└── Comments.jsx      # Twikoo 评论组件（无需登录）

public/blog/
├── 2026-5-16-cover.jpg   # 页面封面（1200×1200 jpg, ~240KB）
└── 2026-5-16-share.jpg   # 微信分享缩略图（480×480 jpg, ~22KB）
```

## 三、设计风格

- 米白底 `#f7f4ec`，墨色字 `#1a1a1a`，金色点缀 `#6b5d3a`
- 字体：`Noto Serif JP` + `Noto Serif SC`（思源宋体）
- Tailwind 自定义字体族：`font-jp`（见 `tailwind.config.cjs`）
- 大量留白、细分隔线、章节居中分隔符 ◇
- 动画：framer-motion 入场/滚动入场、樱花飘落、滚动进度条
- 移动端：樱花数量减半、字号缩小、`prefers-reduced-motion` 自动关动画
- 顶部"桜 ON/OFF"按钮可手动开关花瓣

## 四、新增一篇日志的流程

1. 在 `src/blog/posts.js` 数组前面 push 一条：
   ```js
   {
     slug: "2026-x-x",                       // URL 的最后一段
     title: "标题",
     subtitle: "副标题（可选）",
     date: "2026.0X.0X",
     location: "城市 · 天气",
     cover: "/blog/2026-x-x-cover.jpg",       // 页面封面（方形，jpg/png）
     shareCover: "/blog/2026-x-x-share.jpg",  // 微信分享专用（≤32KB，方形 jpg）
     shareTitle: "...",                       // 分享卡片标题
     shareDesc: "...",                        // 分享卡片描述（朋友圈不显示）
     excerpt: "列表摘要",
     content: `正文。

   一　小标题（一/二/三 + 全角空格 自动识别为章节标题）

   章节一　大标题（"章节" + 中文数字 自动识别）

   ———（连续 3 个以上 — 或 - 自动渲染成分隔横线）

   段落之间用空行分隔。`,
   },
   ```

2. 把封面图放到 `public/blog/`（命名按 slug）。生成 + 压缩流程见下一节。

3. `git add . && git commit -m "post: 标题" && git push`，1–2 分钟自动上线。

## 五、封面图制作流程

### 5.1 用 AI 生成原图（image_gen 工具）

提示词模板：
```
极简日式杂志封面，正方形构图，米白色纸张纹理背景，
画面正中一支水墨樱花枝干，留白极多，
左上角竖排手写中文毛笔字"<文章标题>"，
右下角小字"<日期>"，
黑白灰为主，仅一点点淡粉色樱花点缀，
无印良品/山本耀司海报美学，安静优雅，干净极简，高清
```

输出尺寸推荐 `1024×1024`。

### 5.2 用 macOS `sips` 压缩成两种规格

```bash
cd public/blog

# 页面用：1200 方形 jpg，质量 75（≈ 200-300KB）
sips -Z 1200 -s format jpeg -s formatOptions 75 \
  原图.png --out 2026-x-x-cover.jpg

# 微信分享用：480 方形 jpg，质量 50（≤ 32KB）
sips -Z 480 -s format jpeg -s formatOptions 50 \
  原图.png --out 2026-x-x-share.jpg
```

> ⚠️ 微信朋友圈封面限制：≤ 32KB，必须正方形，jpg/png。

## 六、微信分享 / 朋友圈卡片机制（重要踩坑）

### 朋友圈/对话卡片的真相
- **朋友圈卡片**：只显示 **标题 + 封面图**，**不显示描述**（微信产品设计，无解）
- **聊天/对话卡片**：显示 标题 + 描述 + 封面图

### 当前 HashRouter 的限制
- URL 形如 `https://xiaocheng123.github.io/#/blog/2026-5-16`
- 微信爬虫抓取时**会丢掉 `#` 后内容**，等于只抓首页
- 因此朋友圈卡片永远拿到的是 `index.html` 里默认的 og（已配置）
- 这是当前体验"分享时只有标题、封面没出"的根因之一

### 已配置的兜底
`index.html` 已包含全局默认 og：
```html
<meta property="og:title" content="Xiaocheng Blog" />
<meta property="og:image" content="https://xiaocheng123.github.io/blog/2026-5-16.png" />
<!-- ↑ 注意这个图片路径已不存在，下次发新博客时记得更新这里 -->
```

> **TODO**：把 `index.html` 里的 og:image 改为 `2026-5-16-share.jpg`（22KB 那张）。

### 后续要让朋友圈每篇文章独立卡片，备选方案

| 方案 | 利 | 弊 | 推荐度 |
|---|---|---|---|
| **A. 切 BrowserRouter + 404.html SPA fallback** | URL 干净 `/blog/2026-5-16`，爬虫能抓到对应页 og；用户体验更好 | 需要 spa-github-pages 兜底；微信首次抓取仍可能 miss（爬虫执行 JS 不稳）；微信卡片有 24h 缓存，改完要换 URL 才刷新 | ⭐⭐⭐ 推荐 |
| **B. 每篇文章生成一个静态 .html**（构建期 prerender） | 爬虫零 JS 也能拿到 og；最稳 | 需要加 vite-plugin-ssg / react-snap 等构建步骤；改造略大 | ⭐⭐⭐⭐ 长期最优 |
| **C. 接入公众号 JS-SDK 签名** | 微信内右上角分享菜单可完整自定义 | 需要后端做 jsapi_ticket 签名；GitHub Pages 没有后端 | ⭐ 不推荐（无后端） |
| **D. 维持现状** | 不动代码 | 朋友圈卡片永远是首页那一套 | — |

`useShare.js` 已经把 JS-SDK 调用代码写好了（无签名时静默失败），将来接公众号只需补一个签名接口。

### 微信卡片缓存
微信对**同一 URL** 的卡片信息有缓存（约 24h，有时更久）。修改 og 后想立刻看到效果：
- 在 URL 后加 `?v=2`、`?v=3` 强刷
- 或者换一个测试链接

## 七、本次 Commit 记录

```
be26966  perf(blog): 页面封面图压缩到 240KB，提升手机端加载速度
7a0e35b  feat(blog): 添加封面图与微信/og 分享卡片支持
71e0d0d  chore(blog): 标题改为《写给未来的我》
0fc402a  chore(blog): 修正 2026-5-16 日志地点为 深圳 · 多云 · 大风
7c1300c  feat(blog): 加入日系优雅动画（樱花飘落/标题渐显/滚动进度/段落入场），移动端自动降级
37f4c2d  feat: 添加 Hash 路由 + 日志专栏（日系极简风），首篇《写给即将三十岁的我》
```

## 八、下次继续做的清单（建议优先级）

1. **修正 `index.html` 兜底 og:image** 指向 `2026-5-16-share.jpg`（最快、零成本，**强烈建议先做**）
2. **切到 BrowserRouter + spa-github-pages 404.html 方案** —— 让朋友圈每篇文章卡片独立
3. **构建期生成每篇文章独立 .html**（react-snap / vite-plugin-ssg）—— 最彻底解决爬虫不执行 JS 的问题
4. 给列表页加上分类/年份归档
5. 抽离 `mdx` 支持，让 `content` 直接写 Markdown 而不是字符串
6. 加阅读统计（umami / 访问计数 SVG）

## 九、评论系统（Twikoo · 无需登录）

### 架构
- 前端：`src/blog/Comments.jsx`（懒加载 twikoo CDN）
- 服务端：Twikoo 云函数，部署在 **Vercel**
- 数据库：**MongoDB Atlas Free Cluster (M0)**，512MB 免费

### 关键信息
- Twikoo 云函数 URL（envId）：`https://twikoo-g4818gj5e-xiaochengs-projects.vercel.app`
- Vercel 项目：基于 fork 的 imaegoo/twikoo（XiaoCheng123 账户）
- MongoDB Atlas：用户 `alen`，cluster `cluster0.wx9e7og.mongodb.net`
- Vercel 环境变量：`MONGODB_URI`（带密码完整连接串）
- MongoDB Network Access：`0.0.0.0/0`（必须）

### 功能
- 完全匿名评论，昵称/邮箱/链接均选填
- 支持 Markdown、emoji、回复
- Twikoo 自带管理面板：访问云函数 URL 即可登录管理（首次访问会引导设置管理员密码）
- 自定义 CSS 见 `src/index.css` 的 `.twikoo-jp` 部分（米白底 + 宋体 + 直角按钮）

### 评论隔离
每篇文章用 `path={/blog/:slug}` 隔离，互不串扰。

### 后续维护
- **想换数据库**：改 Vercel 环境变量 `MONGODB_URI` → Redeploy
- **想备份评论**：管理面板有"导出"功能（JSON）
- **想反垃圾**：管理面板支持关键词、IP 黑名单、Akismet
- **MongoDB Atlas 密码改了**：同步更新 Vercel 的 MONGODB_URI 即可

### 升级 Twikoo
前端 CDN 写死了版本号 `1.6.39`（在 `Comments.jsx`）。要升级时改这一行即可：
```js
const TWIKOO_CDN = "https://cdn.staticfile.org/twikoo/X.Y.Z/twikoo.all.min.js";
```
服务端升级则需要在 Vercel 项目里 redeploy 一下 fork 的 twikoo 仓库。

---

## 十、本地常用命令

```bash
npm run dev        # 启动本地预览
npm run build      # 构建到 dist/

# 推送（本机 ssh 没权限，统一用 https）
git push https://github.com/XiaoCheng123/xiaocheng123.github.io.git master

# 看部署进度
open https://github.com/XiaoCheng123/xiaocheng123.github.io/actions
```

如需永久解决 ssh 推送：把 SSH key 加到 GitHub，或改 remote：
```bash
git remote set-url origin https://github.com/XiaoCheng123/xiaocheng123.github.io.git
```
