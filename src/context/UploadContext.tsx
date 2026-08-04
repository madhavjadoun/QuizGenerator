"use client";

import React, { createContext, useContext, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

export interface ActiveUpload {
  fileName: string;
  fileSize: number;
  progress: number;
  status: "uploading" | "processing" | "success" | "error";
  errorTitle?: string;
  errorMessage?: string;
}

interface UploadContextType {
  activeUpload: ActiveUpload | null;
  startUpload: (file: File) => Promise<boolean>;
  clearUpload: () => void;
  toast: { title: string; type: "success" | "error" | "info"; message?: string } | null;
  showToast: (title: string, type: "success" | "error" | "info", message?: string) => void;
  clearToast: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [activeUpload, setActiveUpload] = useState<ActiveUpload | null>(null);
  const [toast, setToast] = useState<{ title: string; type: "success" | "error" | "info"; message?: string } | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (title: string, type: "success" | "error" | "info", message?: string) => {
    setToast({ title, type, message });
  };

  const clearToast = () => {
    setToast(null);
  };

  const clearUpload = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setActiveUpload(null);
  };

  const startUpload = async (file: File): Promise<boolean> => {
    // Clear any previous upload state
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    setActiveUpload({
      fileName: file.name,
      fileSize: file.size,
      progress: 5,
      status: "uploading",
    });

    let currentProgress = 5;
    progressIntervalRef.current = setInterval(() => {
      if (currentProgress < 85) {
        currentProgress += Math.floor(Math.random() * 6) + 3;
        setActiveUpload((prev) =>
          prev ? { ...prev, progress: Math.min(currentProgress, 85), status: currentProgress > 45 ? "processing" : "uploading" } : null
        );
      }
    }, 250);

    try {
      const { data, error } = await supabase.auth.getSession();
      let session = data.session;

      if (error || !session?.access_token || !session?.user?.id) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setActiveUpload({
          fileName: file.name,
          fileSize: file.size,
          progress: 0,
          status: "error",
          errorTitle: "Session Expired",
          errorMessage: "Please sign in again to upload documents.",
        });
        showToast("Session Expired", "error", "Please sign in again.");
        return false;
      }

      // Check if session token needs refresh
      if (session.expires_at && Date.now() / 1000 > session.expires_at - 60) {
        const { data: refreshedData } = await supabase.auth.refreshSession();
        if (refreshedData.session) session = refreshedData.session;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", session.user.id);

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        (process.env.NODE_ENV === "production" ? "https://quizgenerator-1-846v.onrender.com" : "http://127.0.0.1:8000");
      const uploadUrl = `${apiUrl}/documents/upload`;

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = errText;
        try {
          const errObj = JSON.parse(errText);
          if (errObj && typeof errObj === "object" && "detail" in errObj) {
            errMsg = String(errObj.detail);
          }
        } catch {}
        throw new Error(errMsg || `Upload failed with status: ${response.status}`);
      }

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      setActiveUpload({
        fileName: file.name,
        fileSize: file.size,
        progress: 100,
        status: "success",
      });

      const isImage = /\.(png|jpe?g|webp)$/i.test(file.name);
      showToast(
        "Upload Complete 🎉",
        "success",
        `"${file.name}" was ${isImage ? "scanned" : "indexed"} successfully and is ready for quiz generation.`
      );

      // Dispatch global custom event so pages like /documents can auto-refresh their doc list
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("document_uploaded", { detail: { fileName: file.name } }));
      }

      // Auto-dismiss upload widget after 7 seconds
      setTimeout(() => {
        setActiveUpload((prev) => (prev?.status === "success" ? null : prev));
      }, 7000);

      return true;
    } catch (err: unknown) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      const rawMsg = err && typeof err === "object" && "message" in err ? String((err as Record<string, unknown>).message) : String(err);
      setActiveUpload({
        fileName: file.name,
        fileSize: file.size,
        progress: 0,
        status: "error",
        errorTitle: "Upload Failed",
        errorMessage: rawMsg,
      });
      showToast("Upload Failed", "error", rawMsg);
      return false;
    }
  };

  return (
    <UploadContext.Provider
      value={{
        activeUpload,
        startUpload,
        clearUpload,
        toast,
        showToast,
        clearToast,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return context;
}
