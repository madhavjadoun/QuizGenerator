import type { Metadata } from "next";
import SEOLandingTemplate, { SEOLandingData } from "@/components/shared/SEOLandingTemplate";

export const metadata: Metadata = {
  title: "AI Fill in the Blanks Generator: Vocabulary & Formulas | QuizGens",
  description: "Master taxonomy, vocabulary terms, mathematical equations, and scientific chemical reactions with our Fill in the Blanks test generator.",
  alternates: {
    canonical: "https://quizgens.tech/fill-in-the-blanks-generator",
  },
  openGraph: {
    title: "AI Fill in the Blanks Generator – Master Vocabulary and Formulas",
    description: "Generate fill-in-the-blank quizzes directly from textbooks and study notes.",
    url: "https://quizgens.tech/fill-in-the-blanks-generator",
  },
};

const pageData: SEOLandingData = {
  keyword: "Fill in the Blanks Generator",
  title: "Fill in the Blanks Generator",
  subtitle: "Master key vocabulary words, formulas, equations, and taxonomy terms with AI-generated fill-in-the-blank assessments.",
  description: "Convert PDFs, notebook photos, or copy-pasted summaries into structured sentence completion worksheets.",
  ctaText: "Generate Blanks Free Now",
  features: [
    {
      title: "Sentence Completion Ingestion",
      desc: "Automatically identifies key nouns, verbs, and metrics within your notes and replaces them with blank entries.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      )
    },
    {
      title: "Context-Aware Hints",
      desc: "Each blank question includes a detailed hint or rational description explaining the correct term.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Deep Recall Stimulation",
      desc: "Unlike multiple-choice lists, fill-in-the-blanks force complete memory retrieval, strengthening cognitive connections.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    }
  ],
  faqs: [
    {
      q: "How does the Fill in the Blanks generator work?",
      a: "The generator reads the text, identifies key structural terms (such as specialized vocabulary or names), replaces them with a blank line, and frames the sentence context as a test question."
    },
    {
      q: "Can I download blank worksheets?",
      a: "Yes. Download them as formatted PDFs (with or without answers) for study or class distribution."
    },
    {
      q: "Is it suitable for vocabulary practice?",
      a: "Yes. It is highly effective for testing terms, vocabulary definitions, and historical names."
    }
  ],
  benefits: [
    {
      title: "Forced Active Recall",
      desc: "No distractor options are provided, requiring you to retrieve the exact term from memory."
    },
    {
      title: "Contextual Learning",
      desc: "Test definitions inside full sentence contexts for better linguistic and practical retention."
    }
  ],
  targetAudience: [
    {
      title: "Language Students",
      desc: "Master vocabulary, prepositions, and grammar rules in context."
    },
    {
      title: "STEM Students",
      desc: "Perfect for testing mathematical rules, chemistry terms, and anatomical names."
    },
    {
      title: "Educators",
      desc: "Build worksheets and pop tests in seconds from lesson reading guides."
    }
  ],
  howItWorksSteps: [
    { step: "1", title: "Select Source", desc: "Upload a note PDF/image or paste summary text outlines." },
    { step: "2", title: "Pick Fill Mode", desc: "Choose Fill as the preferred question format." },
    { step: "3", title: "Set Rules", desc: "Select question quantity and difficulty parameters." },
    { step: "4", title: "Practice & Export", desc: "Take the quiz, check definitions, and print worksheets." }
  ],
  relatedLinks: [
    { name: "AI Quiz Generator", href: "/ai-quiz-generator" },
    { name: "PDF to MCQ Generator", href: "/pdf-to-mcq-generator" },
    { name: "Image to Quiz Generator", href: "/image-to-quiz-generator" },
    { name: "MCQ Generator", href: "/mcq-generator" }
  ],
  relatedBlogs: [
    { name: "Fill in the Blanks Guide", href: "/blog/fill-in-the-blank-generator" },
    { name: "Students Guide to Fast Revision", href: "/blog/students-guide-to-faster-revision" }
  ]
};

export default function Page() {
  return <SEOLandingTemplate data={pageData} />;
}
