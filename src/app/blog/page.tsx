"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import PublicPageHeader from "@/components/shared/PublicPageHeader";
import PublicPageFooter from "@/components/shared/PublicPageFooter";
import { BLOG_POSTS, BlogPost } from "@/lib/blog-data";

export default function BlogListingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Helper to dynamically calculate read time based on word count
  const calculateReadTime = (post: BlogPost): string => {
    let totalWords = 0;
    post.sections.forEach((sec) => {
      const plainText = sec.bodyHtml.replace(/<[^>]*>/g, " ");
      totalWords += plainText.split(/\s+/).filter(Boolean).length;
    });
    const minutes = Math.max(1, Math.ceil(totalWords / 200));
    return `${minutes} min read`;
  };

  // Filter posts
  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const featuredPost = BLOG_POSTS[0];
  const gridPosts = filteredPosts.filter((p) => p.slug !== featuredPost.slug || searchQuery !== "" || selectedTag !== null);

  // Popular and Trending articles selections
  const popularArticles = BLOG_POSTS.slice(1, 4);
  const trendingArticles = BLOG_POSTS.slice(4, 7);

  const searchSuggestions = ["PDF", "MCQ", "OCR", "Teachers", "Students"];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] transition-colors duration-200">
      <PublicPageHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-12 lg:px-20 py-12 space-y-12">

        {/* Page Hero */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--indigo-accent)]/10 text-[var(--indigo-accent)]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Learning Portal
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-1)] tracking-tight">
            AI Quiz Generator Resources & Study Guides
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-3)] leading-relaxed max-w-2xl mx-auto">
            Learn how to convert PDFs, images, OCR scans, and pasted text into AI-generated quizzes. Access tutorials, study methodologies, and product guides.
          </p>
        </div>

        {/* Search & Suggestions */}
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl p-5 space-y-4 shadow-xs max-w-3xl mx-auto">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-4)]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search guides, tools, or tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-1)] focus:outline-none focus:border-[var(--indigo-accent)] focus:ring-2 focus:ring-[var(--indigo-accent)]/10 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[var(--text-4)] font-bold">Suggestions:</span>
            {searchSuggestions.map((sug) => (
              <button
                key={sug}
                onClick={() => setSearchQuery(sug)}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-2)] hover:bg-[var(--bg-3)] border border-[var(--border)] text-[10px] font-bold text-[var(--text-3)] hover:text-[var(--text-1)] cursor-pointer transition-all active:scale-95"
              >
                {sug}
              </button>
            ))}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-2 py-0.5 rounded text-[9px] font-bold text-red-500 hover:underline cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

        {/* Featured Post Card (only shown when no query/tag filters are active) */}
        {!searchQuery && !selectedTag && featuredPost && (
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-[var(--text-4)]">
                  <span>{featuredPost.date}</span>
                  <span>•</span>
                  <span>{calculateReadTime(featuredPost)}</span>
                  <span>•</span>
                  <span className="text-[var(--indigo-accent)]">Featured Guide</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-extrabold text-[var(--text-1)] tracking-tight leading-tight">
                  <Link href={`/blog/${featuredPost.slug}`} className="hover:underline">
                    {featuredPost.title}
                  </Link>
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-3)] leading-relaxed">
                  {featuredPost.snippet}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <Link href="/author/madhav-jadoun" className="text-xs font-bold text-[var(--text-2)] hover:text-[var(--indigo-accent)] transition-colors">
                  By {featuredPost.author}
                </Link>
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="text-xs font-bold text-[var(--indigo-accent)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Read Article <span>→</span>
                </Link>
              </div>
            </div>

            {/* Visual Featured illustration */}
            <div className="lg:col-span-5 bg-gradient-to-tr from-[var(--indigo-accent)]/10 to-[var(--bg-2)] min-h-[220px] flex items-center justify-center p-6 select-none border-t lg:border-t-0 lg:border-l border-[var(--border)] relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,var(--indigo-accent)_0%,transparent_60%)]" />
              <div className="w-full h-full min-h-[230px] relative z-10 scale-[1.3] transform transition-transform duration-300">
                <Image
                  src="/active-recall-animation.svg"
                  alt="Active Recall Animation"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* Layout: Main Grid (9 cols) + Sidebar (3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: Articles Grid List (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-extrabold text-[var(--text-2)] uppercase tracking-wider">
                {searchQuery || selectedTag ? "Search Results" : "Recent Guides"}
              </h3>

              {/* Tag filters */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-2.5 py-1 rounded bg-[var(--bg-2)] text-[9px] font-bold transition-all cursor-pointer ${selectedTag === null ? "text-[var(--indigo-accent)] bg-[var(--indigo-accent)]/10" : "text-[var(--text-3)]"
                    }`}
                >
                  All Tags
                </button>
                {Array.from(new Set(BLOG_POSTS.flatMap(p => p.tags))).map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2.5 py-1 rounded bg-[var(--bg-2)] text-[9px] font-bold transition-all cursor-pointer ${selectedTag === tag ? "text-[var(--indigo-accent)] bg-[var(--indigo-accent)]/10" : "text-[var(--text-3)]"
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridPosts.map((post) => (
                <div
                  key={post.slug}
                  className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5 flex flex-col justify-between space-y-5 shadow-xs hover:-translate-y-0.5 transition-all"
                >
                  <div className="space-y-3 text-left">
                    <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-bold text-[var(--text-4)]">
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{calculateReadTime(post)}</span>
                    </div>
                    <h4 className="text-xs font-bold text-[var(--text-1)] tracking-tight leading-snug">
                      <Link href={`/blog/${post.slug}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </h4>
                    <p className="text-[11px] text-[var(--text-3)] leading-relaxed line-clamp-3">
                      {post.snippet}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-[var(--bg-2)] text-[9px] font-bold text-[var(--text-3)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <Link href="/author/madhav-jadoun" className="text-[var(--text-2)] hover:text-[var(--indigo-accent)]">
                        By {post.author}
                      </Link>
                      <Link href={`/blog/${post.slug}`} className="text-[var(--indigo-accent)] hover:underline flex items-center gap-1 cursor-pointer">
                        Read Guide <span>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="py-16 text-center space-y-3 border border-dashed border-[var(--border)] rounded-xl bg-[var(--bg-2)]/30">
                <svg className="w-8 h-8 text-[var(--text-4)] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h4 className="text-xs font-bold text-[var(--text-1)]">No articles found</h4>
                <p className="text-[10px] text-[var(--text-4)] font-semibold">Try adjusting your search query or tag selection.</p>
              </div>
            )}
          </div>

          {/* RIGHT: Sidebar Layout (3 cols) */}
          <aside className="lg:col-span-3 space-y-6">

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

            {/* Sidebar 3: Free Tools Links */}
            <div className="bg-linear-to-tr from-[var(--indigo-accent)]/10 to-[var(--bg-2)] border border-[var(--border)] rounded-xl p-5 space-y-4 text-left">
              <h3 className="text-xs font-extrabold text-[var(--text-1)] uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Free AI Tools
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
                    MCQ Generator
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
