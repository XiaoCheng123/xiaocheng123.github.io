import React, { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * 极简樱花飘落 SVG 动画
 * - 移动端自动减少数量
 * - 尊重 prefers-reduced-motion
 */
const Petal = ({ delay, duration, x, size, drift, rotate }) => {
  return (
    <motion.svg
      initial={{ y: -40, x: 0, opacity: 0, rotate: 0 }}
      animate={{
        y: ["-5vh", "105vh"],
        x: [0, drift, -drift / 2, drift / 1.5, 0],
        opacity: [0, 0.85, 0.85, 0.6, 0],
        rotate: [0, rotate, rotate * 1.5, rotate * 2],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        position: "absolute",
        left: `${x}%`,
        top: 0,
        width: size,
        height: size,
        pointerEvents: "none",
        willChange: "transform, opacity",
      }}
      viewBox="0 0 24 24"
      fill="none"
    >
      {/* 简化花瓣形状 */}
      <path
        d="M12 3 C 14 8, 17 10, 21 12 C 17 14, 14 16, 12 21 C 10 16, 7 14, 3 12 C 7 10, 10 8, 12 3 Z"
        fill="#e8c8c8"
        opacity="0.85"
      />
    </motion.svg>
  );
};

const Sakura = ({ count = 14, enabled = true }) => {
  const petals = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 10 + Math.random() * 10,
      duration: 12 + Math.random() * 10,
      delay: Math.random() * 8,
      drift: 30 + Math.random() * 60,
      rotate: 180 + Math.random() * 360,
    }));
  }, [count]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
    >
      {petals.map((p) => (
        <Petal key={p.id} {...p} />
      ))}
    </div>
  );
};

export default Sakura;
