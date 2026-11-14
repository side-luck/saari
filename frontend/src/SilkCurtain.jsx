import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "@/SilkCurtain.css";

// Self-contained load intro: full-screen silk PNG holds ~1s, then slides right and unmounts.
// Fires window event "saaari:curtain-done" when finished (or immediately when skipped),
// which the hero listens to before starting its entrance animations.
// To remove: delete the <SilkCurtain /> line + import in App.js, then this file and SilkCurtain.css.
const finish = () => {
  window.__curtainDone = true;
  window.dispatchEvent(new Event("saaari:curtain-done"));
};

export default function SilkCurtain() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (window.scrollY >= 120 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setGone(true); finish(); return undefined; }
    const cancel = setTimeout(() => { if (window.scrollY >= 120) { setGone(true); finish(); } }, 180);
    return () => clearTimeout(cancel);
  }, []);

  if (gone) return null;
  return (
    <motion.div
      className="silk-curtain"
      data-testid="silk-curtain"
      initial={{ x: 0 }}
      animate={{ x: "112vw" }}
      transition={{ duration: 0.4, delay: 2, ease: [0.83, 0, 1, 0.58] }}
      onAnimationComplete={() => { setGone(true); finish(); }}
    >
      <img src="/muse/silk-curtain.webp" alt="" draggable="false" onError={() => { setGone(true); finish(); }} />
    </motion.div>
  );
}
