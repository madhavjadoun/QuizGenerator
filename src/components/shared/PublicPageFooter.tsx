"use client";

import React from "react";
import Link from "next/link";
import NavbarLogo from "@/components/layout/NavbarLogo";

export default function PublicPageFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[var(--border)] bg-[var(--bg)]/60 py-12 md:py-16 overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute -bottom-20 right-[15%] w-80 h-80 bg-indigo-500/5 rounded-full pointer-events-none blur-3xl" />
      <div className="absolute -bottom-20 left-[15%] w-80 h-80 bg-purple-500/5 rounded-full pointer-events-none blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 relative z-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center min-w-0 cursor-pointer">
              <NavbarLogo />
            </Link>
            <p className="text-xs text-[var(--text-3)] leading-relaxed max-w-[280px]">
              Turn notes, PDFs, textbooks, and images into interactive practice quizzes. Powered by Gemini AI.
            </p>
          </div>

          {/* Generators */}
          <div>
            <h4 className="font-bold text-[var(--text-1)] text-xs uppercase tracking-wider mb-4" style={{ letterSpacing: "0.08em" }}>Generators</h4>
            <ul className="space-y-2.5 text-xs text-[var(--text-3)] font-semibold">
              <li>
                <Link href="/pdf-to-mcq-generator" className="hover:text-[var(--text-1)] transition-colors duration-200">
                  PDF to MCQ Generator
                </Link>
              </li>
              <li>
                <Link href="/image-to-quiz-generator" className="hover:text-[var(--text-1)] transition-colors duration-200">
                  Image to Quiz Generator
                </Link>
              </li>
              <li>
                <Link href="/text-to-quiz-generator" className="hover:text-[var(--text-1)] transition-colors duration-200">
                  Text to Quiz Generator
                </Link>
              </li>
              <li>
                <Link href="/quiz-maker-from-notes" className="hover:text-[var(--text-1)] transition-colors duration-200">
                  Quiz Maker from Notes
                </Link>
              </li>
            </ul>
          </div>

          {/* Formats */}
          <div>
            <h4 className="font-bold text-[var(--text-1)] text-xs uppercase tracking-wider mb-4" style={{ letterSpacing: "0.08em" }}>Quiz Formats</h4>
            <ul className="space-y-2.5 text-xs text-[var(--text-3)] font-semibold">
              <li>
                <Link href="/mcq-generator" className="hover:text-[var(--text-1)] transition-colors duration-200">
                  MCQ Generator
                </Link>
              </li>
              <li>
                <Link href="/true-false-generator" className="hover:text-[var(--text-1)] transition-colors duration-200">
                  True/False Generator
                </Link>
              </li>
              <li>
                <Link href="/fill-in-the-blanks-generator" className="hover:text-[var(--text-1)] transition-colors duration-200">
                  Fill in the Blanks
                </Link>
              </li>
              <li>
                <Link href="/ai-quiz-generator" className="hover:text-[var(--text-1)] transition-colors duration-200">
                  AI Quiz Generator
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-[var(--text-1)] text-xs uppercase tracking-wider mb-4" style={{ letterSpacing: "0.08em" }}>Resources</h4>
            <ul className="space-y-2.5 text-xs text-[var(--text-3)] font-semibold">
              <li>
                <Link href="/blog" className="hover:text-[var(--text-1)] transition-colors duration-200">
                  Blog Articles
                </Link>
              </li>
              <li>
                <a href="/faq" target="_blank" className="hover:text-[var(--text-1)] transition-colors duration-200">
                  FAQ Help
                </a>
              </li>
              <li>
                <a href="/privacy" target="_blank" className="hover:text-[var(--text-1)] transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" target="_blank" className="hover:text-[var(--text-1)] transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-[var(--border)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[var(--text-4)] text-center sm:text-left font-medium">
          <p>© {currentYear} QuizGens. All rights reserved.</p>
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <span>Built with FastAPI • Gemini • Supabase</span>
            <span className="hidden sm:inline">•</span>
            <span>Made for students ❤️ by Madhav Jadoun</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
