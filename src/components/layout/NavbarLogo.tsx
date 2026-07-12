"use client";

import React, { useState, useEffect } from "react";
import LogoSVG from "./LogoSVG";

// SPA persistence: tracks whether the animation has played since the last hard page refresh
let globalNavbarAnimationPlayed = false;

export default function NavbarLogo() {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (!globalNavbarAnimationPlayed) {
      globalNavbarAnimationPlayed = true;
      setShouldAnimate(true);
    }
  }, []);

  return (
    <div 
      className="relative select-none pointer-events-none flex items-center justify-start"
      style={{ height: '32px', width: 'auto' }}
    >
      <div style={{ marginRight: '4px', flexShrink: 0, height: '32px' }}>
        <LogoSVG
          type="icon"
          animate={shouldAnimate}
          className="h-8 w-auto object-contain"
        />
      </div>
      <span className="text-[15px] font-bold tracking-tight text-[var(--text-1)] leading-none">
        Quiz<span style={{ color: '#0d9488' }}>Gens</span>
      </span>
    </div>
  );
}
