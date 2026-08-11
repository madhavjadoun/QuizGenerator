"use client";

import React, { useEffect } from "react";
import { useUpload } from "@/context/UploadContext";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";

export default function GlobalUploadNotifier() {
  const { toast, clearToast } = useUpload();

  // Auto hide top toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        clearToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed top-4 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-md z-[9999] px-4 py-3.5 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-xl border bg-white/95 text-slate-900 border-slate-200/90 dark:bg-slate-900/95 dark:text-white dark:border-slate-800/90 flex items-start gap-3"
        >
          {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
          {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />}
          {toast.type === "info" && <Loader2 className="w-5 h-5 text-sky-600 dark:text-sky-400 animate-spin shrink-0 mt-0.5" />}

          <div className="flex-1 min-w-0 overflow-hidden">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{toast.title}</h4>
            {toast.message && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed break-words [word-break:break-word]">
                {toast.message}
              </p>
            )}
          </div>

          <button
            onClick={clearToast}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
