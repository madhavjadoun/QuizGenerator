"use client";

import React, { useEffect } from "react";
import { useUpload } from "@/context/UploadContext";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, FileText, Loader2, X, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function GlobalUploadNotifier() {
  const { activeUpload, clearUpload, toast, clearToast } = useUpload();

  // Auto hide toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        clearToast();
      }, 5300);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  return (
    <>
      {/* ── Top Toast Notification ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-5 right-5 z-[9999] max-w-md w-full px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10 dark:border-white/10 bg-slate-900/90 text-white flex items-start gap-3"
          >
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === "info" && <Loader2 className="w-5 h-5 text-sky-400 animate-spin shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-100">{toast.title}</h4>
              {toast.message && <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>}
            </div>

            <button
              onClick={clearToast}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Right Persistent Background Upload Card ── */}
      <AnimatePresence>
        {activeUpload && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-[9998] w-80 sm:w-96 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl border border-slate-700/60 bg-slate-900/95 text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-200 truncate" title={activeUpload.fileName}>
                  {activeUpload.fileName}
                </span>
              </div>
              <button
                onClick={clearUpload}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status & Progress Bar */}
            <div className="space-y-1.5 my-2">
              <div className="flex justify-between text-[11px]">
                <span className="font-medium text-slate-300">
                  {activeUpload.status === "uploading" && "Uploading document..."}
                  {activeUpload.status === "processing" && "Processing & OCR Indexing..."}
                  {activeUpload.status === "success" && "Upload complete!"}
                  {activeUpload.status === "error" && "Upload failed"}
                </span>
                <span className="font-mono text-slate-400">{activeUpload.progress}%</span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full transition-all duration-300 ${activeUpload.status === "error"
                      ? "bg-rose-500"
                      : activeUpload.status === "success"
                        ? "bg-emerald-500"
                        : "bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400"
                    }`}
                  animate={{ width: `${activeUpload.progress}%` }}
                />
              </div>
            </div>

            {/* Card Footer Actions */}
            {activeUpload.status === "success" && (
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for quiz
                </span>
                <Link
                  href="/documents"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 hover:underline"
                >
                  Go to Documents <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {activeUpload.status === "error" && (
              <p className="mt-2 text-[11px] text-rose-400 leading-tight">
                {activeUpload.errorMessage || "Failed to process document."}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
