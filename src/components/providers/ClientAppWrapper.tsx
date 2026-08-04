"use client";

import React from "react";
import { UploadProvider } from "@/context/UploadContext";
import GlobalUploadNotifier from "@/components/app/GlobalUploadNotifier";

export default function ClientAppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <UploadProvider>
      {children}
      <GlobalUploadNotifier />
    </UploadProvider>
  );
}
