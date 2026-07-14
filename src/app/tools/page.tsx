import type { Metadata } from "next";
import Link from "next/link";
import PublicPageHeader from "@/components/shared/PublicPageHeader";
import PublicPageFooter from "@/components/shared/PublicPageFooter";

export const metadata: Metadata = {
  title: "AI Study & Revision Tools | QuizGens Tool Directory",
  description: "Browse our list of AI-powered revision tools: convert PDFs, screenshots, plain texts, and notes into customized practice worksheets and MCQs.",
  alternates: {
    canonical: "https://quizgens.tech/tools",
  },
};

const TOOLS_LIST = [
  {
    name: "AI Quiz Generator",
    href: "/ai-quiz-generator",
    desc: "The core quiz generator. Ingests PDFs, scanned note sheets, and copied summaries to compile customized quizzes.",
  },
  {
    name: "PDF to MCQ Generator",
    href: "/pdf-to-mcq-generator",
    desc: "Converts bulky textbook guides and syllabus PDFs into standard four-option multiple choice sheets.",
  },
  {
    name: "OCR Quiz Generator",
    href: "/image-to-quiz-generator",
    desc: "Processes board screenshots, textbook snaps, and handwritten summaries using advanced OCR net scans.",
  },
  {
    name: "Text to Quiz Generator",
    href: "/text-to-quiz-generator",
    desc: "Paste direct outlines from Claude summaries, Notion notes, or web paragraphs to generate test questions.",
  },
  {
    name: "True/False Generator",
    href: "/true-false-generator",
    desc: "Structures simple binary statement evaluations to verify core conceptual alignment and dates.",
  },
  {
    name: "Fill in the Blanks Generator",
    href: "/fill-in-the-blanks-generator",
    desc: "Creates sentence completion sheets to master vocabulary lists, math formulas, and reactions.",
  },
];

const getToolIcon = (name: string) => {
  switch (name) {
    case "AI Quiz Generator":
      return (
        <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case "PDF to MCQ Generator":
      return (
        <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case "OCR Quiz Generator":
      return (
        <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case "Text to Quiz Generator":
      return (
        <svg className="w-7 h-7 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
    case "True/False Generator":
      return (
        <svg className="w-7 h-7 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "Fill in the Blanks Generator":
      return (
        <svg className="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      );
    default:
      return null;
  }
};

export default function ToolsDirectoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] transition-colors duration-200">
      <PublicPageHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-12 lg:px-20 py-16 space-y-12">
        
        {/* Header */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--indigo-accent)]/10 text-[var(--indigo-accent)]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            QuizGens Suite
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-1)] tracking-tight">
            Free AI Study & Revision Tools
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-3)] leading-relaxed">
            Select one of our specialized generators below to convert your files, images, or copy-pasted summaries into structured practice assessments.
          </p>
        </div>

        {/* Grid list */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS_LIST.map((tool) => (
            <div
              key={tool.name}
              className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl p-6 flex flex-col justify-between space-y-5 shadow-xs hover:-translate-y-0.5 transition-all"
            >
              <div className="space-y-3.5 text-left">
                <span className="select-none block h-8 w-8">{getToolIcon(tool.name)}</span>
                <h3 className="text-sm font-bold text-[var(--text-1)] tracking-tight">
                  {tool.name}
                </h3>
                <p className="text-[11px] text-[var(--text-3)] leading-relaxed">
                  {tool.desc}
                </p>
              </div>
              
              <div className="pt-4 border-t border-[var(--border)] flex justify-end">
                <Link
                  href={tool.href}
                  className="text-xs font-bold text-[var(--indigo-accent)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Open Tool <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </section>

      </main>

      <PublicPageFooter />
    </div>
  );
}
