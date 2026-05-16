import { useEffect, useState } from "react";

/**
 * 综合判定动画偏好：
 * - 用户系统设置 prefers-reduced-motion
 * - 移动端默认降级（樱花数量减半，部分动画简化）
 */
export const useMotionPrefs = () => {
  const [prefs, setPrefs] = useState({
    reducedMotion: false,
    isMobile: false,
  });

  useEffect(() => {
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqMobile = window.matchMedia("(max-width: 640px)");

    const update = () => {
      setPrefs({
        reducedMotion: mqMotion.matches,
        isMobile: mqMobile.matches,
      });
    };

    update();
    mqMotion.addEventListener?.("change", update);
    mqMobile.addEventListener?.("change", update);
    return () => {
      mqMotion.removeEventListener?.("change", update);
      mqMobile.removeEventListener?.("change", update);
    };
  }, []);

  return prefs;
};
