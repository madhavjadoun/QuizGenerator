"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/app/AppShell";
import { supabase } from "@/lib/supabase";
import OrbitLoader from "@/components/app/OrbitLoader";

interface QuizAttempt {
  completed: boolean;
  correct: number;
  wrong: number;
  accuracy: number;
  time_taken: number;
  difficulty: string;
  title: string;
  user_answers: Record<string, string>;
}

interface DBQuiz {
  id: string;
  document_id: string;
  created_at: string;
  total_questions: number;
  status: string;
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

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<DBQuiz[]>([]);
  const [docMap, setDocMap] = useState<Record<string, string>>({});
  const [quizToDelete, setQuizToDelete] = useState<DBQuiz | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

  const showToast = (message: string, type: "error" | "success" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch user's documents
      const { data: docs, error: docsError } = await supabase
        .from("documents")
        .select("id, title, file_name")
        .eq("user_id", user.id);

      if (docsError) throw docsError;

      const mapping: Record<string, string> = {};
      (docs || []).forEach(d => {
        mapping[d.id] = d.title || d.file_name || "Untitled Document";
      });
      setDocMap(mapping);

      if (!docs || docs.length === 0) {
        setQuizzes([]);
        return;
      }

      // Fetch quizzes associated with user's documents
      const docIds = docs.map(d => d.id);
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("*, quiz_questions(*)")
        .in("document_id", docIds)
        .order("created_at", { ascending: false });

      if (quizError) throw quizError;
      setQuizzes(quizData || []);
    } catch (err) {
      console.error("Failed to load history:", err);
      showToast("Error loading quiz history.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const parseAttempt = (status: string, fallbackTitle: string): QuizAttempt => {
    if (status && status !== "generated") {
      try {
        const attempt = JSON.parse(status);
        if (attempt && attempt.completed) {
          return {
            completed: true,
            correct: attempt.correct || 0,
            wrong: attempt.wrong || 0,
            accuracy: attempt.accuracy || 0,
            time_taken: attempt.time_taken || 0,
            difficulty: attempt.difficulty || "Medium",
            title: attempt.title || fallbackTitle,
            user_answers: attempt.user_answers || {}
          };
        }
      } catch (e) {
        // status is just a plain string
      }
    }
    return {
      completed: false,
      correct: 0,
      wrong: 0,
      accuracy: 0,
      time_taken: 0,
      difficulty: "Medium",
      title: fallbackTitle,
      user_answers: {}
    };
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return "N/A";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const handleDownload = (quiz: DBQuiz) => {
    const docName = docMap[quiz.document_id] || "Document";
    const fallbackTitle = `${docName} Quiz`;
    const attempt = parseAttempt(quiz.status, fallbackTitle);

    const questionsList = (quiz.quiz_questions || [])
      .sort((a, b) => a.order_index - b.order_index)
      .map((q) => {
        const getAnswerText = (optLetter: string) => {
          if (optLetter === "A") return q.option_a;
          if (optLetter === "B") return q.option_b;
          if (optLetter === "C") return q.option_c;
          return q.option_d;
        };

        const correctAnswer = getAnswerText(q.correct_option);
        return {
          question: q.question,
          options: [q.option_a, q.option_b, q.option_c, q.option_d],
          correctAnswer,
          userAnswer: attempt.user_answers[String(q.order_index)] || "",
          explanation: q.explanation
        };
      });

    const reportData = {
      title: attempt.title,
      docName,
      dateStr: new Date(quiz.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      totalQuestions: quiz.total_questions,
      correctAnswers: attempt.correct,
      wrongAnswers: attempt.wrong,
      accuracy: attempt.accuracy,
      timeTaken: formatTime(attempt.time_taken),
      questions: questionsList
    };

    import("@/utils/pdfGenerator").then((mod) => {
      mod.downloadQuizReport(reportData);
    });
  };

  const triggerDeleteQuiz = async () => {
    if (!quizToDelete) return;
    try {
      setDeleting(true);
      // Delete questions first
      const { error: questionsErr } = await supabase
        .from("quiz_questions")
        .delete()
        .eq("quiz_id", quizToDelete.id);

      if (questionsErr) throw questionsErr;

      // Delete quiz header
      const { error: quizErr } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quizToDelete.id);

      if (quizErr) throw quizErr;

      showToast("Quiz deleted successfully.", "success");
      setQuizzes(prev => prev.filter(q => q.id !== quizToDelete.id));
      setQuizToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("Failed to delete quiz.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShell title="Quiz History" subtitle="Review your past AI quiz attempts and performance.">
      <div className="max-w-7xl mx-auto space-y-7">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <OrbitLoader size={44} />
            <p className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">
              Loading your quiz history...
            </p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="w-full max-w-[560px] mx-auto border border-dashed border-slate-200 dark:border-zinc-700/60 bg-slate-50/50 dark:bg-zinc-900/10 rounded-[18px] py-10 px-6 flex flex-col items-center justify-center text-center animate-in fade-in duration-250 min-h-[220px]">
            <span className="text-3xl mb-3">📋</span>
            <h3 className="text-sm font-semibold text-[var(--text-1)]">No quiz attempts found</h3>
            <p className="text-xs text-[var(--text-3)] mt-1 max-w-[320px] leading-relaxed">
              Generate practice quizzes from your uploaded documents to build history and track accuracy.
            </p>
            <Link
              href="/chat"
              className="mt-5 px-5 py-2.5 bg-[var(--indigo)] hover:bg-[var(--indigo)]/90 text-white rounded-xl text-xs font-bold transition-all shadow hover:shadow-md cursor-pointer inline-flex items-center gap-1.5"
            >
              Generate Quiz
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.map((quiz) => {
              const docName = docMap[quiz.document_id] || "Untitled Document";
              const fallbackTitle = `${docName} Quiz`;
              const attempt = parseAttempt(quiz.status, fallbackTitle);
              const formattedDate = new Date(quiz.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              });

              return (
                <div
                  key={quiz.id}
                  className="glass-card rounded-[18px] p-6 flex flex-col justify-between min-h-[200px] hover:-translate-y-[2px] hover:shadow-lg transition-all duration-200"
                >
                  <div className="space-y-3.5">
                    {/* Header Row */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-0.5">
                        <h4 className="text-[16px] font-bold text-[var(--text-1)] leading-snug">
                          {attempt.title}
                        </h4>
                        <p className="text-[12px] font-medium text-[var(--text-3)] truncate max-w-[280px]">
                          Source: {docName}
                        </p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        attempt.completed 
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}>
                        {attempt.completed ? "Completed" : "Generated"}
                      </span>
                    </div>

                    {/* Stats Matrix */}
                    <div className="grid grid-cols-4 gap-4 bg-[var(--bg-2)]/30 rounded-xl p-3.5 border border-[var(--border)]/50">
                      <div className="space-y-0.5 text-center">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-4)]">MCQs</p>
                        <p className="text-base font-extrabold text-[var(--text-1)]">{quiz.total_questions}</p>
                      </div>
                      <div className="space-y-0.5 text-center">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-4)]">Accuracy</p>
                        <p className={`text-base font-extrabold ${
                          attempt.completed
                            ? attempt.accuracy >= 75
                              ? "text-emerald-500"
                              : attempt.accuracy >= 50
                              ? "text-amber-500"
                              : "text-red-500"
                            : "text-[var(--text-3)]"
                        }`}>
                          {attempt.completed ? `${attempt.accuracy}%` : "N/A"}
                        </p>
                      </div>
                      <div className="space-y-0.5 text-center">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-4)]">Time</p>
                        <p className="text-base font-extrabold text-[var(--text-1)] truncate">
                          {attempt.completed ? formatTime(attempt.time_taken) : "N/A"}
                        </p>
                      </div>
                      <div className="space-y-0.5 text-center">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-4)]">Level</p>
                        <p className="text-base font-extrabold text-[var(--text-1)]">{attempt.difficulty}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-4.5 mt-4 border-t border-[var(--border)]">
                    <span className="text-[11px] font-mono text-[var(--text-4)]">{formattedDate}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/chat?quizId=${quiz.id}&review=true`)}
                        disabled={!attempt.completed}
                        className="px-3.5 py-1.5 rounded-lg border border-[var(--border)] text-xs font-bold text-[var(--text-2)] hover:text-[var(--indigo)] hover:border-[var(--indigo)] transition-all disabled:opacity-30 disabled:hover:text-[var(--text-2)] disabled:hover:border-[var(--border)] cursor-pointer"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => router.push(`/chat?docId=${quiz.document_id}`)}
                        className="px-3.5 py-1.5 rounded-lg bg-[var(--indigo)] text-white hover:bg-[var(--indigo)]/90 text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer"
                      >
                        Retake
                      </button>
                      
                      {/* PDF Report Download */}
                      <button
                        onClick={() => handleDownload(quiz)}
                        disabled={!attempt.completed}
                        className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-2)] text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors cursor-pointer disabled:opacity-30"
                        title="Download PDF Report"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setQuizToDelete(quiz)}
                        className="p-2 rounded-lg border border-red-500/10 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
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
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {quizToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] max-w-[400px] w-full p-6 shadow-xl space-y-6 mx-4 animate-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[var(--text-1)]">Delete Quiz Attempt</h3>
              <p className="text-xs text-[var(--text-3)] leading-relaxed">
                Are you sure you want to delete this quiz history record? This action is permanent and cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setQuizToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 border border-[var(--border)] rounded-lg text-xs font-semibold hover:bg-[var(--bg-2)] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={triggerDeleteQuiz}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {deleting && (
                  <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                <span>Delete Quiz</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-3 rounded-lg shadow-lg border border-zinc-800 dark:border-slate-200 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}
    </AppShell>
  );
}
