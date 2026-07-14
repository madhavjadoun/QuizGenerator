import type { Metadata } from "next";
import SEOLandingTemplate, { SEOLandingData } from "@/components/shared/SEOLandingTemplate";

export const metadata: Metadata = {
  title: "AI True False Generator: conceptual Binary-Choice Quizzes | QuizGens",
  description: "Quickly assess factual alignment and test core conceptual knowledge with our AI-powered True or False question generator.",
  alternates: {
    canonical: "https://quizgens.tech/true-false-generator",
  },
  openGraph: {
    title: "AI True False Generator – Create Conceptual Binary Quizzes",
    description: "Generate binary-choice True or False worksheets with detailed rationales from raw study material.",
    url: "https://quizgens.tech/true-false-generator",
  },
};

const pageData: SEOLandingData = {
  keyword: "True False Generator",
  title: "True/False Question Generator",
  subtitle: "Create binary-choice True or False statements from notes, PDFs, or summaries using AI.",
  description: "Test core assumptions and conceptual alignment. Ideal for rapid review of dates, scientific formulas, and legal guidelines.",
  ctaText: "Generate True/False Free Now",
  features: [
    {
      title: "Binary Question Structuring",
      desc: "Creates clear factual statements and logical challenges to verify truth values.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Detailed Rationale Keys",
      desc: "Every statement is accompanied by a thorough explanation detailing why it is true or false.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Rapid Concept Verification",
      desc: "Generate lists of up to 50 statements for fast active recall sessions.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ],
  faqs: [
    {
      q: "Why use True/False questions?",
      a: "They remove choice distractors, forcing you to focus entirely on the factuality of specific statements."
    },
    {
      q: "Can I download printable T/F worksheets?",
      a: "Yes. Easily export generated True/False tests as printable PDFs with grading key answer sheets."
    },
    {
      q: "Does the AI support custom text inputs?",
      a: "Yes. Use the Paste Text tab to input outlines or copied summaries directly."
    }
  ],
  benefits: [
    {
      title: "Quick Fact Checks",
      desc: "Perfect for reviewing factual details like math rules, physics principles, or historical dates."
    },
    {
      title: "Clear explanations",
      desc: "Every question includes a tutor-like explanation explaining why the statement is true or false."
    }
  ],
  targetAudience: [
    {
      title: "Elementary & High School Students",
      desc: "Ideal for quick self-assessments on reading assignments and homework."
    },
    {
      title: "Educators",
      desc: "Generate binary-choice pop tests and worksheets in seconds."
    },
    {
      title: "Technical Reviewers",
      desc: "Assess comprehension of rules, safety protocols, and standard guidelines."
    }
  ],
  howItWorksSteps: [
    { step: "1", title: "Select Source", desc: "Upload a note PDF/image or paste plain text outlines." },
    { step: "2", title: "Pick T/F Mode", desc: "Choose T / F as the preferred question format." },
    { step: "3", title: "Configure Rules", desc: "Set desired quantity and difficulty parameters." },
    { step: "4", title: "Assess & Export", desc: "Take the quiz, check explanations, and print worksheets." }
  ],
  relatedLinks: [
    { name: "AI Quiz Generator", href: "/ai-quiz-generator" },
    { name: "PDF to MCQ Generator", href: "/pdf-to-mcq-generator" },
    { name: "Image to Quiz Generator", href: "/image-to-quiz-generator" },
    { name: "MCQ Generator", href: "/mcq-generator" }
  ],
  relatedBlogs: [
    { name: "True/False Question Generator Guide", href: "/blog/true-false-question-generator" },
    { name: "Students Guide to Fast Revision", href: "/blog/students-guide-to-faster-revision" }
  ]
};

export default function Page() {
  return <SEOLandingTemplate data={pageData} />;
}
