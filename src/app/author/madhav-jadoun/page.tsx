import type { Metadata } from "next";
import Link from "next/link";
import PublicPageHeader from "@/components/shared/PublicPageHeader";
import PublicPageFooter from "@/components/shared/PublicPageFooter";
import { BLOG_POSTS } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Madhav Jadoun - Lead Creator & Educator | QuizGens Author Profile",
  description: "Learn more about Madhav Jadoun, the developer and creator behind QuizGens. Read his guides on active recall, AI learning pipelines, and exam study tips.",
  alternates: {
    canonical: "https://quizgens.tech/author/madhav-jadoun",
  },
};

export default function AuthorProfilePage() {
  // Author wrote all 10 articles in the store
  const authorPosts = BLOG_POSTS;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] transition-colors duration-200">
      <PublicPageHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-12 lg:px-20 py-12 space-y-12">
        
        {/* Profile Card */}
        <section className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 shadow-sm">
          {/* Avatar visual */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-3xl sm:text-4xl font-black shadow-md flex-shrink-0 select-none">
            MJ
          </div>

          {/* Details */}
          <div className="space-y-4 text-center md:text-left flex-1 min-w-0">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--indigo-accent)]">QuizGens Creator</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-1)] tracking-tight">Madhav Jadoun</h1>
              <p className="text-xs font-semibold text-[var(--text-3)]">Student, Software Engineer & EdTech Advocate</p>
            </div>
            
            <p className="text-xs sm:text-sm text-[var(--text-2)] leading-relaxed font-normal max-w-2xl">
              Madhav Jadoun is a developer passionate about building high-utility tools for students and teachers. He designed and built QuizGens to automate cognitive active recall, utilizing advanced vector search algorithms (RAG) and Gemini AI to turn legacy files into structured, readable practice tests. He writes about study optimization, OCR text parsing, and AI integration in classroom lessons.
            </p>

            {/* Social rows */}
            <div className="flex justify-center md:justify-start gap-4 text-xs font-bold text-[var(--indigo-accent)] pt-2">
              <a href="https://github.com/madhavjadoun" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                GitHub
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                LinkedIn
              </a>
              <a href="mailto:support@quizgens.tech" className="hover:underline flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Support
              </a>
            </div>
          </div>
        </section>

        {/* Written Posts list */}
        <section className="space-y-6">
          <h2 className="text-lg sm:text-xl font-extrabold text-[var(--text-1)] tracking-tight border-b border-[var(--border)] pb-3">
            Articles & Guides Written by Madhav
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorPosts.map((post) => (
              <div
                key={post.slug}
                className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5 flex flex-col justify-between space-y-4 hover:-translate-y-0.5 transition-all shadow-xs"
              >
                <div className="space-y-2.5 text-left">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--text-4)]">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.tags[0]}</span>
                  </div>
                  <h3 className="text-xs font-bold text-[var(--text-1)] tracking-tight leading-snug">
                    <Link href={`/blog/${post.slug}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-[11px] text-[var(--text-3)] leading-relaxed line-clamp-3">
                    {post.snippet}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex justify-end">
                  <Link href={`/blog/${post.slug}`} className="text-[10px] font-bold text-[var(--indigo-accent)] hover:underline flex items-center gap-1 cursor-pointer">
                    Read Article <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <PublicPageFooter />
    </div>
  );
}
