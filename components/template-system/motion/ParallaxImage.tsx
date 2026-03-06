import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface ParallaxImageProps {
  src: string;
  alt?: string;
  className?: string;
  /** Max translate-y in px. Default 20. Keep small for premium feel. */
  strength?: number;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

/**
 * Subtle parallax image — enabled only on `lg+` and when motion is allowed.
 *
 * Uses Framer Motion `useScroll` + `useTransform` for GPU-friendly animation.
 * Falls back to a regular `<img>` on mobile or when `prefers-reduced-motion`.
 */
export function ParallaxImage({
  src,
  alt = "",
  className = "",
  strength = 20,
}: ParallaxImageProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength]);

  // Reduced motion or will be hidden on mobile — just render a plain img
  if (prefersReduced) {
    return (
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <>
      {/* Mobile: plain image (hidden on lg+) */}
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full object-cover lg:hidden ${className}`}
      />
      {/* Desktop: parallax (hidden below lg) */}
      <div
        ref={containerRef}
        className="absolute inset-0 hidden lg:block overflow-hidden"
      >
        <motion.img
          src={src}
          alt={alt}
          style={{
            y,
            top: `-${strength}px`,
            height: `calc(100% + ${strength * 2}px)`,
          }}
          className={`absolute inset-x-0 w-full object-cover ${className}`}
        />
      </div>
    </>
  );
}
