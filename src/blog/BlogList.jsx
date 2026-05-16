import React from "react";
import { Link } from "react-router-dom";
import { posts } from "./posts";

const BlogList = () => {
  return (
    <div className="min-h-screen bg-[#f7f4ec] text-[#1a1a1a] font-jp">
      {/* 顶部 */}
      <header className="max-w-2xl mx-auto px-6 pt-20 pb-12">
        <Link
          to="/"
          className="text-xs tracking-[0.4em] text-[#8a8576] hover:text-[#1a1a1a] transition-colors"
        >
          ← HOME
        </Link>
        <div className="mt-10 flex items-baseline gap-4">
          <h1 className="text-3xl tracking-[0.3em] text-[#1a1a1a]">日　誌</h1>
          <span className="text-xs tracking-[0.3em] text-[#8a8576]">
            NIKKI / JOURNAL
          </span>
        </div>
        <div className="mt-6 h-px w-16 bg-[#1a1a1a]" />
        <p className="mt-6 text-sm leading-loose text-[#5a5648]">
          记录一些散漫的想法，写给未来的自己。
        </p>
      </header>

      {/* 列表 */}
      <main className="max-w-2xl mx-auto px-6 pb-32">
        <ul className="divide-y divide-[#d8d3c4]">
          {posts.map((post) => (
            <li key={post.slug} className="py-10">
              <Link to={`/blog/${post.slug}`} className="group block">
                <div className="flex items-baseline gap-6 text-xs tracking-[0.25em] text-[#8a8576]">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.location}</span>
                </div>
                <h2 className="mt-4 text-2xl leading-snug text-[#1a1a1a] group-hover:text-[#6b5d3a] transition-colors">
                  {post.title}
                </h2>
                {post.subtitle && (
                  <p className="mt-2 text-sm tracking-widest text-[#8a8576]">
                    — {post.subtitle}
                  </p>
                )}
                <p className="mt-4 text-sm leading-loose text-[#5a5648] line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-6 inline-block text-xs tracking-[0.4em] text-[#1a1a1a] border-b border-[#1a1a1a] pb-1">
                  続きを読む
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <footer className="max-w-2xl mx-auto px-6 pb-16">
        <div className="h-px w-full bg-[#d8d3c4]" />
        <p className="mt-6 text-center text-xs tracking-[0.4em] text-[#8a8576]">
          XIAOCHENG · 静かに、書く
        </p>
      </footer>
    </div>
  );
};

export default BlogList;
