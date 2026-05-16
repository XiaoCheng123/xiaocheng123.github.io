import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { posts } from "./posts";
import Sakura from "./Sakura";
import { useMotionPrefs } from "./useMotionPrefs";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.1 + i * 0.12, ease: [0.22, 0.61, 0.36, 1] },
  }),
};

const BlogList = () => {
  const { reducedMotion, isMobile } = useMotionPrefs();
  const [sakuraOn, setSakuraOn] = useState(true);
  const animOn = !reducedMotion;
  const sakuraCount = isMobile ? 7 : 14;

  return (
    <div className="relative min-h-screen bg-[#f7f4ec] text-[#1a1a1a] font-jp overflow-hidden">
      {/* 纸纹背景 */}
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
      <Sakura count={sakuraCount} enabled={animOn && sakuraOn} />

      {/* 顶部 */}
      <header className="relative z-10 max-w-2xl mx-auto px-6 pt-16 sm:pt-20 pb-10">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-xs tracking-[0.4em] text-[#8a8576] hover:text-[#1a1a1a] transition-colors"
          >
            ← HOME
          </Link>
          {animOn && (
            <button
              onClick={() => setSakuraOn((v) => !v)}
              className="text-[10px] tracking-[0.3em] text-[#b8b3a4] hover:text-[#1a1a1a] transition-colors border border-[#d8d3c4] rounded-full px-3 py-1"
              aria-label="toggle sakura"
            >
              {sakuraOn ? "桜 ON" : "桜 OFF"}
            </button>
          )}
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0}
          className="mt-10 flex items-baseline gap-4"
        >
          <h1 className="text-3xl sm:text-4xl tracking-[0.3em] text-[#1a1a1a]">
            日　誌
          </h1>
          <span className="text-[10px] sm:text-xs tracking-[0.3em] text-[#8a8576]">
            NIKKI / JOURNAL
          </span>
        </motion.div>

        {/* 卷轴线：自左向右展开 */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
          style={{ transformOrigin: "left" }}
          className="mt-6 h-px w-24 bg-[#1a1a1a]"
        />

        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={2}
          className="mt-6 text-sm leading-loose text-[#5a5648]"
        >
          记录一些散漫的想法，写给未来的自己。
        </motion.p>
      </header>

      {/* 列表 */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 pb-32">
        <ul className="divide-y divide-[#d8d3c4]">
          {posts.map((post, idx) => (
            <motion.li
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{
                duration: 0.9,
                delay: idx * 0.08,
                ease: [0.22, 0.61, 0.36, 1],
              }}
              className="py-10"
            >
              <Link to={`/blog/${post.slug}`} className="group block">
                {post.cover && (
                  <div className="mb-6 overflow-hidden">
                    <div className="relative w-full aspect-[3/2] bg-[#ece7d8] overflow-hidden">
                      <img
                        src={post.cover}
                        alt={post.title}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                      />
                    </div>
                  </div>
                )}
                <div className="flex items-baseline gap-4 sm:gap-6 text-[10px] sm:text-xs tracking-[0.25em] text-[#8a8576]">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.location}</span>
                </div>
                <h2 className="mt-4 text-xl sm:text-2xl leading-snug text-[#1a1a1a] group-hover:text-[#6b5d3a] transition-colors duration-500">
                  {post.title}
                </h2>
                {post.subtitle && (
                  <p className="mt-2 text-xs sm:text-sm tracking-widest text-[#8a8576]">
                    — {post.subtitle}
                  </p>
                )}
                <p className="mt-4 text-sm leading-loose text-[#5a5648] line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-xs tracking-[0.4em] text-[#1a1a1a]">
                  <span className="relative pb-1">
                    続きを読む
                    <span className="absolute left-0 bottom-0 h-px w-full bg-[#1a1a1a] origin-left scale-x-100 group-hover:scale-x-0 transition-transform duration-500" />
                    <span className="absolute left-0 bottom-0 h-px w-full bg-[#6b5d3a] origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-150" />
                  </span>
                  <span className="transition-transform duration-500 group-hover:translate-x-2">
                    →
                  </span>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      </main>

      <footer className="relative z-10 max-w-2xl mx-auto px-6 pb-16">
        <div className="h-px w-full bg-[#d8d3c4]" />
        <p className="mt-6 text-center text-[10px] sm:text-xs tracking-[0.4em] text-[#8a8576]">
          XIAOCHENG · 静かに、書く
        </p>
      </footer>
    </div>
  );
};

export default BlogList;
