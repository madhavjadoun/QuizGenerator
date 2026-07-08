'use client';

/**
 * GlobalBackground
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixed, full-viewport, zero-interaction background layer composed of:
 *   1. Base #09090B near-black
 *   2. LightRays WebGL ambient spotlight (top-center, extremely subtle)
 *   3. CSS soft radial spotlight (top-center glow)
 *   4. Dark vignette ring around edges
 *   5. Ultra-subtle purple edge glow
 *   6. SVG film-grain / noise texture (depth)
 *
 * Renders ONLY in dark mode (hidden in light mode via .dark selector in CSS).
 * All layers have pointer-events: none so they never intercept clicks.
 */

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Lazy-load the WebGL component — keeps the server bundle clean
const LightRays = dynamic(() => import('./LightRays'), { ssr: false });

export default function GlobalBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const xPct = e.clientX / window.innerWidth;
      const yPct = e.clientY / window.innerHeight;
      
      // Calculate a very subtle max translation displacement: e.g. -20px to +20px horizontal, -10px to +10px vertical
      const moveX = (xPct - 0.5) * 40;
      const moveY = (yPct - 0.5) * 20;

      containerRef.current.style.setProperty('--spotlight-mx', `${moveX}px`);
      containerRef.current.style.setProperty('--spotlight-my', `${moveY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="global-bg-root dark-only-layer"
    >
      {/* ── Layer 1: WebGL Ambient LightRays ── */}
      <div className="global-bg-rays">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={0.18}
          lightSpread={2.8}
          rayLength={2.8}
          followMouse={false}
          mouseInfluence={0}
          noiseAmount={0.015}
          distortion={0.01}
          fadeDistance={2.2}
          saturation={0.2}
        />
      </div>

      {/* ── Layer 2: CSS Radial Spotlight (top-center, soft glow) ── */}
      <div className="global-bg-spotlight" />

      {/* ── Layer 3: Dark vignette edges ── */}
      <div className="global-bg-vignette" />

      {/* ── Layer 4: Ultra-subtle purple edge glow ── */}
      <div className="global-bg-purple" />

      {/* ── Layer 5: Film grain / noise texture (SVG feTurbulence) ── */}
      <svg
        className="global-bg-grain"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <filter id="film-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.72"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#film-grain)" opacity="0.032" />
      </svg>
    </div>
  );
}
