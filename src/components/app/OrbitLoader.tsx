"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import loaderAnimation from "../../../public/loader.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function OrbitLoader({ size = 32 }: { size?: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
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
        animationData={loaderAnimation}
        loop={true}
        autoplay={true}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
