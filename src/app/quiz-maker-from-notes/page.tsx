import type { Metadata } from "next";
import SEOLandingTemplate, { SEOLandingData } from "@/components/shared/SEOLandingTemplate";

export const metadata: Metadata = {
  title: "AI Quiz Maker from Notes: Turn Study Notes into Exams | QuizGens",
  description: "Transform raw lecture notes, bullet points, study sheets, and summaries into high-yield mock tests and custom printable worksheets.",
  alternates: {
    canonical: "https://quizgens.tech/quiz-maker-from-notes",
  },
  openGraph: {
    title: "AI Quiz Maker from Notes – Convert Study Notes to Worksheets",
    description: "Turn raw lecture notes, Notion outlines, or handwritten pages into interactive practice assessments.",
    url: "https://quizgens.tech/quiz-maker-from-notes",
  },
};

const pageData: SEOLandingData = {
  keyword: "Quiz Maker from Notes",
  title: "Quiz Maker from Notes",
  subtitle: "Transform class notes, study summaries, and Notion pages into structured, custom exam questionnaires in seconds.",
  description: "Stop passively reviewing bullet points. Upload handwritten pages, import digital outlines, or paste study guides to generate custom quizzes.",
  ctaText: "Make Quiz from Notes Free",
  features: [
    {
      title: "Handwritten OCR Recognition",
      desc: "Upload photos of handwritten notebook pages and let our preprocessor scan and extract notes.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      )
    },
    {
      title: "Bullet Point Parsing",
      desc: "Our engine parses list outline formatting and identifies core definitions for mock tests.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )
    },
    {
      title: "Comprehensive Rationale",
      desc: "Every generated question includes clear explanations to build conceptual understanding and correct mistakes.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    }
  ],
  faqs: [
    {
      q: "Can I copy-paste notes from apps like Notion?",
      a: "Yes. Use our Paste Text feature to input raw notes and generate a quiz without files."
    },
    {
      q: "What types of note files can I upload?",
      a: "We support PDF documents and standard image formats (PNG, JPG, JPEG, WEBP) for note scanning."
    },
    {
      q: "Are the explanations aligned with my notes?",
      a: "Yes. Our RAG model forces the AI to base questions and solutions directly on your uploaded notes."
    }
  ],
  benefits: [
    {
      title: "Supercharge Active Recall",
      desc: "Test your memory dynamically on lecture materials to build stronger cognitive retention."
    },
    {
      title: "Review Anywhere",
      desc: "Export notes assessments into printable PDF worksheets for offline study session prep."
    }
  ],
  targetAudience: [
    {
      title: "High School Students",
      desc: "Turn handwritten notebooks and study guides into quick revision tests."
    },
    {
      title: "University Undergrads",
      desc: "Convert semester lecture outlines and class summaries into final exam practice tests."
    },
    {
      title: "Professional Candidates",
      desc: "Test yourself on technical manuals, training briefs, and compliance guides."
    }
  ],
  howItWorksSteps: [
    { step: "1", title: "Input Notes", desc: "Upload a note PDF/image, or paste plain text outlines." },
    { step: "2", title: "Select Mode", desc: "Choose your preferred question formats (MCQ, T/F, or Fill)." },
    { step: "3", title: "Define Rules", desc: "Select the number of questions and desired difficulty level." },
    { step: "4", title: "Start Test", desc: "Take the quiz, check grading, and print results worksheets." }
  ],
  relatedLinks: [
    { name: "AI Quiz Generator", href: "/ai-quiz-generator" },
    { name: "PDF to MCQ Generator", href: "/pdf-to-mcq-generator" },
    { name: "Image to Quiz Generator", href: "/image-to-quiz-generator" },
    { name: "Text to Quiz Generator", href: "/text-to-quiz-generator" }
  ],
  relatedBlogs: [
    { name: "Make Quiz from Notes Guide", href: "/blog/create-quiz-from-text" },
    { name: "Students Guide to Fast Revision", href: "/blog/students-guide-to-faster-revision" }
  ]
};

export default function Page() {
  return <SEOLandingTemplate data={pageData} />;
}
