import React, { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { getPostBySlug } from "./posts";

const BlogPost = () => {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // 按空行切段
  const paragraphs = post.content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#f7f4ec] text-[#1a1a1a] font-jp">
      {/* 顶部导航 */}
      <header className="max-w-2xl mx-auto px-6 pt-12 pb-6 flex items-center justify-between">
        <Link
          to="/blog"
          className="text-xs tracking-[0.4em] text-[#8a8576] hover:text-[#1a1a1a] transition-colors"
        >
          ← 日誌
        </Link>
        <Link
          to="/"
          className="text-xs tracking-[0.4em] text-[#8a8576] hover:text-[#1a1a1a] transition-colors"
        >
          HOME
        </Link>
      </header>

      {/* 文章主体 */}
      <article className="max-w-2xl mx-auto px-6 pt-10 pb-24">
        {/* 标题区 */}
        <div className="text-center">
          <p className="text-xs tracking-[0.5em] text-[#8a8576]">
            {post.date.replace(/\./g, " · ")}
          </p>
          <div className="mt-8 mb-8 flex justify-center">
            <span className="h-px w-10 bg-[#1a1a1a]" />
          </div>
          <h1 className="text-3xl sm:text-4xl leading-relaxed tracking-[0.15em] text-[#1a1a1a]">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="mt-6 text-sm tracking-[0.3em] text-[#8a8576]">
              — {post.subtitle} —
            </p>
          )}
          <p className="mt-6 text-xs tracking-[0.4em] text-[#8a8576]">
            {post.location}
          </p>
        </div>

        {/* 分隔 */}
        <div className="my-16 flex justify-center items-center gap-3">
          <span className="h-px w-12 bg-[#d8d3c4]" />
          <span className="text-[#b8b3a4] text-xs tracking-widest">◇</span>
          <span className="h-px w-12 bg-[#d8d3c4]" />
        </div>

        {/* 正文 */}
        <div className="space-y-7 text-[15px] leading-[2.1] tracking-wide text-[#2a2820]">
          {paragraphs.map((p, i) => {
            // 章节小标题：以"章节"或单字+空格开头并较短的视为标题（这里依据数据结构精确判断）
            const isChapter = /^章节[一二三四五六七八九十]/.test(p) || /^[一二三四五六七八九十][　 ]/.test(p);
            const isDivider = /^[—\-]{3,}$/.test(p);

            if (isDivider) {
              return (
                <div key={i} className="flex justify-center py-2">
                  <span className="h-px w-16 bg-[#d8d3c4]" />
                </div>
              );
            }

            if (isChapter) {
              return (
                <h2
                  key={i}
                  className="pt-6 text-lg tracking-[0.3em] text-[#1a1a1a] text-center"
                >
                  {p}
                </h2>
              );
            }

            return (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            );
          })}
        </div>

        {/* 文末签名 */}
        <div className="mt-20 flex flex-col items-center gap-4">
          <span className="h-px w-10 bg-[#1a1a1a]" />
          <p className="text-xs tracking-[0.5em] text-[#8a8576]">
            記 · XIAOCHENG
          </p>
          <p className="text-xs tracking-[0.4em] text-[#b8b3a4]">
            {post.date}
          </p>
        </div>
      </article>

      {/* 返回 */}
      <footer className="max-w-2xl mx-auto px-6 pb-20 flex justify-center">
        <Link
          to="/blog"
          className="text-xs tracking-[0.4em] text-[#1a1a1a] border-b border-[#1a1a1a] pb-1 hover:text-[#6b5d3a] hover:border-[#6b5d3a] transition-colors"
        >
          ← 返回日誌
        </Link>
      </footer>
    </div>
  );
};

export default BlogPost;
