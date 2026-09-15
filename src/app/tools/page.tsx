import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  FileText,
  BookOpen,
  AlignLeft,
  CheckCircle2,
  PenLine,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import PublicPageHeader from "@/components/shared/PublicPageHeader";
import PublicPageFooter from "@/components/shared/PublicPageFooter";

export const metadata: Metadata = {
  title: "Quiz & Study Tools | QuizGens Directory",
  description: "Browse our suite of quiz and study tools: transform PDFs, lecture notes, textbook chapters, and pasted text into interactive practice worksheets.",
  alternates: {
    canonical: "https://quizgens.tech/tools",
  },
};

const TOOLS_LIST = [
  {
    name: "AI Quiz Generator",
    tag: "All-in-One",
    href: "/chat",
    icon: Sparkles,
    desc: "The primary generator for study materials. Converts multi-page documents, notes, and summaries into comprehensive practice quizzes.",
  },
  {
    name: "PDF to MCQ Generator",
    tag: "PDF & Slides",
    href: "/chat",
    icon: FileText,
    desc: "Extract key concepts from textbook PDFs, lecture slide decks, and handouts into 4-option multiple-choice questions.",
  },
  {
    name: "Text PDF Quiz Generator",
    tag: "Study Guides",
    href: "/chat",
    icon: BookOpen,
    desc: "Parse reading packets, course syllabi, and study sheets into interactive review questions tailored to your syllabus.",
  },
  {
    name: "Text to Quiz Generator",
    tag: "Quick Notes",
    href: "/chat",
    icon: AlignLeft,
    desc: "Paste notes from Notion, summaries from Claude, or web articles to generate targeted practice tests instantly.",
  },
  {
    name: "True/False Generator",
    tag: "Binary Check",
    href: "/chat",
    icon: CheckCircle2,
    desc: "Formulate crisp true-or-false statement evaluations to rapidly verify core definitions, timelines, and factual recall.",
  },
  {
    name: "Fill in the Blanks Generator",
    tag: "Active Recall",
    href: "/chat",
    icon: PenLine,
    desc: "Create sentence-completion exercises to master terminology, scientific definitions, vocabulary, and formulas.",
  },
];

export default function ToolsDirectoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] transition-colors duration-200">
      <PublicPageHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-12 lg:px-20 py-12 sm:py-16 space-y-12">
        
        {/* Header Hero */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center border-b border-[var(--border)] pb-12">
          
          {/* Left Column: Heading & Info */}
          <div className="md:col-span-7 space-y-5 text-left">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-1)] tracking-tight leading-tight">
              Study Tools & <span className="text-[var(--indigo-accent)]">Generators</span>
            </h1>
            
            <p className="text-sm sm:text-base text-[var(--text-3)] leading-relaxed max-w-xl">
              Turn your documents, slides, and notes into interactive study assessments designed for active recall and exam preparation.
            </p>

            {/* Quick action bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link 
                href="/chat"
                className="grad-btn px-6 py-2.5 rounded-xl text-xs font-semibold shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
              >
                Launch Generator <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="#directory"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--bg-2)] border border-[var(--border)] transition-colors cursor-pointer"
              >
                Browse All Tools ↓
              </a>
            </div>
          </div>

          {/* Right Column: Illustration */}
          <div className="md:col-span-5 flex justify-center">
            <div 
              className="relative w-full max-w-[290px] sm:max-w-[340px] aspect-square bg-[var(--surface-2)] border border-[var(--border)] p-6 shadow-xs flex items-center justify-center overflow-hidden rounded-2xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/tools-header.svg" 
                alt="Tools Directory Illustration" 
                className="w-full h-full object-contain relative z-10 transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>

        </div>

        {/* Directory Section Header */}
        <div id="directory" className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pt-2 pb-1 border-b border-[var(--border)]">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-1)] tracking-tight">
              Available Generators
            </h2>
            <p className="text-xs text-[var(--text-4)] mt-0.5">
              Select an assessment format based on your study material
            </p>
          </div>
          <span className="text-xs font-medium text-[var(--text-4)] self-start sm:self-auto">
            {TOOLS_LIST.length} tools
          </span>
        </div>

        {/* Grid list of Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS_LIST.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.name}
                href={tool.href}
                className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-md cursor-pointer"
              >
                <div className="space-y-4">
                  {/* Top: Icon + Tag & Arrow */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--text-2)] group-hover:text-[var(--indigo-accent)] group-hover:border-[var(--indigo-accent)]/30 group-hover:bg-[var(--indigo-accent)]/5 transition-all duration-200">
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-[var(--bg)] border border-[var(--border)] text-[var(--text-4)] group-hover:text-[var(--text-2)] transition-colors">
                        {tool.tag}
                      </span>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-4)] group-hover:text-[var(--indigo-accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-[var(--text-1)] tracking-tight group-hover:text-[var(--indigo-accent)] transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-3)] leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                </div>

                {/* Bottom link bar */}
                <div className="pt-5 mt-5 border-t border-[var(--border)]/70 flex items-center justify-between text-xs font-medium text-[var(--text-4)] group-hover:text-[var(--text-2)] transition-colors">
                  <span>Interactive tool</span>
                  <span className="text-[var(--indigo-accent)] font-semibold flex items-center gap-1 group-hover:gap-1.5 transition-all">
                    Open Tool <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </section>

      </main>

      <PublicPageFooter />
    </div>
  );
}
