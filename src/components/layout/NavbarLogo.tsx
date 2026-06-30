"use client";

import React, { useState, useEffect } from "react";

let globalNavbarAnimationPlayed = false;

export default function NavbarLogo() {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Only run on client mount and check global flag
    if (!globalNavbarAnimationPlayed) {
      globalNavbarAnimationPlayed = true;
      setIsAnimating(true);
      
      // Video is 4 seconds long. End it after 4 seconds to be safe.
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleVideoEnded = () => {
    setIsAnimating(false);
  };

  if (isAnimating) {
    return (
      <div 
        className="relative overflow-visible select-none pointer-events-none" 
        style={{ width: '98px', height: '28px' }}
      >
        <video
          src="/animate_logo.mp4"
          muted
          playsInline
          autoPlay
          onEnded={handleVideoEnded}
          className="absolute max-w-none mix-blend-multiply dark:invert dark:hue-rotate-180 dark:mix-blend-screen"
          style={{
            width: '186.32%',
            height: '367.35%',
            left: '-40.76%',
            top: '-134.7%'
          }}
        />
      </div>
    );
  }

  return (
    <img
      src="/logo-full.png"
      alt="QuizGenerator"
      className="h-8 w-auto object-contain dark:invert dark:hue-rotate-180 select-none pointer-events-none"
      style={{
        maxHeight: '32px'
      }}
    />
  );
}
