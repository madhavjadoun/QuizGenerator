"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PublicPageHeader from "./PublicPageHeader";
import PublicPageFooter from "./PublicPageFooter";

export interface SEOLandingData {
  title: string;
  subtitle: string;
  keyword: string;
  ctaText: string;
  description: string;
  features: { title: string; desc: string; icon: React.ReactNode }[];
  faqs: { q: string; a: string }[];
  benefits: { title: string; desc: string }[];
  targetAudience: { title: string; desc: string }[];
  howItWorksSteps: { step: string; title: string; desc: string }[];
  relatedLinks: { name: string; href: string }[];
  relatedBlogs: { name: string; href: string }[];
}

interface SEOLandingTemplateProps {
  data: SEOLandingData;
}

export default function SEOLandingTemplate({ data }: SEOLandingTemplateProps) {
  const router = useRouter();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Generate Schemas dynamically
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://quizgens.tech",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": data.keyword,
        "item": `https://quizgens.tech/${data.keyword.toLowerCase().replace(/\s+/g, "-")}`,
      },
    ],
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "QuizGens",
    "operatingSystem": "All",
    "applicationCategory": "EducationalApplication",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250",
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] transition-colors duration-200">
      {/* Dynamic JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />

      <PublicPageHeader />

      {/* Main Content */}
      <main className="flex-1 w-full">
        
        {/* HERO SECTION */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-12 lg:px-20 pt-20 pb-16 flex flex-col items-center text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Tag / Primary Keyword Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--indigo-accent)]/10 text-[var(--indigo-accent)]">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.187-.813L9 9l.813 5.187L15 15l-5.187.813z" />
              </svg>
              Active Recall Engine
            </span>

            {/* Title */}
            <h1 className="text-[34px] xs:text-[38px] sm:text-[54px] lg:text-[64px] font-extrabold leading-[1.05] text-[var(--text-1)] tracking-tight">
              {data.title}
            </h1>

            {/* Subheadline */}
            <p className="text-[17px] sm:text-[19px] font-normal leading-[1.6] text-[var(--text-3)] max-w-3xl mx-auto pt-2">
              {data.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => router.push("/login")}
                className="grad-btn px-6 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all duration-[250ms] hover:-translate-y-0.5 shadow-md flex items-center gap-2 group active:translate-y-0"
              >
                {data.ctaText}
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </button>
              <a
                href="#features-section"
                className="text-xs font-bold px-5 py-3.5 rounded-xl border border-[var(--border)] transition-all duration-[250ms] cursor-pointer hover:bg-[var(--bg-2)] hover:text-[var(--text-1)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Learn More
              </a>
            </div>

            {/* Mockup Generator Preview */}
            <div className="pt-10 w-full max-w-[800px] mx-auto">
              <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-lg select-none">
                
                {/* Header bar */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-2)]">
                  <div className="flex items-center gap-3 text-[var(--text-4)]">
                    <svg className="w-3 h-3 cursor-not-allowed" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <svg className="w-3 h-3 cursor-not-allowed" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-4)] font-semibold">quizgens.tech/app-demo</span>
                  <div className="w-10" />
                </div>

                {/* Body mockup */}
                <div className="p-5 sm:p-7 text-left space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-[var(--text-1)]">Create Practice Quiz</h3>
                    <p className="text-[11px] text-[var(--text-3)]">Try selecting the parameters below to see the interactive generator options.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="border border-[var(--indigo-accent)] bg-[var(--indigo-accent)]/5 rounded-xl p-3 flex flex-col gap-2">
                      <span className="text-xs font-bold text-[var(--indigo-accent)]">1. Document Type</span>
                      <span className="text-[11px] font-semibold text-[var(--text-2)]">📄 PDF / Image / Text</span>
                    </div>
                    <div className="border border-[var(--border)] bg-[var(--bg-2)] rounded-xl p-3 flex flex-col gap-2">
                      <span className="text-xs font-bold text-[var(--text-2)]">2. Quiz Type</span>
                      <span className="text-[11px] font-semibold text-[var(--text-3)]">MCQ, True/False, Fill</span>
                    </div>
                    <div className="border border-[var(--border)] bg-[var(--bg-2)] rounded-xl p-3 flex flex-col gap-2">
                      <span className="text-xs font-bold text-[var(--text-2)]">3. Questions</span>
                      <span className="text-[11px] font-semibold text-[var(--text-3)]">5 - 50 questions</span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/login")}
                    className="grad-btn w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Generate Free Practice Quiz Now
                  </button>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* INPUTS / OUTPUTS FORMATS */}
        <section className="bg-[var(--bg-2)]/50 border-y border-[var(--border)] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-12 lg:px-20 text-center space-y-10">
            <div className="space-y-2.5">
              <h2 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">Flexible Inputs & High-Yield Formats</h2>
              <p className="text-xs text-[var(--text-3)] max-w-lg mx-auto">QuizGens digests raw study material and creates structured learning templates.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-6 text-left space-y-4">
                <span className="block h-8 w-8 text-blue-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <h3 className="text-sm font-bold text-[var(--text-1)]">PDF Documents</h3>
                <p className="text-[11px] text-[var(--text-3)] leading-relaxed">Upload textbook chapters, syllabi, lecture slides, and notes. Our engine parses searchable text formats automatically.</p>
              </div>
              <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-6 text-left space-y-4">
                <span className="block h-8 w-8 text-emerald-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <h3 className="text-sm font-bold text-[var(--text-1)]">Images (OCR Scanner)</h3>
                <p className="text-[11px] text-[var(--text-3)] leading-relaxed">Snap a photo of the whiteboard, upload screenshot slides, or legacy handwritten study notes to analyze their text content.</p>
              </div>
              <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-6 text-left space-y-4">
                <span className="block h-8 w-8 text-purple-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </span>
                <h3 className="text-sm font-bold text-[var(--text-1)]">Paste Plain Text</h3>
                <p className="text-[11px] text-[var(--text-3)] leading-relaxed">Directly copy summaries from ChatGPT, Notion files, or articles. Write or edit descriptions and start practicing.</p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-12 lg:px-20 space-y-12">
          <div className="text-center space-y-2.5">
            <h2 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">How It Works</h2>
            <p className="text-xs text-[var(--text-3)] max-w-lg mx-auto">Get your practice quizzes ready for action in four simple, automated steps.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.howItWorksSteps.map((step, idx) => (
              <div key={idx} className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-6 relative space-y-3">
                <div className="absolute top-4 right-4 text-xs font-bold text-[var(--indigo-accent)]/20 font-mono">STEP {step.step}</div>
                <h3 className="text-sm font-bold text-[var(--text-1)]">{step.title}</h3>
                <p className="text-[11px] text-[var(--text-3)] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features-section" className="bg-[var(--bg-2)]/30 border-t border-[var(--border)] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-12 lg:px-20 space-y-12">
            <div className="text-center space-y-2.5">
              <h2 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">Key Features</h2>
              <p className="text-xs text-[var(--text-3)] max-w-lg mx-auto">Discover the advanced technology driving smart active recall on QuizGens.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.features.map((feat, idx) => (
                <div key={idx} className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-6 text-left space-y-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--bg-2)] border border-[var(--border)] flex items-center justify-center text-[var(--indigo-accent)]">
                    {feat.icon}
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-1)]">{feat.title}</h3>
                  <p className="text-[11px] text-[var(--text-3)] leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFITS SECTION */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-12 lg:px-20 space-y-12">
          <div className="text-center space-y-2.5">
            <h2 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">Benefits of {data.keyword}</h2>
            <p className="text-xs text-[var(--text-3)] max-w-lg mx-auto">Boost study speed, identify knowledge gaps, and recall info faster.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.benefits.map((benefit, idx) => (
              <div key={idx} className="border border-[var(--border)] bg-[var(--surface-2)] p-6 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-[var(--text-1)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {benefit.title}
                </h3>
                <p className="text-[11px] text-[var(--text-3)] leading-relaxed pl-4">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WHO IS IT FOR */}
        <section className="bg-[var(--bg-2)]/50 border-y border-[var(--border)] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-12 lg:px-20 space-y-12">
            <div className="text-center space-y-2.5">
              <h2 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">Who is QuizGens For?</h2>
              <p className="text-xs text-[var(--text-3)] max-w-lg mx-auto">Tailored for a variety of educational and professional workflows.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.targetAudience.map((aud, idx) => (
                <div key={idx} className="bg-[var(--surface-2)] border border-[var(--border)] p-6 rounded-xl text-left space-y-3">
                  <h3 className="text-sm font-bold text-[var(--text-1)]">{aud.title}</h3>
                  <p className="text-[11px] text-[var(--text-3)] leading-relaxed">{aud.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQS SECTION */}
        <section className="py-20 max-w-3xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-2.5">
            <h2 className="text-2xl font-extrabold text-[var(--text-1)] tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs text-[var(--text-3)] max-w-lg mx-auto">Everything you need to know about QuizGens {data.keyword}.</p>
          </div>

          <div className="space-y-4">
            {data.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left px-5 py-4 flex justify-between items-start gap-3 hover:bg-[var(--bg-2)]/30 transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-bold text-[var(--text-1)]">{faq.q}</span>
                    <span className={`text-[var(--text-3)] transition-transform duration-200 text-[10px] mt-0.5 ${isOpen ? "rotate-180" : ""}`}>▼</span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-[11px] font-semibold text-[var(--text-3)] leading-relaxed border-t border-[var(--border)] bg-[var(--bg-2)]/20 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* INTERNAL LINKING & BLOGS SECTIONS */}
        <section className="bg-[var(--bg-2)]/50 border-t border-[var(--border)] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* Related Tools */}
            <div className="space-y-4 text-left">
              <h3 className="text-sm font-extrabold text-[var(--text-1)] tracking-tight uppercase" style={{ letterSpacing: "0.05em" }}>Related AI Tools</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-[var(--indigo-accent)]">
                {data.relatedLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link href={link.href} className="hover:underline flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 inline text-[var(--indigo-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Related Blogs */}
            <div className="space-y-4 text-left">
              <h3 className="text-sm font-extrabold text-[var(--text-1)] tracking-tight uppercase" style={{ letterSpacing: "0.05em" }}>Educational Guides</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-[var(--indigo-accent)]">
                {data.relatedBlogs.map((blog, idx) => (
                  <li key={idx}>
                    <Link href={blog.href} className="hover:underline flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 inline text-[var(--indigo-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {blog.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>

        {/* FINAL CALL TO ACTION BANNER */}
        <section className="relative overflow-hidden py-20 bg-linear-to-tr from-[var(--indigo-accent)]/10 to-[var(--bg)] border-t border-[var(--border)] text-center">
          <div className="max-w-3xl mx-auto px-4 space-y-6 relative z-10">
            <h2 className="text-3xl font-extrabold text-[var(--text-1)] tracking-tight">Supercharge Your Study Session Today</h2>
            <p className="text-xs text-[var(--text-3)] max-w-xl mx-auto leading-relaxed">
              Join thousands of students and teachers using QuizGens to accelerate learning, create class worksheets, and practice smarter with Google Gemini AI.
            </p>
            <div className="pt-2">
              <button
                onClick={() => router.push("/login")}
                className="grad-btn px-6 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all duration-[250ms] hover:-translate-y-0.5 shadow-md inline-flex items-center gap-2"
              >
                Create Free Account Now
                <span>→</span>
              </button>
            </div>
          </div>
        </section>

      </main>

      <PublicPageFooter />
    </div>
  );
}
