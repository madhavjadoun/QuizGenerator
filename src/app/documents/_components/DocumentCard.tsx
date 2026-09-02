import React from "react";
import Link from "next/link";
import FormattedDateTime from "@/components/shared/FormattedDateTime";

export interface SupabaseDoc {
  id: string;
  title?: string | null;
  file_name: string;
  file_url: string;
  file_size: number;
  created_at: string;
}

interface DocumentCardProps {
  doc: SupabaseDoc;
  displayName: string;
  ext: string;
  chunksCount: number;
  formatBytes: (bytes: number, decimals?: number) => string;
  handlePreview: (doc: SupabaseDoc, e: React.MouseEvent) => void;
  onDeleteClick: (doc: SupabaseDoc) => void;
}

const DocumentCard = React.memo(function DocumentCard({
  doc,
  displayName,
  ext,
  chunksCount,
  formatBytes,
  handlePreview,
  onDeleteClick,
}: DocumentCardProps) {
  return (
    <div
      className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 sm:px-6 py-4 flex flex-col justify-between lg:h-[148px] relative group hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--border-strong)] transition-all duration-300 min-w-0 overflow-hidden"
    >
      {/* Top Row: Ext badge, Filename, Synced status */}
      <div className="space-y-3 sm:space-y-4 min-w-0">
        <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
            <span
              className="w-9 h-5 text-[10px] font-bold uppercase tracking-wider rounded border flex items-center justify-center flex-shrink-0 bg-[var(--bg-2)] border border-[var(--border)] text-[var(--text-3)]"
            >
              {ext}
            </span>
            <span
              className="text-sm sm:text-[15px] font-semibold text-[var(--text-1)] truncate leading-6 min-w-0 tracking-tight"
              title={displayName}
            >
              {displayName}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-[var(--bg-2)] border border-[var(--border)] text-[var(--text-4)] px-1.5 py-0.5 rounded flex-shrink-0 leading-4">
            ✓ Synced
          </span>
        </div>

        {/* Compact Metadata Row */}
        <div className="text-xs sm:text-[13px] font-normal text-[var(--text-4)] flex flex-wrap items-center gap-5 md:pl-[50px] leading-relaxed min-w-0">
          <span className="whitespace-nowrap">{formatBytes(doc.file_size, 0)}</span>
          <span className="whitespace-nowrap">{chunksCount} chunks</span>
          <span className="whitespace-nowrap"><FormattedDateTime date={doc.created_at} /></span>
        </div>
      </div>

      {/* Actions Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 mt-auto border-t border-[var(--border)] w-full min-w-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 md:pl-[50px] min-w-0 flex-1">
          <button
            onClick={(e) => handlePreview(doc, e)}
            className="flex items-center justify-center sm:justify-start gap-1.5 text-[13px] font-semibold text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors group/preview cursor-pointer bg-transparent border-0 p-0 flex-shrink-0"
          >
            <svg className="w-4 h-4 flex-shrink-0 text-[var(--text-4)] group-hover/preview:text-[var(--text-2)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.85}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Preview</span>
          </button>

          <Link
            href={`/chat?docId=${doc.id}`}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 h-8 text-[11px] font-bold btn-premium-shine rounded-[14px] leading-none min-w-0 w-full sm:w-auto"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            <span className="truncate text-[var(--text-inv)]">Generate Quiz</span>
          </Link>
        </div>

        <button
          onClick={() => onDeleteClick(doc)}
          className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-xs flex items-center justify-center text-[var(--text-4)] hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 opacity-100 sm:opacity-0 scale-100 sm:scale-95 sm:group-hover:opacity-100 sm:group-hover:scale-100 transition-all duration-200 cursor-pointer flex-shrink-0 self-end sm:self-auto"
          title="Delete document"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.85}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
});

export default DocumentCard;
