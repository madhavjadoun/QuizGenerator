"use client";

import React, { useEffect } from "react";
import { useUpload } from "@/context/UploadContext";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, FileText, Loader2, X, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function GlobalUploadNotifier() {
  const { activeUpload, clearUpload, toast, clearToast } = useUpload();

  // Auto hide toast after 5.3 seconds
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
      {/* ── Top Toast Notification (Light + Dark + Responsive) ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-4 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-md z-[9999] px-4 py-3.5 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-xl border bg-white/95 text-slate-900 border-slate-200/90 dark:bg-slate-900/95 dark:text-white dark:border-slate-800/90 flex items-start gap-3"
          >
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === "info" && <Loader2 className="w-5 h-5 text-sky-600 dark:text-sky-400 animate-spin shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>

            <button
              onClick={clearToast}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Floating Upload Card (Light + Dark + Responsive) ── */}
      <AnimatePresence>
        {activeUpload && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[9998] rounded-2xl p-4 shadow-2xl backdrop-blur-2xl border bg-white/95 text-slate-900 border-slate-200/90 dark:bg-slate-900/95 dark:text-white dark:border-slate-800/90"
          >
            {/* Header: File icon, name, close */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border border-violet-500/20 dark:border-violet-500/30 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <span
                  className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate"
                  title={activeUpload.fileName}
                >
                  {activeUpload.fileName}
                </span>
              </div>
              <button
                onClick={clearUpload}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Dismiss upload status"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status & Progress Bar */}
            <div className="space-y-1.5 my-2.5">
              <div className="flex justify-between text-[11px]">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {activeUpload.status === "uploading" && "Uploading document..."}
                  {activeUpload.status === "processing" && "Processing & OCR Indexing..."}
                  {activeUpload.status === "success" && "Upload complete!"}
                  {activeUpload.status === "error" && "Upload failed"}
                </span>
                <span className="font-mono text-slate-500 dark:text-slate-400">{activeUpload.progress}%</span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full transition-all duration-300 ${
                    activeUpload.status === "error"
                      ? "bg-rose-500"
                      : activeUpload.status === "success"
                      ? "bg-emerald-500"
                      : "bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 dark:from-violet-500 dark:via-indigo-500 dark:to-cyan-400"
                  }`}
                  animate={{ width: `${activeUpload.progress}%` }}
                />
              </div>
            </div>

            {/* Card Footer Actions */}
            {activeUpload.status === "success" && (
              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for quiz
                </span>
                <Link
                  href="/documents"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 hover:underline"
                >
                  Go to Documents <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {activeUpload.status === "error" && (
              <p className="mt-2 text-[11px] text-rose-600 dark:text-rose-400 leading-tight">
                {activeUpload.errorMessage || "Failed to process document."}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
