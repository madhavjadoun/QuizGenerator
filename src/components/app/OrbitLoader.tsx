"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function OrbitLoader({ size = 32 }: { size?: number }) {
  const [mounted, setMounted] = useState(false);
  const [animationData, setAnimationData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    setMounted(true);
    import("../../../public/loader.json").then((mod) => {
      setAnimationData(mod.default);
    });
  }, []);

  if (!mounted || !animationData) {
    return (
      <div 
        style={{ width: `${size}px`, height: `${size}px` }} 
        className="flex items-center justify-center" 
        aria-label="Loading"
        role="status"
      >
        <div className="animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" style={{ width: `${size/2}px`, height: `${size/2}px` }} />
      </div>
    );
  }

  return (
    <div
      className="lottie-loader flex items-center justify-center"
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-label="Loading"
      role="status"
    >
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
