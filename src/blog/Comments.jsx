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

// SDK 加载超时
const SDK_TIMEOUT_MS = 8000;
// 云函数可达性探测超时（短，快速判定）
const PING_TIMEOUT_MS = 5000;

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);

// 探测 Twikoo 云函数是否可达（国内访问 Vercel 大概率失败）
// 用 GET 请求拉云函数根路径，5 秒内拿到任何响应即视为可达
const pingTwikoo = async () => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), PING_TIMEOUT_MS);
  try {
    // 使用 no-cors 避免 CORS 报错（我们只关心"能不能连上"，不关心响应内容）
    await fetch(TWIKOO_ENV_ID, {
      method: "GET",
      mode: "no-cors",
      cache: "no-store",
      signal: ctrl.signal,
    });
    return true;
  } catch (_) {
    return false;
  } finally {
    clearTimeout(t);
  }
};

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

    (async () => {
      // 1. 先探测云函数可达性
      const reachable = await pingTwikoo();
      if (cancelled) return;
      if (!reachable) {
        setStatus("timeout");
        return;
      }

      // 2. 加载 SDK（带 8s 超时）
      let twikoo;
      try {
        twikoo = await withTimeout(loadTwikoo(), SDK_TIMEOUT_MS);
      } catch (_) {
        if (!cancelled) setStatus("error");
        return;
      }
      if (cancelled || !containerRef.current) return;

      // 3. init
      try {
        const ret = twikoo.init({
          envId: TWIKOO_ENV_ID,
          el: containerRef.current,
          path: path || window.location.pathname,
          lang: "zh-CN",
          onCommentLoaded: () => {
            if (!cancelled) setStatus("ready");
          },
        });
        if (ret && typeof ret.then === "function") {
          ret
            .then(() => !cancelled && setStatus("ready"))
            .catch(() => !cancelled && setStatus("error"));
        } else {
          // 没有 promise 返回，给一个保险超时把状态切到 ready
          setTimeout(() => {
            if (!cancelled) setStatus((cur) => (cur === "loading" ? "ready" : cur));
          }, 3000);
        }
      } catch (_) {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
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
    <div className="pointer-events-auto max-w-md mx-auto px-6 py-10 text-center bg-[#f7f4ec]/95 backdrop-blur-sm border border-[#d8d3c4]">
      <p className="text-xs tracking-[0.5em] text-[#1a1a1a] mb-1">
        關 於 評 論
      </p>
      <p className="text-[10px] tracking-[0.4em] text-[#b8b3a4]">
        ABOUT COMMENTS
      </p>
      <div className="h-px w-10 bg-[#d8d3c4] mx-auto my-5" />

      <div className="text-[13px] leading-[2] text-[#2a2820] tracking-wide text-left sm:text-center">
        <p>评论服务部署于海外节点，</p>
        <p>受网络环境影响，</p>
        <p className="mt-3">
          <span className="text-[#1a1a1a] font-medium">
            国内大陆地区暂无法直接访问。
          </span>
        </p>
        <p className="mt-5 text-[#5a5648]">
          若需留言或查看他人评论，
          <br />
          请切换至 <span className="text-[#6b5d3a]">海外网络</span> 后刷新本页。
        </p>
      </div>

      <div className="h-px w-10 bg-[#d8d3c4] mx-auto my-6" />
      <p className="text-[10px] tracking-[0.4em] text-[#b8b3a4]">
        — 静 候 来 信 —
      </p>
    </div>
  );
};

export default Comments;
