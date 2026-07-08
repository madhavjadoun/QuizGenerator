"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function DeferredGoogleAnalytics({ gaId }: { gaId: string }) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Defer third-party tracker execution by 2 seconds to optimize TBT and FCP
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!shouldLoad) return null;

  return <GoogleAnalytics gaId={gaId} />;
}
