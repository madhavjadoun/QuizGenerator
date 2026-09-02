import React from "react";
import FormattedDateTime from "@/components/shared/FormattedDateTime";

export interface QuizAttempt {
  completed: boolean;
  correct: number;
  wrong: number;
  accuracy: number;
  time_taken: number;
  difficulty: string;
  title: string;
  user_answers: Record<string, string>;
}

export interface DBQuiz {
  id: string;
  document_id: string;
  created_at: string;
  total_questions: number;
  status: string;
  quiz_type?: string;
  quiz_questions: Array<{
    id: string;
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: string;
    explanation: string;
    order_index: number;
  }>;
}

interface QuizCardProps {
  quiz: DBQuiz;
  docName: string;
  router: { push: (href: string) => void };
  parseAttempt: (status: string, fallbackTitle: string) => QuizAttempt;
  formatTime: (seconds: number) => string;
  onDownloadClick: (quiz: DBQuiz) => void;
  onDeleteClick: (quiz: DBQuiz) => void;
}

const QuizCard = React.memo(function QuizCard({
  quiz,
  docName,
  router,
  parseAttempt,
  formatTime,
  onDownloadClick,
  onDeleteClick,
}: QuizCardProps) {
  const fallbackTitle = `${docName} Quiz`;
  const attempt = parseAttempt(quiz.status, fallbackTitle);

  return (
    <div className="border border-[var(--border)] bg-[var(--surface)] rounded-xl p-4 flex flex-col justify-between min-h-[190px] hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--border-strong)] transition-all duration-300 min-w-0 overflow-hidden">
      <div className="space-y-3 min-w-0">
        {/* Header Row */}
        <div className="flex justify-between items-start gap-3 min-w-0">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-sm font-semibold text-[var(--text-1)] tracking-tight">
                Practice Quiz
              </h4>
              <span className="text-[9px] font-mono bg-[var(--bg-2)] text-[var(--text-4)] px-1.5 py-0.5 rounded border border-[var(--border)] font-medium flex-shrink-0">
                #{quiz.id.slice(0, 5).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-[10px] font-medium text-[var(--text-3)] flex items-center gap-1 min-w-0">
                <span className="text-xs flex-shrink-0">📄</span>
                <span className="truncate min-w-0">{docName}</span>
              </p>
              <p className="text-[9px] font-normal text-[var(--text-4)]">
                Created <FormattedDateTime date={quiz.created_at} />
              </p>
            </div>
          </div>

          {/* Completed badge + Type badge */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Quiz Type badge */}
            {(() => {
              const qt = quiz.quiz_type || "mcq";
              const typeMap: Record<string, { label: string; color: string; bg: string; border: string }> = {
                mcq:  { label: "MCQ",        color: "#6366f1", bg: "rgba(99,102,241,0.08)",  border: "rgba(99,102,241,0.25)" },
                tf:   { label: "T/F",        color: "#8b5cf6", bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.25)" },
                fib:  { label: "Fill Blanks", color: "#d97706", bg: "rgba(217,119,6,0.08)",   border: "rgba(217,119,6,0.25)" },
              };
              const t = typeMap[qt] || typeMap["mcq"];
              return (
                <span
                  className="px-1.5 py-0.5 rounded border text-[9px] font-bold select-none"
                  style={{ color: t.color, background: t.bg, borderColor: t.border }}
                >
                  {t.label}
                </span>
              );
            })()}
            <span className="px-1.5 py-0.5 rounded border border-[var(--border)] text-[9px] font-medium text-[var(--text-4)] bg-transparent select-none">
              {attempt.completed ? "Completed" : "Generated"}
            </span>
          </div>
        </div>

        {/* Stats Rows */}
        <div className="border-t border-[var(--border)] pt-3 space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="font-medium text-[var(--text-3)]">Questions</span>
            <span className="font-semibold text-[var(--text-1)] tabular-nums">{quiz.total_questions}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="font-medium text-[var(--text-3)]">Accuracy</span>
            <span className="font-semibold text-[var(--text-1)] tabular-nums">
              {attempt.completed ? `${attempt.accuracy}%` : "--:--"}
            </span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="font-medium text-[var(--text-3)]">Duration</span>
            <span className="font-semibold text-[var(--text-1)] tabular-nums">
              {attempt.completed ? formatTime(attempt.time_taken) : "--:--"}
            </span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="font-medium text-[var(--text-3)]">Difficulty</span>
            <span className="font-semibold text-[var(--text-1)] capitalize">{attempt.difficulty}</span>
          </div>
        </div>

        {/* View Analytics link */}
        {attempt.completed && (
          <button
            onClick={() => router.push(`/chat?quizId=${quiz.id}&review=true`)}
            className="text-[11px] font-medium text-[var(--text-2)] hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
          >
            View Analytics →
          </button>
        )}
      </div>

      {/* Actions Footer */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-1.5 mt-4 pt-3 border-t border-[var(--border)] min-w-0">
        <div className="flex gap-1.5 min-w-0 flex-1">
          {attempt.completed ? (
            <button
              onClick={() => router.push(`/chat?quizId=${quiz.id}&review=true`)}
              className="flex-1 min-w-0 py-1.5 text-center border border-[var(--border)] hover:bg-[var(--bg-2)] text-[11px] font-bold text-[var(--text-2)] rounded-xl transition-all cursor-pointer h-8 flex items-center justify-center"
            >
              Review
            </button>
          ) : (
            <div className="flex-1 min-w-0 text-center py-1.5 text-[11px] font-medium text-[var(--text-3)] italic h-8 flex items-center justify-center border border-dashed border-[var(--border)] rounded-xl px-1">
              Review unavailable
            </div>
          )}

          <button
            onClick={() => router.push(`/chat?docId=${quiz.document_id}`)}
            className="flex-1 min-w-0 py-1.5 text-center text-[11px] font-bold rounded-[14px] transition-all cursor-pointer h-8 flex items-center justify-center gap-1 btn-premium-shine"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            <span className="truncate text-[var(--text-inv)]">Retake</span>
          </button>
        </div>

        <div className="flex gap-1.5 justify-end flex-shrink-0">
          {/* PDF Report Download */}
          <button
            onClick={() => onDownloadClick(quiz)}
            disabled={!attempt.completed}
            className="p-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-2)] text-[var(--text-2)] transition-colors cursor-pointer disabled:opacity-30 group relative w-8 h-8 flex items-center justify-center"
            title="Download PDF Report"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>

            {/* Custom Tooltip */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-zinc-900 text-[10px] text-white rounded font-bold opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 shadow">
              Download Report
            </span>
          </button>

          {/* Delete */}
          <button
            onClick={() => onDeleteClick(quiz)}
            className="p-1.5 rounded-xl border border-[var(--border)] hover:border-red-500/50 hover:bg-red-500/10 text-[var(--text-2)] hover:text-red-500 transition-all cursor-pointer w-8 h-8 flex items-center justify-center"
            title="Delete Quiz"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

export default QuizCard;
