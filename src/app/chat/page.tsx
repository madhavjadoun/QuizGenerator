"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/app/AppShell";
import { supabase } from "@/lib/supabase";
import FormattedDateTime from "@/components/shared/FormattedDateTime";
import Button from "@/components/ui/Button";

interface DBQuestion {
  order_index: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string;
}

interface MCQQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface DocumentItem {
  id: string;
  title: string;
  file_size?: number;
  file_name?: string;
  created_at?: string;
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function getDocumentDisplayName(doc?: DocumentItem) {
  return doc?.title?.trim() || doc?.file_name || "Document";
}

export default function QuizPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [docValidationError, setDocValidationError] = useState(false);
  const [mcqValidationError, setMcqValidationError] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

  // New input source states
  const [inputSource, setInputSource] = useState<"pdf" | "image" | "text">("pdf");
  const [pastedText, setPastedText] = useState<string>("");

  // New SaaS Polishing States
  const [currentQuizId, setCurrentQuizId] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const [quizType, setQuizType] = useState<string>("mcq");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeTaken, setTimeTaken] = useState<number>(0);

  // Daily credit system
  const [creditsInfo, setCreditsInfo] = useState<{
    used: number;
    limit: number;
    remaining: number;
    resetAt: string;
  } | null>(null);
  const [isCreditsError, setIsCreditsError] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const showToast = (message: string, type: "error" | "success" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };



  const apiUrl = (() => {
    let url = process.env.NEXT_PUBLIC_API_URL || 
      (process.env.NODE_ENV === "production" 
        ? "https://quizgenerator-production.up.railway.app" 
        : "http://127.0.0.1:8000");
    if (url.includes("localhost")) {
      url = url.replace("localhost", "127.0.0.1");
    }
    return url;
  })();

  // Fetch user's documents on mount
  useEffect(() => {
    async function fetchDocs() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user || !session) return;
        const token = session.access_token;

        // Load default settings (MCQ count)
        const storedCount = localStorage.getItem(`settings_mcq_count_${user.id}`);
        if (storedCount) {
          setNumQuestions(parseInt(storedCount) || 10);
        }

        // Load cached credits for this specific user
        const cached = localStorage.getItem(`cached_credits_info_${user.id}`);
        if (cached) {
          try {
            setCreditsInfo(JSON.parse(cached));
          } catch (e) {
            if (process.env.NODE_ENV !== "production") {
              console.warn("Failed to parse cached credits:", e);
            }
          }
        }

        // Fetch documents promise
        const fetchDocsPromise = supabase
          .from("documents")
          .select("id, title, file_name, file_size, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        // Fetch credits status promise
        const fetchCreditsPromise = (async () => {
          try {
            if (token) {
              const credRes = await fetch(`${apiUrl}/credits/status`, {
                headers: { "Authorization": `Bearer ${token}` },
                cache: "no-store",
              });
              if (credRes.ok) {
                const credData = await credRes.json();
                const freshCredits = {
                  used:      credData.credits_used,
                  limit:     credData.credits_limit,
                  remaining: credData.credits_remaining,
                  resetAt:   credData.reset_at,
                };
                setCreditsInfo(freshCredits);
                localStorage.setItem(`cached_credits_info_${user.id}`, JSON.stringify(freshCredits));
              }
            }
          } catch (credErr) {
            if (process.env.NODE_ENV !== "production") {
              console.warn("Failed to fetch credit status:", credErr);
            }
          }
        })();

        // Await both parallel executions
        const [docsResult] = await Promise.all([fetchDocsPromise, fetchCreditsPromise]);

        if (docsResult.error) throw docsResult.error;
        const filteredDocs = (docsResult.data || []).filter(
          (d: DocumentItem) => !(d.file_name || "").toLowerCase().endsWith(".txt") && !(d.file_name || "").includes("pasted_text_")
        );
        setDocuments(filteredDocs);

        // Check if docId query param exists to auto-select it
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const docIdParam = params.get("docId");
          if (docIdParam) {
            setSelectedDocId(docIdParam);
            const matchedDoc = (docsResult.data || []).find((d: DocumentItem) => d.id === docIdParam);
            if (matchedDoc) {
              const filename = matchedDoc.file_name || "";
              if (filename.toLowerCase().endsWith(".txt") || filename.includes("pasted_text_")) {
                setInputSource("text");
              } else {
                const isImg = /\.(png|jpe?g|webp)$/i.test(filename);
                setInputSource(isImg ? "image" : "pdf");
              }
            }
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to load documents:", err);
        }
        setErrorMsg("Failed to load documents. Please check your connection.");
      }
    }

    fetchDocs();
  }, [apiUrl]);

  // Load existing quiz from URL query parameters (for review mode)
  useEffect(() => {
    async function loadQuizFromUrl() {
      if (typeof window === "undefined" || documents.length === 0) return;
      const params = new URLSearchParams(window.location.search);
      const quizIdParam = params.get("quizId");
      const reviewParam = params.get("review");

      if (quizIdParam) {
        try {
          setGeneratingQuiz(true);
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          if (!token) {
            throw new Error("Unable to retrieve authentication token. Please sign in again.");
          }

          const res = await fetch(`${apiUrl}/quiz/${quizIdParam}`, {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
            cache: "no-store",
          });

          if (!res.ok) {
            let errMsg = "Server failed to load quiz details.";
            try {
              const contentType = res.headers.get("content-type");
              if (contentType && contentType.includes("application/json")) {
                const errData = await res.json();
                errMsg = errData.detail || errMsg;
              } else {
                const text = await res.text();
                errMsg = text || errMsg;
              }
            } catch {}
            throw new Error(errMsg);
          }

          let quizData;
          try {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              quizData = await res.json();
            } else {
              const text = await res.text();
              throw new Error(text || "Invalid response format received from server.");
            }
          } catch (err) {
            const errObj = err as Error;
            throw new Error(errObj.message || "Failed to parse quiz response.");
          }

          const dbQuestions = (quizData.quiz_questions || []).sort((a: DBQuestion, b: DBQuestion) => a.order_index - b.order_index);
          const mappedQuestions = dbQuestions.map((q: DBQuestion) => ({
            question: q.question,
            options: [q.option_a, q.option_b, q.option_c, q.option_d],
            correctAnswer: q.correct_option === "A" ? q.option_a : q.correct_option === "B" ? q.option_b : q.correct_option === "C" ? q.option_c : q.option_d,
            explanation: q.explanation
          }));

          setQuestions(mappedQuestions);
          setCurrentQuizId(quizIdParam);
          setSelectedDocId(quizData.document_id);
          const matchedDoc = documents.find(d => d.id === quizData.document_id);
          if (matchedDoc) {
            const filename = matchedDoc.file_name || "";
            if (filename.toLowerCase().endsWith(".txt") || filename.includes("pasted_text_")) {
              setInputSource("text");
            } else {
              const isImg = /\.(png|jpe?g|webp)$/i.test(filename);
              setInputSource(isImg ? "image" : "pdf");
            }
          }

          if (quizData.status && quizData.status !== "generated") {
            try {
              const attempt = JSON.parse(quizData.status);
              if (attempt && attempt.completed) {
                setUserAnswers(attempt.user_answers || {});
                setScore(attempt.correct || 0);
                setDifficulty(attempt.difficulty || "Medium");
                setTimeTaken(attempt.time_taken || 0);
                if (reviewParam === "true") {
                  setSubmitted(true);
                }
              }
            } catch (e) {
              if (process.env.NODE_ENV !== "production") {
                console.error("Failed to parse quiz status JSON:", e);
              }
            }
          }
        } catch (err) {
          if (process.env.NODE_ENV !== "production") {
            console.error("Failed to load quiz from URL:", err);
          }
          showToast("Failed to load quiz.", "error");
        } finally {
          setGeneratingQuiz(false);
        }
      }
    }
    loadQuizFromUrl();
  }, [documents, apiUrl]);

  // Trigger quiz generation from selected PDF
  const handleGenerateQuiz = async () => {
    if (generatingQuiz) return;
    if (creditsInfo !== null && creditsInfo.remaining === 0) {
      setShowLimitModal(true);
      return;
    }
    setDocValidationError(false);
    setMcqValidationError(false);
    setErrorMsg(null);
    setIsCreditsError(false);

    let hasError = false;
    if (inputSource === "text") {
      const textCharCount = pastedText.replace(/\r?\n/g, "").length;
      if (!pastedText || pastedText.trim().length === 0) {
        setErrorMsg("Please paste some text before generating a quiz.");
        hasError = true;
      } else if (textCharCount < 300) {
        setErrorMsg("Please enter at least 300 characters.");
        hasError = true;
      } else if (textCharCount > 6000) {
        setErrorMsg("Maximum limit is 6000 characters.");
        hasError = true;
      }
    } else {
      if (!selectedDocId) {
        setDocValidationError(true);
        setErrorMsg("Please select a document before generating a quiz.");
        hasError = true;
      }
    }

    if (numQuestions < 1) {
      setMcqValidationError(true);
      if (!hasError) {
        setErrorMsg("Please select a number of questions greater than 0.");
      } else {
        setErrorMsg("Please select a document and enter a number of questions greater than 0.");
      }
      hasError = true;
    }

    if (hasError) return;

    setGeneratingQuiz(true);
    setQuestions([]);
    setUserAnswers({});
    setSubmitted(false);
    setStartTime(null);
    setTimeTaken(0);
    showToast("Generating your quiz...", "success");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        throw new Error("Unable to retrieve authentication token. Please sign in again.");
      }

      const endpoint = inputSource === "text" ? "/quiz/text" : "/quiz/generate";
      const payload = inputSource === "text" ? {
        text: pastedText,
        num_questions: numQuestions,
        quiz_type: quizType,
        difficulty: difficulty,
      } : {
        document_id: selectedDocId,
        num_questions: numQuestions,
        quiz_type: quizType,
        difficulty: difficulty,
      };

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let data: { detail?: string; questions?: { question: string; options: string[]; correct: string; explanation: string }[]; quiz_id?: string; document_id?: string; credits_remaining?: number } | null = null;
      try {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(text || `Request failed with status ${res.status}`);
        }
      } catch (err) {
        const errObj = err as Error;
        throw new Error(errObj.message || "Failed to generate quiz due to invalid server response.");
      }

      // Handle 402 Insufficient Credits specifically
      if (res.status === 402) {
        // Refresh credits state so the badge updates
        if (data?.detail) {
          // Extract remaining from error detail if possible, else refetch
          try {
            const { data: { session: s2 } } = await supabase.auth.getSession();
            if (s2?.access_token) {
              const credRes = await fetch(`${apiUrl}/credits/status`, {
                headers: { "Authorization": `Bearer ${s2.access_token}` },
                cache: "no-store",
              });
              if (credRes.ok) {
                const credData = await credRes.json();
                const fresh = { used: credData.credits_used, limit: credData.credits_limit, remaining: credData.credits_remaining, resetAt: credData.reset_at };
                setCreditsInfo(fresh);
                localStorage.setItem(`cached_credits_info_${s2.user.id}`, JSON.stringify(fresh));
              }
            }
          } catch {/* silent */}
        }
        setIsCreditsError(true);
        setShowLimitModal(true);
        throw new Error(data?.detail || "You have run out of daily credits.");
      }

      if (!res.ok || !data || !data.questions) {
        throw new Error(data?.detail || "Quiz generation failed.");
      }

      // Map correct to correctAnswer to match frontend's type/state expectations
      const formattedQuestions = data.questions.map((q: { question: string; options: string[]; correct: string; explanation: string }) => ({
        ...q,
        correctAnswer: q.correct
      }));

      setQuestions(formattedQuestions);
      setCurrentQuizId(data.quiz_id || "");

      // If generated from pasted text, refresh documents list and select the new doc
      if (inputSource === "text" && data.document_id && session?.user) {
        setSelectedDocId(data.document_id);
        const { data: refreshedDocs } = await supabase
          .from("documents")
          .select("id, title, file_name, file_size, created_at")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
        if (refreshedDocs) {
          const filteredRefreshed = refreshedDocs.filter(
            (d: DocumentItem) => !(d.file_name || "").toLowerCase().endsWith(".txt") && !(d.file_name || "").includes("pasted_text_")
          );
          setDocuments(filteredRefreshed);
        }
      }

      // Update credits badge optimistically from API response
      const remainingCredits = data.credits_remaining;
      if (typeof remainingCredits === "number") {
        setCreditsInfo(prev => {
          if (!prev) return null;
          const updated = {
            ...prev,
            remaining: remainingCredits,
            used: prev.limit - remainingCredits,
          };
          supabase.auth.getSession().then(({ data: { session: s3 } }) => {
            if (s3?.user) {
              localStorage.setItem(`cached_credits_info_${s3.user.id}`, JSON.stringify(updated));
            }
          });
          return updated;
        });
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Quiz error:", err);
      }
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleSelectOption = (qIdx: number, option: string) => {
    if (submitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [qIdx]: option,
    }));
  };

  const handleSubmitQuiz = async () => {
    // Calculate score
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setSubmitted(true);

    const timeTakenSec = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    setTimeTaken(timeTakenSec);

    // Save attempt to backend
    if (currentQuizId) {
      try {
        // Convert numeric keys to string for consistent JSON serialization
        const stringifiedAnswers: Record<string, string> = {};
        Object.entries(userAnswers).forEach(([k, v]) => {
          stringifiedAnswers[String(k)] = v;
        });

        const docTitle = documents.find(d => d.id === selectedDocId)?.title 
          || documents.find(d => d.id === selectedDocId)?.file_name 
          || "Quiz";

        const attemptData = {
          completed: true,
          correct: correctCount,
          wrong: questions.length - correctCount,
          accuracy: Math.round((correctCount / questions.length) * 100),
          time_taken: timeTakenSec,
          difficulty: difficulty,
          title: `${docTitle} — Practice Quiz`,
          user_answers: stringifiedAnswers
        };

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          throw new Error("Unable to retrieve authentication token. Please sign in again.");
        }

        // Call backend API /quiz/submit to update the quiz securely with service role key after verifying ownership
        const submitRes = await fetch(`${apiUrl}/quiz/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            quiz_id: currentQuizId,
            status: JSON.stringify(attemptData),
            total_questions: questions.length,
          }),
        });

        if (!submitRes.ok) {
          let errMsg = "Server failed to save quiz attempt.";
          try {
            const contentType = submitRes.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const errData = await submitRes.json();
              errMsg = errData.detail || errMsg;
            } else {
              const text = await submitRes.text();
              errMsg = text || errMsg;
            }
          } catch {}
          throw new Error(errMsg);
        }

        showToast("Quiz submitted & saved to history!", "success");
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to save quiz attempt:", err);
        }
        showToast("Failed to persist quiz results to history.", "error");
      }
    } else {
      showToast("Quiz completed! (No quiz ID — results not persisted.)", "error");
    }
  };

  const handleDownloadReport = () => {
    const totalQ = questions.length;
    const formatTimeTaken = (sec: number) => {
      if (!sec) return "N/A";
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };
    
    const reportData = {
      title: `${selectedDoc?.title || "Quiz"} - Practice`,
      docName: selectedDoc?.title || selectedDoc?.file_name || "Document",
      dateStr: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      totalQuestions: totalQ,
      correctAnswers: score,
      wrongAnswers: totalQ - score,
      accuracy: Math.round((score / totalQ) * 100),
      timeTaken: formatTimeTaken(timeTaken),
      quizType: quizType,
      questions: questions.map((q, idx) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswers[idx] || "",
        explanation: q.explanation
      }))
    };
    
    import("@/utils/pdfGenerator").then((mod) => {
      mod.downloadQuizReport(reportData);
    });
  };

  const selectedDoc = documents.find(d => d.id === selectedDocId);
  const selectedDocName = getDocumentDisplayName(selectedDoc);

  const pastedTextCharCount = pastedText.replace(/\r?\n/g, "").length;

  const isImageFile = (filename: string) => {
    return /\.(png|jpe?g|webp)$/i.test(filename);
  };

  const filteredDocuments = documents.filter(doc => {
    const filename = doc.file_name || "";
    if (inputSource === "pdf") {
      return filename.toLowerCase().endsWith(".pdf") || !isImageFile(filename);
    } else if (inputSource === "image") {
      return isImageFile(filename);
    }
    return false;
  });

  return (
    <AppShell title="Quiz Generator" subtitle="Generate AI-powered quizzes from your uploaded PDFs.">
      <div className="max-w-7xl mx-auto px-0 sm:px-2 lg:px-8 py-2 sm:py-4 lg:py-8 w-full animate-in fade-in slide-in-from-bottom-3 duration-250 space-y-6 min-w-0">
        
        {/* Setup Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] shadow-sm w-full max-w-[1180px] mx-auto hover:-translate-y-[2px] hover:shadow-lg transition-all duration-250 p-4 sm:p-5 lg:p-7 rounded-[18px]">
          
          {/* Card header row: title + credit badge */}
          <div 
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0" 
            style={{ 
              marginBottom: (creditsInfo !== null && (creditsInfo.remaining === 0 || (numQuestions > 0 && numQuestions > creditsInfo.remaining))) ? "10px" : "24px" 
            }}
          >
            <h3 className="text-card-label text-[var(--text-1)] flex-shrink-0">Configure Quiz</h3>
            {creditsInfo !== null && (
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <span className="text-xs font-medium text-[var(--text-4)] flex-shrink-0">Daily Credits</span>
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full min-w-0 tabular-nums"
                  style={{
                    background: creditsInfo.remaining === 0
                      ? "rgba(244,63,94,0.1)"
                      : creditsInfo.remaining <= 10
                      ? "rgba(251,191,36,0.12)"
                      : "rgba(99,102,241,0.1)",
                    color: creditsInfo.remaining === 0
                      ? "#f43f5e"
                      : creditsInfo.remaining <= 10
                      ? "#d97706"
                      : "var(--indigo)",
                    border: `1px solid ${creditsInfo.remaining === 0 ? "rgba(244,63,94,0.25)" : creditsInfo.remaining <= 10 ? "rgba(251,191,36,0.3)" : "rgba(99,102,241,0.2)"}`,
                  }}
                >
                  {/* Bolt icon */}
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  {creditsInfo.remaining} / {creditsInfo.limit} left
                </span>
              </div>
            )}
          </div>

          {creditsInfo !== null && (creditsInfo.remaining === 0 || (numQuestions > 0 && numQuestions > creditsInfo.remaining)) && (
            <div className="flex justify-center animate-in fade-in duration-200" style={{ marginBottom: "16px" }}>
              <div 
                className="flex items-start sm:items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border text-xs font-bold shadow-sm max-w-full"
                style={{
                  backgroundColor: "rgba(251, 191, 36, 0.06)",
                  borderColor: "rgba(251, 191, 36, 0.25)",
                  color: "#d97706"
                }}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="break-words text-center sm:text-left">
                  {creditsInfo.remaining === 0 
                    ? "Only 0 credits left today. Please come back tomorrow." 
                    : `Only ${creditsInfo.remaining} credit${creditsInfo.remaining !== 1 ? "s" : ""} left today.`
                  }
                </span>
              </div>
            </div>
          )}
          
          {/* Input Source toggle row */}
          <div className="w-full mb-5">
            <label className="text-card-label block leading-none" style={{ marginBottom: "10px", fontSize: "11px" }}>Input Source</label>
            <div className="flex rounded-[12px] border border-[var(--border)] overflow-hidden" style={{ height: "48px", maxWidth: "450px" }}>
              {([
                {
                  value: "pdf",
                  label: "PDF",
                  icon: (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  )
                },
                {
                  value: "image",
                  label: "Image",
                  icon: (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  )
                },
                {
                  value: "text",
                  label: "Paste Text",
                  icon: (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  )
                },
              ] as const).map((opt, i) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={generatingQuiz || (creditsInfo !== null && creditsInfo.remaining === 0)}
                  onClick={() => {
                    setInputSource(opt.value);
                    setSelectedDocId("");
                    setDocValidationError(false);
                    setErrorMsg(null);
                  }}
                  className={`flex-1 text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 ${
                    i > 0 ? "border-l border-[var(--border)]" : ""
                  } ${
                    inputSource === opt.value
                      ? "bg-[var(--text-1)] text-[var(--text-inv)]"
                      : "bg-[var(--surface)] text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--bg-2)]"
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {inputSource === "text" ? (
            /* Paste Text Input area */
            <div className="w-full space-y-2 animate-in fade-in duration-200">
              <label className="text-card-label block leading-none" style={{ marginBottom: "10px", fontSize: "11px" }}>Paste Text</label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your notes, article, documentation, ChatGPT response, or any text here..."
                disabled={generatingQuiz || (creditsInfo !== null && creditsInfo.remaining === 0)}
                className="w-full min-h-[160px] max-h-[400px] border border-[var(--border)] focus:border-[var(--indigo)] focus:ring-2 focus:ring-[var(--indigo)]/10 bg-[var(--surface)] text-[15px] font-medium text-[var(--text-1)] focus:outline-none transition-all duration-250 p-4"
                style={{
                  borderRadius: "14px",
                  resize: "vertical",
                  whiteSpace: "pre-wrap",
                }}
              />
              <div className="flex justify-between items-center text-xs font-semibold text-[var(--text-4)] px-1">
                <div>
                  {pastedTextCharCount > 0 && pastedTextCharCount < 300 && (
                    <span className="text-red-500">Please enter at least 300 characters.</span>
                  )}
                  {pastedTextCharCount > 6000 && (
                    <span className="text-red-500">Maximum limit is 6000 characters.</span>
                  )}
                </div>
                <div className={`${pastedTextCharCount < 300 || pastedTextCharCount > 6000 ? "text-red-500" : ""}`}>
                  {pastedTextCharCount} / 6000 characters
                </div>
              </div>
            </div>
          ) : (
            /* Row 1: Document — full width so name is never clipped */
            <div className="w-full animate-in fade-in duration-200">
              <label className="text-card-label block leading-none" style={{ marginBottom: "10px", fontSize: "11px" }}>Document</label>
              <div className="relative group/select">
                <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-4)] flex items-center" style={{ left: "16px" }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <select
                  value={selectedDocId}
                  disabled={generatingQuiz || (creditsInfo !== null && creditsInfo.remaining === 0)}
                  onChange={(e) => {
                    setSelectedDocId(e.target.value);
                    setDocValidationError(false);
                    setErrorMsg(null);
                  }}
                  className={`w-full border ${
                    docValidationError
                      ? "border-red-500 ring-2 ring-red-500/15"
                      : "border-[var(--border)] focus:border-[var(--indigo)] focus:ring-2 focus:ring-[var(--indigo)]/10"
                  } bg-[var(--surface)] text-[15px] font-semibold text-[var(--text-1)] focus:outline-none transition-all duration-250 cursor-pointer hover:border-slate-300 dark:hover:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                  style={{ height: "48px", borderRadius: "12px", paddingLeft: "44px", paddingRight: "44px", appearance: "none", WebkitAppearance: "none", MozAppearance: "none" }}
                >
                  <option value="">Select a document...</option>
                  {filteredDocuments.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.title}
                    </option>
                  ))}
                </select>
                <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-4)] group-focus-within/select:rotate-180 transition-transform duration-250" style={{ right: "16px" }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Row 2: Controls — Quiz Type | Difficulty | Questions | Generate */}
          <div className="mt-4 flex flex-wrap gap-3 items-end w-full">

            {/* Quiz Type Toggle */}
            <div className="flex-1" style={{ minWidth: "180px" }}>
              <label className="text-card-label block leading-none" style={{ marginBottom: "10px", fontSize: "11px" }}>Quiz Type</label>
              <div className="flex rounded-[12px] border border-[var(--border)] overflow-hidden" style={{ height: "48px" }}>
                {([
                  { value: "mcq", label: "MCQ" },
                  { value: "tf",  label: "T / F" },
                  { value: "fib", label: "Fill" },
                ] as const).map((opt, i) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={generatingQuiz || (creditsInfo !== null && creditsInfo.remaining === 0)}
                    onClick={() => setQuizType(opt.value)}
                    className={`flex-1 text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      i > 0 ? "border-l border-[var(--border)]" : ""
                    } ${
                      quizType === opt.value
                        ? "bg-[var(--text-1)] text-[var(--text-inv)]"
                        : "bg-[var(--surface)] text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--bg-2)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="flex-shrink-0" style={{ width: "140px" }}>
              <label className="text-card-label block leading-none" style={{ marginBottom: "10px", fontSize: "11px" }}>Difficulty</label>
              <div className="relative group/select">
                <select
                  value={difficulty}
                  disabled={generatingQuiz || (creditsInfo !== null && creditsInfo.remaining === 0)}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full border border-[var(--border)] focus:border-[var(--indigo)] focus:ring-2 focus:ring-[var(--indigo)]/10 bg-[var(--surface)] text-[15px] font-semibold text-[var(--text-1)] focus:outline-none transition-all duration-250 cursor-pointer hover:border-slate-300 dark:hover:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ height: "48px", borderRadius: "12px", paddingLeft: "14px", paddingRight: "40px", appearance: "none", WebkitAppearance: "none", MozAppearance: "none" }}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-4)] group-focus-within/select:rotate-180 transition-transform duration-250" style={{ right: "14px" }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="flex-shrink-0" style={{ width: "110px" }}>
              <label className="text-card-label block leading-none" style={{ marginBottom: "10px", fontSize: "11px" }}>Questions</label>
              <input
                type="number"
                min={1}
                disabled={generatingQuiz || (creditsInfo !== null && creditsInfo.remaining === 0)}
                value={numQuestions === 0 ? "" : numQuestions}
                onChange={(e) => {
                  setMcqValidationError(false);
                  setErrorMsg(null);
                  setIsCreditsError(false);
                  const val = e.target.value;
                  if (val === "") {
                    setNumQuestions(0);
                  } else {
                    const parsed = parseInt(val) || 0;
                    if (parsed > 50) {
                      setNumQuestions(50);
                    } else {
                      setNumQuestions(parsed);
                    }
                  }
                }}
                onBlur={() => {
                  setNumQuestions(prev => {
                    if (prev <= 0) return 0;
                    return Math.min(50, prev);
                  });
                }}
                className={`w-full border ${
                  mcqValidationError
                    ? "border-red-500"
                    : creditsInfo && numQuestions > creditsInfo.remaining && numQuestions > 0
                    ? "border-amber-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10"
                    : "border-[var(--border)] focus:border-[var(--text-1)] focus:ring-2 focus:ring-[var(--text-1)]/5"
                } bg-[var(--surface)] px-4 text-base font-semibold text-[var(--text-1)] tabular-nums focus:outline-none transition-all duration-250 hover:border-[var(--border-strong)] disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                style={{ height: "48px", borderRadius: "14px" }}
              />
            </div>

            {/* Generate Button */}
            <div className="relative flex-shrink-0" style={{ width: "196px" }}>
              {creditsInfo !== null && creditsInfo.remaining === 0 && showTooltip && (
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-3 py-2 bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text-1)] text-xs font-semibold rounded-lg shadow-lg flex flex-col items-center text-center whitespace-nowrap z-30 animate-in fade-in slide-in-from-bottom-1 duration-150"
                  style={{ pointerEvents: "none" }}
                >
                  <span>Daily limit reached.</span>
                  <span>Come back tomorrow.</span>
                  <div className="w-2 h-2 bg-[var(--surface-2)] border-r border-b border-[var(--border-strong)] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                </div>
              )}
              <div
                className="w-full h-full"
                onMouseEnter={() => {
                  if (creditsInfo !== null && creditsInfo.remaining === 0) setShowTooltip(true);
                }}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <button
                  onClick={handleGenerateQuiz}
                  disabled={
                    generatingQuiz ||
                    (creditsInfo !== null && creditsInfo.remaining === 0) ||
                    (inputSource === "text" && (pastedTextCharCount === 0 || pastedTextCharCount < 300 || pastedTextCharCount > 6000))
                  }
                  className="w-full text-sm font-bold disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 btn-premium-shine text-[var(--text-inv)]"
                  style={{ height: "48px", borderRadius: "14px" }}
                >
                  {generatingQuiz ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-[var(--text-inv)]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.187-.904L9 9l.813 5.096L15 15l-5.187.904zM18 10.5l-.5 3-.5-3-3-.5 3-.5.5-3 .5 3 3 .5-3 .5zM19 19.5l-.25 1.5-.25-1.5-1.5-.25 1.5-.25.25-1.5.25 1.5 1.5.25-1.5.25z" />
                      </svg>
                      <span>
                        {numQuestions > 0
                          ? quizType === "mcq"
                            ? `Generate ${numQuestions} MCQs`
                            : quizType === "tf"
                            ? `Generate ${numQuestions} T/F`
                            : `Generate ${numQuestions} Fill Blanks`
                          : "Generate Quiz"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Validation/Errors */}
          {errorMsg && !isCreditsError && (
            /* ── Generic error ── */
            <div className="mt-5 text-xs font-semibold flex items-center gap-2 px-3.5 py-2.5 rounded-lg border-l-2 animate-in fade-in duration-200"
                 style={{
                   backgroundColor: "rgba(244, 63, 94, 0.05)",
                   borderColor: "rgba(244, 63, 94, 0.4)",
                   color: "var(--red, #f43f5e)",
                 }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="leading-tight">{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Section 3: States */}

        {/* 1. Loading/Generating State */}
        {generatingQuiz && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-7 shadow-sm w-full max-w-[1180px] mx-auto min-h-[180px] flex flex-col items-center justify-center text-center animate-in fade-in duration-250 hover:-translate-y-[2px] hover:shadow-lg transition-all duration-250">
            <h3 className="text-sm font-semibold text-[var(--text-1)] tracking-tight mb-4">Generating Quiz...</h3>
            <div className="w-full max-w-[200px] h-1.5 bg-[var(--bg-2)] border border-[var(--border)] rounded-full overflow-hidden mb-4 relative">
              <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-[var(--text-1)] rounded-full animate-progress-loop"></div>
            </div>
            <p className="text-xs font-normal text-[var(--text-3)] status-fade-text"></p>
          </div>
        )}

        {/* 2. Success Summary State */}
        {questions.length > 0 && !generatingQuiz && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm w-full max-w-[1180px] mx-auto animate-in fade-in duration-250 hover:-translate-y-[2px] hover:shadow-lg transition-all duration-250">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold text-lg">✓</span>
                  <h3 className="text-base font-semibold text-[var(--text-1)] tracking-tight">Quiz Generated</h3>
                </div>
                <p className="text-xs font-normal text-[var(--text-4)] leading-relaxed">
                  Practice exam questions compiled successfully.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-card-label text-[10px]">Questions</span>
                  <span className="px-3 py-1 rounded-md bg-[var(--bg-2)] border border-[var(--border)] text-xs font-semibold text-[var(--text-1)] tabular-nums">
                    {questions.length}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-card-label text-[10px]">Time</span>
                  <span className="px-3 py-1 rounded-md bg-[var(--bg-2)] border border-[var(--border)] text-xs font-semibold text-[var(--text-1)] tabular-nums">
                    {(questions.length * 0.15 + 1.2).toFixed(1)}s
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-card-label text-[10px]">Difficulty</span>
                  <span className="px-3 py-1 rounded-md bg-[var(--bg-2)] border border-[var(--border)] text-xs font-semibold text-[var(--text-1)]">
                    {difficulty}
                  </span>
                </div>
              </div>

              <div>
                <button
                  onClick={() => {
                    if (!startTime) setStartTime(Date.now());
                    document.getElementById("q-0")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto px-5 h-10 rounded-[14px] text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 btn-premium-shine text-[var(--text-inv)]"
                >
                  <span>Start Quiz</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Empty State (No selection) */}
        {inputSource !== "text" && !selectedDocId && !generatingQuiz && questions.length === 0 && (
          <div className="w-full max-w-[560px] mx-auto border border-dashed border-[var(--border)] bg-[var(--bg-2)]/60 rounded-xl py-5 px-6 flex flex-col items-center justify-center text-center animate-in fade-in duration-250 h-[180px] hover:-translate-y-[2px] hover:shadow-lg transition-all duration-250">
            <span className="text-2xl mb-2">📄</span>
            <h3 className="text-sm font-semibold text-[var(--text-1)] tracking-tight">No document selected</h3>
            <p className="text-xs font-normal text-[var(--text-3)] mt-0.5 leading-relaxed">
              Select a document above to continue.
            </p>
            <div className="text-card-label text-[10px] mt-3.5">
              Supported: PDF • OCR • Scanned PDFs
            </div>
          </div>
        )}

        {/* 4. Selected Document Detail Card */}
        {selectedDoc && !generatingQuiz && questions.length === 0 && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-sm w-full max-w-[1180px] mx-auto animate-in fade-in duration-250 hover:-translate-y-[2px] hover:shadow-lg transition-all duration-250">
            <h3 className="text-card-label mb-5">Selected Document</h3>
            
            <div className="flex items-center gap-2 mb-6 min-w-0">
              <span className="text-lg flex-shrink-0">📄</span>
              <span className="text-base font-semibold text-[var(--text-1)] truncate min-w-0 flex-1 tracking-tight">
                {selectedDocName}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--text-4)]">Size</span>
                <span className="px-2.5 py-1 rounded-md bg-[var(--bg-2)] border border-[var(--border)] text-xs font-semibold text-[var(--text-1)] tabular-nums w-fit">
                  {selectedDoc.file_size ? formatBytes(selectedDoc.file_size) : "N/A"}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--text-4)]">Chunks</span>
                <span className="px-2.5 py-1 rounded-md bg-[var(--bg-2)] border border-[var(--border)] text-xs font-semibold text-[var(--text-1)] tabular-nums w-fit">
                  {selectedDoc.file_size ? Math.max(1, Math.round(selectedDoc.file_size / 800)) : "N/A"}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--text-4)]">Status</span>
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 w-fit">
                  Synced
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--text-4)]">Uploaded</span>
                <span className="px-2.5 py-1 rounded-md bg-[var(--bg-2)] border border-[var(--border)] text-xs font-semibold text-[var(--text-1)] w-fit">
                  <FormattedDateTime date={selectedDoc.created_at} options={{ month: "short", day: "numeric" }} />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Questions */}
        {questions.length > 0 && !generatingQuiz && (
          <div className="space-y-6 max-w-[1180px] mx-auto pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
              <h2 className="text-lg font-semibold text-[var(--text-1)] tracking-tight">Practice Quiz</h2>
              {submitted && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 min-w-0">
                  <Button
                    variant="secondary"
                    onClick={handleDownloadReport}
                    className="h-8 text-[11px] gap-1.5 w-full sm:w-auto"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    <span>Download Report</span>
                  </Button>
                  <div className={`px-4 py-1.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto ${
                    score >= 7 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25" 
                      : score >= 5 
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/25" 
                      : "bg-red-500/10 text-red-500 border-red-500/25"
                  }`}>
                    Score: {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {questions.map((q, idx) => {
                const isSelected = (opt: string) => userAnswers[idx] === opt;
                const isCorrectOption = (opt: string) => q.correctAnswer === opt;
                
                return (
                  <div key={idx} id={`q-${idx}`} className="bg-[var(--surface)] rounded-xl p-4 sm:p-6 space-y-4 border border-[var(--border)] hover:-translate-y-[2px] hover:shadow-lg transition-all duration-250 animate-in fade-in slide-in-from-bottom-3 min-w-0 overflow-hidden">
                    <div className="flex gap-2 items-start min-w-0">
                      <span className="font-semibold text-sm text-[var(--text-1)] bg-[var(--text-1)]/10 px-2 py-0.5 rounded-md flex-shrink-0">Q{idx + 1}</span>
                      <h3 className="text-[15px] font-medium text-[var(--text-1)] pt-0.5 min-w-0 break-words leading-relaxed">{q.question}</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 pl-0 sm:pl-9">
                      {q.options.map((opt, oIdx) => {
                        let optStyle = "border-[var(--border)] bg-[var(--surface)] text-[var(--text-3)] hover:border-[var(--border-strong)]";
                        
                        if (submitted) {
                          if (isCorrectOption(opt)) {
                            optStyle = "border-[var(--success)]/30 bg-[var(--success)]/10 text-[var(--success)] font-medium";
                          } else if (isSelected(opt)) {
                            optStyle = "border-[var(--danger)]/30 bg-[var(--danger)]/10 text-[var(--danger)]";
                          } else {
                            optStyle = "opacity-60 border-[var(--border)] bg-[var(--surface)] text-[var(--text-3)]";
                          }
                        } else if (isSelected(opt)) {
                          optStyle = "border-[var(--text-1)] bg-[var(--text-1)]/5 text-[var(--text-1)] font-medium";
                        }

                        return (
                          <button
                            key={`${oIdx}-${opt}`}
                            disabled={submitted}
                            onClick={() => handleSelectOption(idx, opt)}
                            className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all flex items-center justify-between gap-2 min-w-0 ${optStyle} ${
                              !submitted ? "cursor-pointer active:scale-[0.995]" : "cursor-default"
                            }`}
                          >
                            <span className="min-w-0 break-words">
                              <strong className="mr-1.5 text-[var(--text-2)]">{String.fromCharCode(65 + oIdx)}.</strong>
                              {opt}
                            </span>
                            {submitted && isCorrectOption(opt) && (
                              <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )}
                            {submitted && isSelected(opt) && !isCorrectOption(opt) && (
                              <svg className="w-4 h-4 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanations shown for wrong answers after submission */}
                    {submitted && !isSelected(q.correctAnswer) && (
                      <div className="pl-0 sm:pl-9 mt-2.5">
                        <div className="p-3.5 rounded-xl bg-[var(--bg-2)] border border-[var(--border)] text-[13px] leading-relaxed text-[var(--text-3)]">
                          <p className="font-semibold text-[var(--text-2)] mb-1">Explanation from PDF:</p>
                          <p className="italic">&ldquo;{q.explanation}&rdquo;</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz submission actions */}
            {!submitted && (
              <div className="flex justify-stretch sm:justify-end pt-4">
                <Button
                  variant="primary"
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(userAnswers).length < questions.length}
                  className="w-full sm:w-auto px-6 h-11 text-xs"
                >
                  Submit Quiz
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {showLimitModal && (
        <div className="lg-backdrop" onClick={() => setShowLimitModal(false)}>
          <div className="lg-card" onClick={e => e.stopPropagation()}>
            <div className="lg-card-content">
              <div className="lg-icon lg-icon-warning">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="lg-title">
                {(creditsInfo?.remaining ?? 0) === 0 ? "Daily limit reached" : "Not enough credits"}
              </h3>
              <p className="lg-message">
                {(creditsInfo?.remaining ?? 0) === 0 ? (
                  <>
                    You&apos;ve used all {creditsInfo?.limit ?? 30} daily questions. Your limit resets
                    {creditsInfo?.resetAt ? (
                      <> at <FormattedDateTime date={creditsInfo.resetAt} type="time" /> (your local time).</>
                    ) : "."}
                  </>
                ) : (
                  <>
                    You only have <strong>{creditsInfo?.remaining}</strong> question credit{creditsInfo?.remaining !== 1 ? "s" : ""} left today.
                    Please reduce the number of questions to {creditsInfo?.remaining} or less.
                  </>
                )}
              </p>
            </div>
            <div className="lg-divider" />
            <div className="lg-btn-row">
              <button className="lg-btn lg-btn-primary" onClick={() => setShowLimitModal(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-sm z-50 flex items-center bg-[var(--surface-2)] text-[var(--text-1)] px-4 py-3 rounded-xl shadow-lg border border-[var(--border-strong)] animate-in fade-in slide-in-from-bottom-5 duration-200">
          <span className="text-xs font-semibold break-words">{toast.message}</span>
        </div>
      )}
    </AppShell>
  );
}
