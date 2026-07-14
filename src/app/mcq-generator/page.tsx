import type { Metadata } from "next";
import SEOLandingTemplate, { SEOLandingData } from "@/components/shared/SEOLandingTemplate";

export const metadata: Metadata = {
  title: "AI MCQ Generator: Create Multiple Choice Questions Online | QuizGens",
  description: "Create custom multiple-choice questions (MCQs) with options and detailed explanations in seconds using Google Gemini AI.",
  alternates: {
    canonical: "https://quizgens.tech/mcq-generator",
  },
  openGraph: {
    title: "AI MCQ Generator – Generate Custom MCQs Online",
    description: "Generate targeted multiple-choice question sheets from textbooks, PDFs, and notes automatically.",
    url: "https://quizgens.tech/mcq-generator",
  },
};

const pageData: SEOLandingData = {
  keyword: "MCQ Generator",
  title: "MCQ Generator",
  subtitle: "Create multiple choice questions (MCQs) complete with four distractor options and detailed solutions using AI.",
  description: "Convert bulky lecture summaries, notes, or PDFs into standard four-option multiple choice sheets for quick active recall.",
  ctaText: "Generate MCQs Free Now",
  features: [
    {
      title: "Four-Option Structuring",
      desc: "Generates one clear correct option and three highly plausible distractors to build critical thinking.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      title: "Reasoned Answer Keys",
      desc: "Every question contains a comprehensive breakdown explaining why the correct choice is accurate and why others are wrong.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Custom Quantity & Rules",
      desc: "Generate up to 50 questions per session. Select Easy, Medium, or Hard difficulty levels.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    }
  ],
  faqs: [
    {
      q: "What is an MCQ generator?",
      a: "An MCQ generator uses AI models to read input text or files, identify primary facts, and structure them into multiple-choice test questions."
    },
    {
      q: "Can I download MCQ keys?",
      a: "Yes. The generated assessments can be saved as printable PDFs for educators or classroom prep."
    },
    {
      q: "Does it support math formulas?",
      a: "Textual formulas are extracted, but advanced formatting may require checking."
    }
  ],
  benefits: [
    {
      title: "Standardized Exam Prep",
      desc: "Mimic GRE, SAT, or licensing exam structures by practicing with four-option multiple choice sheets."
    },
    {
      title: "Identify Distractor Pitfalls",
      desc: "Practice identifying common distractor answers to build better test-taking logic."
    }
  ],
  targetAudience: [
    {
      title: "Test-Takers",
      desc: "Students preparing for exams that heavily rely on multiple-choice formats."
    },
    {
      title: "Curriculum Builders",
      desc: "Educators and writers building quizzes and review handouts for classes."
    },
    {
      title: "Tutoring Centers",
      desc: "Create practice tests for test prep lessons quickly."
    }
  ],
  howItWorksSteps: [
    { step: "1", title: "Select Source", desc: "Upload a note PDF/image or paste summary text outlines." },
    { step: "2", title: "Pick MCQ Mode", desc: "Choose MCQ as the preferred question format." },
    { step: "3", title: "Adjust Rules", desc: "Select the desired quantity and set difficulty parameters." },
    { step: "4", title: "Review & Save", desc: "Attempt the quiz, check grading, and print worksheets." }
  ],
  relatedLinks: [
    { name: "AI Quiz Generator", href: "/ai-quiz-generator" },
    { name: "PDF to MCQ Generator", href: "/pdf-to-mcq-generator" },
    { name: "Image to Quiz Generator", href: "/image-to-quiz-generator" },
    { name: "Text to Quiz Generator", href: "/text-to-quiz-generator" }
  ],
  relatedBlogs: [
    { name: "MCQ Generator Guide", href: "/blog/mcq-generator-guide" },
    { name: "AI Quiz Generator vs ChatGPT", href: "/blog/ai-quiz-generator-vs-chatgpt" }
  ]
};

export default function Page() {
  return <SEOLandingTemplate data={pageData} />;
}
