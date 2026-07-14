import type { Metadata } from "next";
import SEOLandingTemplate, { SEOLandingData } from "@/components/shared/SEOLandingTemplate";

export const metadata: Metadata = {
  title: "AI PDF to MCQ Generator: Convert PDF Documents into MCQs | QuizGens",
  description: "Transform study guides, textbooks, or notes in PDF format into multiple-choice question sheets automatically. Upload your PDF and start studying.",
  alternates: {
    canonical: "https://quizgens.tech/pdf-to-mcq-generator",
  },
  openGraph: {
    title: "AI PDF to MCQ Generator – Turn Textbooks into Practice Tests",
    description: "Extract text from study guides and textbooks as PDFs and convert them to multiple-choice questions instantly.",
    url: "https://quizgens.tech/pdf-to-mcq-generator",
  },
};

const pageData: SEOLandingData = {
  keyword: "PDF to MCQ Generator",
  title: "PDF to MCQ Generator",
  subtitle: "Extract concepts, terms, and sections from PDF books, lecture papers, and study guides to generate custom MCQs in seconds.",
  description: "Transform complex text resources into direct practice options. Upload your document and receive multiple-choice choices complete with reasoning.",
  ctaText: "Convert PDF to MCQs Now",
  features: [
    {
      title: "Intelligent PDF Text Parsing",
      desc: "Cleanses, structures, and parses PDF files including multi-column formats and tables.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: "Semantic Context Matching",
      desc: "Our retrieval pipeline uses semantic search to only build questions on related sections, keeping queries highly targeted.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      title: "Printable Worksheet Exports",
      desc: "Export generated MCQs to PDF worksheets with or without grading answer sheets for offline usage.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )
    }
  ],
  faqs: [
    {
      q: "Can I convert scanned PDFs into MCQs?",
      a: "Yes. QuizGens features an Optical Character Recognition (OCR) scanner preprocessor that processes scanned pages and extracts raw text lines automatically."
    },
    {
      q: "Does it support tables and charts?",
      a: "Our PDF parsing script extracts text values from tables. However, we advise reviewing complex formula questions to verify accurate generation."
    },
    {
      q: "Can I choose the number of options?",
      a: "The generator creates standard four-option multiple choice sheets (A, B, C, D) which is ideal for popular test preparation."
    }
  ],
  benefits: [
    {
      title: "Convert Heavy PDFs into Bite-Sized Qs",
      desc: "Avoid cognitive overload by translating a 100-page book into 20 core conceptual check items."
    },
    {
      title: "Educator Worksheet Builder",
      desc: "Build pop tests and final exam options from lesson syllabus guidelines in under a minute."
    }
  ],
  targetAudience: [
    {
      title: "University Students",
      desc: "Convert textbooks, lecture handouts, and slide lists into prompt revision mock trials."
    },
    {
      title: "Medical & Law Candidates",
      desc: "Review bulky research publications and legal frameworks using targeted test retrieval."
    },
    {
      title: "Corporate Instructors",
      desc: "Quickly convert technical instruction manuals into training quizzes for employees."
    }
  ],
  howItWorksSteps: [
    { step: "1", title: "Upload PDF", desc: "Drag and drop your syllabus or chapter PDF file (up to 25MB)." },
    { step: "2", title: "Select MCQ", desc: "Choose MCQ as the preferred question format." },
    { step: "3", title: "Fine-tune Rules", desc: "Define target quantity and select difficulty scale." },
    { step: "4", title: "Evaluate & Download", desc: "Attempt the quiz, review rationales, and export printable sheets." }
  ],
  relatedLinks: [
    { name: "AI Quiz Generator", href: "/ai-quiz-generator" },
    { name: "Generate Quiz from PDF", href: "/generate-quiz-from-pdf" },
    { name: "Quiz Maker from Notes", href: "/quiz-maker-from-notes" },
    { name: "MCQ Generator", href: "/mcq-generator" }
  ],
  relatedBlogs: [
    { name: "Generate Quiz from PDF Guide", href: "/blog/generate-quiz-from-pdf" },
    { name: "Teachers Quiz Guide", href: "/blog/teachers-guide-to-ai-quizzes" }
  ]
};

export default function Page() {
  return <SEOLandingTemplate data={pageData} />;
}
