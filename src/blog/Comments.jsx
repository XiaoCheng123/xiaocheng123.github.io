import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Twikoo 云函数地址（部署在 Vercel）
const TWIKOO_ENV_ID = "https://twikoo-g4818gj5e-xiaochengs-projects.vercel.app";
// Twikoo 前端 SDK
const TWIKOO_CDN = "https://cdn.staticfile.org/twikoo/1.6.39/twikoo.all.min.js";

const loadTwikoo = () =>
  new Promise((resolve, reject) => {
    if (window.twikoo) return resolve(window.twikoo);

    const existed = document.querySelector(`script[src="${TWIKOO_CDN}"]`);
    if (existed) {
      existed.addEventListener("load", () => resolve(window.twikoo));
      existed.addEventListener("error", reject);
      return;
    }

    const s = document.createElement("script");
    s.src = TWIKOO_CDN;
    s.async = true;
    s.onload = () => resolve(window.twikoo);
    s.onerror = reject;
    document.head.appendChild(s);
  });

/**
 * 评论组件（基于 Twikoo，无需登录）
 * - path: 该篇文章的唯一路径，用于隔离不同文章的评论
 */
const Comments = ({ path }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    loadTwikoo()
      .then((twikoo) => {
        if (cancelled || !containerRef.current) return;
        twikoo.init({
          envId: TWIKOO_ENV_ID,
          el: containerRef.current,
          path: path || window.location.pathname,
          lang: "zh-CN",
        });
      })
      .catch(() => {
        if (containerRef.current) {
          containerRef.current.innerHTML =
            '<p style="text-align:center;color:#8a8576;font-size:13px;letter-spacing:0.2em;">评论加载失败，请稍后刷新</p>';
        }
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  return (
    <section className="font-jp">
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
        className="twikoo-jp"
      >
        <div ref={containerRef} id="tcomment" />
      </motion.div>
    </section>
  );
};

export default Comments;
