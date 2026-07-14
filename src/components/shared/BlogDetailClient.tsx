"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PublicPageHeader from "./PublicPageHeader";
import PublicPageFooter from "./PublicPageFooter";
import { BlogPost, BLOG_POSTS } from "@/lib/blog-data";

interface BlogDetailClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export default function BlogDetailClient({ post, relatedPosts }: BlogDetailClientProps) {
  const router = useRouter();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Helper to dynamically calculate read time based on word count
  const calculateReadTime = (item: BlogPost): string => {
    let totalWords = 0;
    item.sections.forEach((sec) => {
      const plainText = sec.bodyHtml.replace(/<[^>]*>/g, " ");
      totalWords += plainText.split(/\s+/).filter(Boolean).length;
    });
    const minutes = Math.max(1, Math.ceil(totalWords / 200));
    return `${minutes} min read`;
  };

  const dynamicReadTime = calculateReadTime(post);

  // Popular and Trending articles lists
  const popularArticles = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);
  const trendingArticles = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(3, 6);

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  };

  // BlogPosting Schema
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.snippet,
    "author": {
      "@type": "Person",
      "name": post.author,
    },
    "datePublished": "2026-07-14",
    "publisher": {
      "@type": "Organization",
      "name": "QuizGens",
      "logo": {
        "@type": "ImageObject",
        "url": "https://quizgens.tech/favicon-32x32.png",
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] transition-colors duration-200">
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />

      <PublicPageHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-12 lg:px-20 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Sticky Table of Contents (3 cols) */}
          <aside className="lg:col-span-3 lg:sticky lg:top-24 space-y-5 hidden lg:block">
            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-extrabold text-[var(--text-2)] uppercase tracking-wider">
                Table of Contents
              </h3>
              <nav className="flex flex-col gap-2.5 text-xs font-semibold text-[var(--text-3)]">
                {post.tableOfContents.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="hover:text-[var(--text-1)] hover:translate-x-0.5 transition-all duration-200"
                  >
                    {item.label}
                  </a>
                ))}
                {post.examples.length > 0 && (
                  <a
                    href="#examples-section"
                    className="hover:text-[var(--text-1)] hover:translate-x-0.5 transition-all duration-200"
                  >
                    Interactive Examples
                  </a>
                )}
                {post.faqs.length > 0 && (
                  <a
                    href="#faqs-section"
                    className="hover:text-[var(--text-1)] hover:translate-x-0.5 transition-all duration-200"
                  >
                    FAQs
                  </a>
                )}
              </nav>
            </div>
            
            <div className="bg-linear-to-tr from-[var(--indigo-accent)]/10 to-[var(--bg-2)] border border-[var(--border)] rounded-xl p-5 text-center space-y-3.5">
              <span className="block h-8 w-8 text-amber-500 mx-auto">
                <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <h4 className="text-xs font-extrabold text-[var(--text-1)]">Try QuizGens Now</h4>
              <p className="text-[10px] text-[var(--text-3)] font-semibold leading-relaxed">
                Generate practice exams from your notes and study guides in seconds.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="grad-btn w-full py-2 rounded-lg text-[10px] font-bold cursor-pointer"
              >
                Create Free Quiz
              </button>
            </div>
          </aside>

          {/* CENTER: Main Blog Content (6 cols) */}
          <article className="lg:col-span-6 space-y-8 min-w-0">
            {/* Metadata headers */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded bg-[var(--indigo-accent)]/10 text-[10px] font-bold text-[var(--indigo-accent)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-1)] tracking-tight leading-tight text-left">
                {post.title}
              </h1>
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-4)] pt-1 border-b border-[var(--border)] pb-4">
                <Link href="/author/madhav-jadoun" className="text-[var(--text-2)] hover:text-[var(--indigo-accent)] transition-colors">
                  By {post.author}
                </Link>
                <span>•</span>
                <span>{post.date}</span>
                <span>•</span>
                <span>{dynamicReadTime}</span>
              </div>
            </div>

            {/* Snippet summary block */}
            <div className="bg-[var(--bg-2)]/75 border border-l-4 border-[var(--border)] border-l-[var(--indigo-accent)] rounded-r-xl p-4 text-xs font-semibold text-[var(--text-2)] leading-relaxed italic text-left">
              {post.snippet}
            </div>

            {/* Sections Content with inline CTA */}
            <div className="space-y-8 text-sm text-[var(--text-2)] leading-relaxed font-normal text-left">
              {post.sections.map((section, index) => (
                <React.Fragment key={section.id}>
                  <section id={section.id} className="space-y-3.5 scroll-mt-24">
                    <h2 className="text-lg sm:text-xl font-bold text-[var(--text-1)] tracking-tight">
                      {section.heading}
                    </h2>
                    <div
                      className="space-y-3 text-[13px] font-medium leading-relaxed text-[var(--text-3)]"
                      dangerouslySetInnerHTML={{ __html: section.bodyHtml }}
                    />
                  </section>

                  {/* 1st Middle CTA inserted after the 2nd H2 block (index 1) */}
                  {index === 1 && (
                    <div className="my-8 bg-[var(--surface-2)] border border-[var(--indigo-accent)]/30 rounded-xl p-6 text-center space-y-4 shadow-sm relative overflow-hidden">
                      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,var(--indigo-accent)_0%,transparent_70%)] pointer-events-none" />
                      <div className="relative z-10 space-y-2">
                        <h4 className="text-sm font-bold text-[var(--text-1)]">Study Smarter, Not Harder</h4>
                        <p className="text-[11px] text-[var(--text-3)] leading-relaxed max-w-md mx-auto">
                          Convert this study guide or any PDF notes directly into an interactive test with a single click.
                        </p>
                      </div>
                      <button
                        onClick={() => router.push("/login")}
                        className="grad-btn px-5 py-2.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer relative z-10 shadow-xs"
                      >
                        Generate Quiz from this PDF <span>→</span>
                      </button>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Interactive Examples Section */}
            {post.examples.length > 0 && (
              <section id="examples-section" className="space-y-4 pt-6 border-t border-[var(--border)] scroll-mt-24 text-left">
                <h2 className="text-lg sm:text-xl font-bold text-[var(--text-1)] tracking-tight">
                  Interactive Examples & Structure
                </h2>
                {post.examples.map((ex, idx) => (
                  <div key={idx} className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5 space-y-3">
                    <h3 className="text-xs font-extrabold text-[var(--text-1)]">{ex.title}</h3>
                    <p className="text-[11px] text-[var(--text-3)] leading-relaxed">{ex.description}</p>
                    
                    {ex.codeSnippet && (
                      <pre className="bg-[var(--bg-2)] p-4 rounded-lg text-[10px] font-mono text-[var(--text-2)] overflow-x-auto whitespace-pre leading-relaxed border border-[var(--border)]">
                        <code>{ex.codeSnippet}</code>
                      </pre>
                    )}

                    {ex.qaList && (
                      <div className="space-y-3 pt-2">
                        {ex.qaList.map((qa, qIdx) => (
                          <div key={qIdx} className="bg-[var(--bg)] p-3.5 rounded-lg border border-[var(--border)] space-y-1.5">
                            <span className="text-[10px] font-bold text-[var(--indigo-accent)]">QUESTION:</span>
                            <p className="text-xs font-bold text-[var(--text-1)]">{qa.q}</p>
                            <span className="text-[10px] font-bold text-emerald-600 block pt-1">EXPLANATORY SOLUTION:</span>
                            <p className="text-[11px] text-[var(--text-3)] leading-relaxed">{qa.a}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* FAQs Section */}
            {post.faqs.length > 0 && (
              <section id="faqs-section" className="space-y-4 pt-6 border-t border-[var(--border)] scroll-mt-24 text-left">
                <h2 className="text-lg sm:text-xl font-bold text-[var(--text-1)] tracking-tight">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {post.faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div key={idx} className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl overflow-hidden">
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full text-left px-4 py-3.5 flex justify-between items-start gap-3 hover:bg-[var(--bg-2)]/30 transition-colors cursor-pointer"
                        >
                          <span className="text-xs font-bold text-[var(--text-1)]">{faq.q}</span>
                          <span className={`text-[var(--text-3)] text-[9px] mt-0.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▼</span>
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-3.5 pt-1 text-[11px] font-semibold text-[var(--text-3)] leading-relaxed border-t border-[var(--border)] bg-[var(--bg-2)]/20 animate-in fade-in duration-150">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 2nd Bottom CTA: Related Tool block */}
            <div className="my-8 bg-linear-to-tr from-[var(--indigo-accent)]/10 to-[var(--bg-2)] border border-[var(--border)] rounded-xl p-5 text-left flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded bg-[var(--indigo-accent)]/10 text-[9px] font-bold text-[var(--indigo-accent)]">Related Tool</span>
                <h4 className="text-xs font-bold text-[var(--text-1)]">Generate Quiz from PDF</h4>
                <p className="text-[10px] text-[var(--text-3)] leading-relaxed font-semibold">Transform any textbook or textbook section instantly.</p>
              </div>
              <button
                onClick={() => router.push("/login")}
                className="grad-btn px-4 py-2 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                Start Free →
              </button>
            </div>

            {/* Main Action Banner */}
            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 text-center space-y-4.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-1)]">Stop passively reviewing notes</h2>
              <p className="text-xs text-[var(--text-3)] leading-relaxed max-w-lg mx-auto">
                Generate practice exams from notes, textbooks, images, and slides using Google Gemini AI. Free to get started.
              </p>
              <div>
                <button
                  onClick={() => router.push("/login")}
                  className="grad-btn px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                >
                  Generate Free Quiz Now
                  <span>→</span>
                </button>
              </div>
            </div>

          </article>

          {/* RIGHT: Sidebars for related resources (3 cols) */}
          <aside className="lg:col-span-3 space-y-6">
            
            {/* Sidebar 0: Related Guides */}
            {relatedPosts.length > 0 && (
              <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5 space-y-4 text-left">
                <h3 className="text-xs font-extrabold text-[var(--text-2)] uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Related Guides
                </h3>
                <ul className="space-y-3">
                  {relatedPosts.map((rp) => (
                    <li key={rp.slug} className="border-b border-[var(--border)] pb-3 last:border-b-0 last:pb-0 space-y-1">
                      <h4 className="text-xs font-bold text-[var(--text-1)] leading-snug">
                        <Link href={`/blog/${rp.slug}`} className="hover:underline">
                          {rp.title}
                        </Link>
                      </h4>
                      <span className="text-[9px] font-semibold text-[var(--text-4)] block">{calculateReadTime(rp)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sidebar 1: Popular Articles */}
            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5 space-y-4 text-left">
              <h3 className="text-xs font-extrabold text-[var(--text-2)] uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Popular Articles
              </h3>
              <ul className="space-y-3">
                {popularArticles.map((pop) => (
                  <li key={pop.slug} className="border-b border-[var(--border)] pb-3 last:border-b-0 last:pb-0 space-y-1">
                    <h4 className="text-xs font-bold text-[var(--text-1)] leading-snug">
                      <Link href={`/blog/${pop.slug}`} className="hover:underline">
                        {pop.title}
                      </Link>
                    </h4>
                    <span className="text-[9px] font-semibold text-[var(--text-4)] block">{calculateReadTime(pop)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sidebar 2: Trending Articles */}
            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5 space-y-4 text-left">
              <h3 className="text-xs font-extrabold text-[var(--text-2)] uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Trending
              </h3>
              <ul className="space-y-3">
                {trendingArticles.map((trend) => (
                  <li key={trend.slug} className="border-b border-[var(--border)] pb-3 last:border-b-0 last:pb-0 space-y-1">
                    <h4 className="text-xs font-bold text-[var(--text-1)] leading-snug">
                      <Link href={`/blog/${trend.slug}`} className="hover:underline">
                        {trend.title}
                      </Link>
                    </h4>
                    <span className="text-[9px] font-semibold text-[var(--text-4)] block">{calculateReadTime(trend)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sidebar 3: Free Tools */}
            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5 space-y-4 text-left">
              <h3 className="text-xs font-extrabold text-[var(--text-2)] uppercase tracking-wider">
                Practice Formats
              </h3>
              <ul className="space-y-2.5 text-xs font-bold text-[var(--indigo-accent)]">
                <li>
                  <Link href="/pdf-to-mcq-generator" className="hover:underline flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    PDF to MCQ Generator
                  </Link>
                </li>
                <li>
                  <Link href="/image-to-quiz-generator" className="hover:underline flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Image to Quiz Generator
                  </Link>
                </li>
                <li>
                  <Link href="/text-to-quiz-generator" className="hover:underline flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Text to Quiz Generator
                  </Link>
                </li>
                <li>
                  <Link href="/mcq-generator" className="hover:underline flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    MCQ Question Maker
                  </Link>
                </li>
                <li>
                  <Link href="/tools" className="hover:underline block border-t border-[var(--border)] pt-2 mt-2 text-[var(--text-1)]">
                    View All Tools →
                  </Link>
                </li>
              </ul>
            </div>

          </aside>

        </div>
      </main>

      <PublicPageFooter />
    </div>
  );
}
