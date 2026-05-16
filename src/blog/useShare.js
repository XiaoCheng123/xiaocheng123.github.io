import { useEffect } from "react";

/**
 * 站点根 URL（部署到 GitHub Pages 用户站点）
 */
const SITE_ORIGIN = "https://xiaocheng123.github.io";

/**
 * 设置 / 创建 head 中的 meta 标签
 */
const setMeta = (selector, attrs) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "content") return;
      el.setAttribute(k, v);
    });
    document.head.appendChild(el);
  }
  if (attrs.content !== undefined) {
    el.setAttribute("content", attrs.content);
  }
};

/**
 * 动态加载微信 JS-SDK
 */
const loadWeixinSDK = () =>
  new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(null);
    if (window.wx) return resolve(window.wx);

    const existed = document.querySelector(
      'script[src*="res.wx.qq.com/open/js/jweixin"]'
    );
    if (existed) {
      existed.addEventListener("load", () => resolve(window.wx));
      existed.addEventListener("error", () => resolve(null));
      return;
    }

    const s = document.createElement("script");
    s.src = "https://res.wx.qq.com/open/js/jweixin-1.6.0.js";
    s.async = true;
    s.onload = () => resolve(window.wx);
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });

/**
 * 是否在微信浏览器内
 */
const isWechat = () => {
  if (typeof navigator === "undefined") return false;
  return /micromessenger/i.test(navigator.userAgent);
};

/**
 * 配置分享
 * 说明：
 * - og:* / twitter:* 标签：被微信对话/朋友圈、QQ、Twitter 等抓取卡片时使用，无需鉴权。
 * - wx.updateAppMessageShareData / updateTimelineShareData：在微信内点击右上角分享时使用，
 *   完整生效需要服务端签名（公众号 JSAPI ticket）。本站为静态站点，未做后端签名，
 *   故 SDK 调用属于"尽力而为"——若公众号在 GitHub Pages 域名做了 JS 接口安全域名+签名才会生效。
 *   即便 SDK 不生效，外部抓取（朋友/朋友圈对话卡片预览）仍能依赖 og 标签正常显示。
 */
export const useShare = ({ title, desc, cover, link } = {}) => {
  useEffect(() => {
    if (!title) return;

    const absLink = link || (SITE_ORIGIN + "/#" + (window.location.hash ? window.location.hash.replace(/^#/, "") : ""));
    const absCover = cover
      ? cover.startsWith("http")
        ? cover
        : SITE_ORIGIN + cover
      : SITE_ORIGIN + "/logo.svg";

    // —— 标题
    document.title = title;

    // —— 通用 meta
    setMeta('meta[name="description"]', { name: "description", content: desc || "" });

    // —— Open Graph
    setMeta('meta[property="og:title"]', { property: "og:title", content: title });
    setMeta('meta[property="og:description"]', { property: "og:description", content: desc || "" });
    setMeta('meta[property="og:image"]', { property: "og:image", content: absCover });
    setMeta('meta[property="og:url"]', { property: "og:url", content: absLink });
    setMeta('meta[property="og:type"]', { property: "og:type", content: "article" });
    setMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "Xiaocheng Blog" });

    // —— Twitter
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: desc || "" });
    setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: absCover });

    // —— 微信特定（部分微信预览会读取以下 meta 当作卡片信息）
    setMeta('meta[itemprop="name"]', { itemprop: "name", content: title });
    setMeta('meta[itemprop="description"]', { itemprop: "description", content: desc || "" });
    setMeta('meta[itemprop="image"]', { itemprop: "image", content: absCover });

    // —— 微信 JS-SDK：尝试调用（无签名时不会生效，但不会报错）
    if (isWechat()) {
      loadWeixinSDK().then((wx) => {
        if (!wx) return;

        const shareData = {
          title,
          desc: desc || "",
          link: absLink,
          imgUrl: absCover,
          success() {},
          cancel() {},
        };

        try {
          // 1.4+ 新接口
          wx.ready?.(() => {
            wx.updateAppMessageShareData?.(shareData);
            wx.updateTimelineShareData?.({
              title: `${title}　|　${desc || ""}`.trim(),
              link: absLink,
              imgUrl: absCover,
              success() {},
              cancel() {},
            });
          });

          // 旧接口兼容
          wx.onMenuShareAppMessage?.(shareData);
          wx.onMenuShareTimeline?.({
            title: `${title}　|　${desc || ""}`.trim(),
            link: absLink,
            imgUrl: absCover,
            success() {},
            cancel() {},
          });
        } catch (_) {
          /* noop */
        }
      });
    }
  }, [title, desc, cover, link]);
};
