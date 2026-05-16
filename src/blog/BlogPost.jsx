import React, { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { getPostBySlug } from "./posts";
import Sakura from "./Sakura";
import { useMotionPrefs } from "./useMotionPrefs";
import { useShare } from "./useShare";

const ease = [0.22, 0.61, 0.36, 1];

const BlogPost = () => {
  const { slug } = useParams();
  const post = getPostBySlug(slug);
  const { reducedMotion, isMobile } = useMotionPrefs();
  const animOn = !reducedMotion;
  const [sakuraOn, setSakuraOn] = useState(true);

  // 微信/通用社交分享卡片
  useShare(
    post
      ? {
          title: post.shareTitle || post.title,
          desc: post.shareDesc || post.subtitle || post.excerpt,
          cover: post.cover,
        }
      : {}
  );

  // 滚动进度
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.4,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) return <Navigate to="/blog" replace />;

  const paragraphs = post.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="relative min-h-screen bg-[#f7f4ec] text-[#1a1a1a] font-jp overflow-hidden">
      {/* 滚动进度（顶部细线） */}
      <motion.div
        style={{ scaleX, transformOrigin: "left" }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#6b5d3a] z-50"
      />

      {/* 纸纹 */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.06] mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(#000 1px, transparent 1px), radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "3px 3px, 7px 7px",
          backgroundPosition: "0 0, 1px 2px",
        }}
      />

      {/* 樱花 */}
      <Sakura count={isMobile ? 6 : 12} enabled={animOn && sakuraOn} />

      {/* 顶部导航 */}
      <header className="relative z-10 max-w-2xl mx-auto px-6 pt-12 pb-6 flex items-center justify-between">
        <Link
          to="/blog"
          className="text-xs tracking-[0.4em] text-[#8a8576] hover:text-[#1a1a1a] transition-colors"
        >
          ← 日誌
        </Link>
        <div className="flex items-center gap-3">
          {animOn && (
            <button
              onClick={() => setSakuraOn((v) => !v)}
              className="text-[10px] tracking-[0.3em] text-[#b8b3a4] hover:text-[#1a1a1a] transition-colors border border-[#d8d3c4] rounded-full px-3 py-1"
            >
              {sakuraOn ? "桜 ON" : "桜 OFF"}
            </button>
          )}
          <Link
            to="/"
            className="text-xs tracking-[0.4em] text-[#8a8576] hover:text-[#1a1a1a] transition-colors"
          >
            HOME
          </Link>
        </div>
      </header>

      {/* 文章主体 */}
      <article className="relative z-10 max-w-2xl mx-auto px-6 pt-6 pb-24">
        {/* 封面图 */}
        {post.cover && (
          <motion.figure
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease }}
            className="mb-12 sm:mb-16 overflow-hidden"
          >
            <div className="relative w-full aspect-[3/2] bg-[#ece7d8] overflow-hidden">
              <motion.img
                src={post.cover}
                alt={post.title}
                initial={{ scale: 1.06 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.6, ease }}
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
          </motion.figure>
        )}

        {/* 标题区 */}
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
            className="text-[10px] sm:text-xs tracking-[0.5em] text-[#8a8576]"
          >
            {post.date.replace(/\./g, " · ")}
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.3, ease }}
            style={{ transformOrigin: "center" }}
            className="mt-8 mb-8 mx-auto h-px w-10 bg-[#1a1a1a]"
          />

          <motion.h1
            initial={{ opacity: 0, y: 18, letterSpacing: "0.4em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "0.15em" }}
            transition={{ duration: 1.4, delay: 0.4, ease }}
            className="text-2xl sm:text-4xl leading-relaxed text-[#1a1a1a]"
          >
            {post.title}
          </motion.h1>

          {post.subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1, ease }}
              className="mt-6 text-xs sm:text-sm tracking-[0.3em] text-[#8a8576]"
            >
              — {post.subtitle} —
            </motion.p>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2, ease }}
            className="mt-6 text-[10px] sm:text-xs tracking-[0.4em] text-[#8a8576]"
          >
            {post.location}
          </motion.p>
        </div>

        {/* 装饰分隔 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="my-14 sm:my-16 flex justify-center items-center gap-3"
        >
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1.5, ease }}
            style={{ transformOrigin: "right" }}
            className="h-px w-12 bg-[#d8d3c4]"
          />
          <motion.span
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.6, ease }}
            className="text-[#b8b3a4] text-xs tracking-widest inline-block"
          >
            ◇
          </motion.span>
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1.5, ease }}
            style={{ transformOrigin: "left" }}
            className="h-px w-12 bg-[#d8d3c4]"
          />
        </motion.div>

        {/* 正文：段落逐段淡入 */}
        <div className="space-y-7 text-[15px] leading-[2.1] tracking-wide text-[#2a2820]">
          {paragraphs.map((p, i) => {
            const isChapter =
              /^章节[一二三四五六七八九十]/.test(p) ||
              /^[一二三四五六七八九十][　 ]/.test(p);
            const isDivider = /^[—\-]{3,}$/.test(p);

            if (isDivider) {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scaleX: 0 }}
                  whileInView={{ opacity: 1, scaleX: 1 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 1, ease }}
                  style={{ transformOrigin: "center" }}
                  className="flex justify-center py-2"
                >
                  <span className="h-px w-16 bg-[#d8d3c4]" />
                </motion.div>
              );
            }

            if (isChapter) {
              return (
                <motion.h2
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 0.9, ease }}
                  className="pt-6 text-base sm:text-lg tracking-[0.3em] text-[#1a1a1a] text-center"
                >
                  {p}
                </motion.h2>
              );
            }

            return (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{ duration: 0.8, ease }}
                className="whitespace-pre-line"
              >
                {p}
              </motion.p>
            );
          })}
        </div>

        {/* 文末签名 */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1, ease }}
          className="mt-20 flex flex-col items-center gap-4"
        >
          <span className="h-px w-10 bg-[#1a1a1a]" />
          <p className="text-[10px] sm:text-xs tracking-[0.5em] text-[#8a8576]">
            記 · XIAOCHENG
          </p>
          <p className="text-[10px] sm:text-xs tracking-[0.4em] text-[#b8b3a4]">
            {post.date}
          </p>
        </motion.div>
      </article>

      {/* 返回 */}
      <footer className="relative z-10 max-w-2xl mx-auto px-6 pb-20 flex justify-center">
        <Link
          to="/blog"
          className="group relative text-xs tracking-[0.4em] text-[#1a1a1a] pb-1"
        >
          ← 返回日誌
          <span className="absolute left-0 bottom-0 h-px w-full bg-[#1a1a1a] origin-right scale-x-100 group-hover:scale-x-0 transition-transform duration-500" />
          <span className="absolute left-0 bottom-0 h-px w-full bg-[#6b5d3a] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-150" />
        </Link>
      </footer>
    </div>
  );
};

export default BlogPost;
