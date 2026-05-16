import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Twikoo 云函数地址（部署在 Vercel）
const TWIKOO_ENV_ID = "https://twikoo-g4818gj5e-xiaochengs-projects.vercel.app";

// Twikoo 前端 SDK CDN（多个降级，国内友好排前面）
const TWIKOO_CDNS = [
  "https://lib.baomitu.com/twikoo/1.6.39/twikoo.all.min.js", // 360 国内 CDN
  "https://cdn.staticfile.org/twikoo/1.6.39/twikoo.all.min.js", // 七牛国内
  "https://cdn.jsdelivr.net/npm/twikoo@1.6.39/dist/twikoo.all.min.js", // jsdelivr 备份
];

// 超时（评论 init 没起来视为失败）
const INIT_TIMEOUT_MS = 8000;

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existed = document.querySelector(`script[data-twikoo="${src}"]`);
    if (existed) {
      existed.addEventListener("load", () => resolve());
      existed.addEventListener("error", () => reject(new Error("script error")));
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.dataset.twikoo = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("script error"));
    document.head.appendChild(s);
  });

// 依次尝试多个 CDN 直到拿到 window.twikoo
const loadTwikoo = async () => {
  if (window.twikoo) return window.twikoo;
  for (const cdn of TWIKOO_CDNS) {
    try {
      await loadScript(cdn);
      if (window.twikoo) return window.twikoo;
    } catch (_) {
      /* try next */
    }
  }
  throw new Error("all CDN failed");
};

/**
 * 评论组件（基于 Twikoo，无需登录）
 * - 国内访问 vercel.app 不稳定，加超时和友好提示
 */
const Comments = ({ path }) => {
  const containerRef = useRef(null);
  // status: loading | ready | timeout | error
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    let timer = null;

    // 超时兜底
    timer = setTimeout(() => {
      if (cancelled) return;
      // 用函数式 setState 拿到最新状态，避免闭包陈旧
      setStatus((cur) => (cur === "ready" ? cur : "timeout"));
    }, INIT_TIMEOUT_MS);

    loadTwikoo()
      .then((twikoo) => {
        if (cancelled || !containerRef.current) return;
        const ret = twikoo.init({
          envId: TWIKOO_ENV_ID,
          el: containerRef.current,
          path: path || window.location.pathname,
          lang: "zh-CN",
          onCommentLoaded: () => {
            if (!cancelled) setStatus("ready");
          },
        });
        // 兼容 init 有/无 Promise 返回值的版本
        if (ret && typeof ret.then === "function") {
          ret
            .then(() => !cancelled && setStatus("ready"))
            .catch(() => !cancelled && setStatus("error"));
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  // 超时 / 失败时清空 Twikoo 自身渲染的 loading 占位
  useEffect(() => {
    if ((status === "timeout" || status === "error") && containerRef.current) {
      containerRef.current.innerHTML = "";
    }
  }, [status]);

  return (
    <section className="font-jp">
      {/* dns-prefetch / preconnect 微优化（仅首次） */}
      <link rel="dns-prefetch" href="//twikoo-g4818gj5e-xiaochengs-projects.vercel.app" />
      <link rel="preconnect" href="https://twikoo-g4818gj5e-xiaochengs-projects.vercel.app" crossOrigin="" />

      {/* 标题分隔 */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1, ease: [0.22, 0.61, 0.36, 1] }}
        className="my-16 flex flex-col items-center gap-4"
      >
        <span className="h-px w-10 bg-[#1a1a1a]" />
        <h3 className="text-base sm:text-lg tracking-[0.4em] text-[#1a1a1a]">
          留　言
        </h3>
        <p className="text-[10px] sm:text-xs tracking-[0.4em] text-[#8a8576]">
          MESSAGE / コメント
        </p>
      </motion.div>

      {/* Twikoo 容器 */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-5% 0px" }}
        transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
        className="twikoo-jp relative min-h-[120px]"
      >
        {/* 失败/超时：直接替换内容，不再保留 Twikoo 的 loading */}
        {(status === "timeout" || status === "error") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="py-10"
          >
            <Notice status={status} />
          </motion.div>
        )}

        {/* 评论容器：失败时隐藏（避免 Twikoo 仍可能塞内容进来） */}
        <div
          ref={containerRef}
          id="tcomment"
          style={{
            display: status === "timeout" || status === "error" ? "none" : "block",
          }}
        />

        {/* 仅 loading 阶段叠加居中提示 */}
        <AnimatePresence>
          {status === "loading" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-start justify-center pt-10 pointer-events-none"
            >
              <Notice status="loading" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

const Notice = ({ status }) => {
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 pt-6">
        <span className="inline-block w-2 h-2 rounded-full bg-[#8a8576] animate-pulse" />
        <p className="text-[11px] tracking-[0.4em] text-[#8a8576]">
          評論加載中…
        </p>
      </div>
    );
  }

  // timeout / error 都给同一种文案
  return (
    <div className="pointer-events-auto max-w-md mx-auto px-6 py-8 text-center bg-[#f7f4ec]/95 backdrop-blur-sm border border-[#d8d3c4]">
      <p className="text-xs tracking-[0.4em] text-[#1a1a1a] mb-3">
        評論加載超時
      </p>
      <div className="h-px w-10 bg-[#d8d3c4] mx-auto my-3" />
      <p className="text-[12px] leading-loose text-[#5a5648] tracking-wide">
        评论服务部署在海外节点，
        <br />
        国内网络访问可能不稳定。
        <br />
        若想留言，可尝试切换网络后刷新本页。
      </p>
      <p className="mt-4 text-[10px] tracking-[0.3em] text-[#b8b3a4]">
        — 致 抱 歉 —
      </p>
    </div>
  );
};

export default Comments;
