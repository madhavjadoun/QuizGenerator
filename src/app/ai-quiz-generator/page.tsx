import type { Metadata } from "next";
import SEOLandingTemplate, { SEOLandingData } from "@/components/shared/SEOLandingTemplate";

export const metadata: Metadata = {
  title: "Free AI Quiz Generator: Turn Any Document Into a Quiz | QuizGens",
  description: "Instantly create interactive practice tests, MCQs, True/False, and Fill-in-the-Blank questions from notes, files, or text using our advanced AI Quiz Generator.",
  alternates: {
    canonical: "https://quizgens.tech/ai-quiz-generator",
  },
  openGraph: {
    title: "AI Quiz Generator – Turn Any File Into a Test",
    description: "Generate targeted multiple choice, fill in the blank, and true/false assessments in seconds using Google Gemini.",
    url: "https://quizgens.tech/ai-quiz-generator",
  },
};

const pageData: SEOLandingData = {
  keyword: "AI Quiz Generator",
  title: "AI Quiz Generator",
  subtitle: "Create interactive practice tests, multiple choice questions, true or false worksheets, and fill-in-the-blank cards from any note, PDF, or text in seconds.",
  description: "Our AI-powered quiz generator reads your study material, extracts the core concepts, and designs structured test items matching your desired count and difficulty.",
  ctaText: "Generate AI Quiz Now",
  features: [
    {
      title: "Gemini-Powered Intelligence",
      desc: "Generates deeply contextual questions matching specific curriculum structures without hallucinated information.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.913-9H12l7.913-9H12L9.813 15.904z" />
        </svg>
      )
    },
    {
      title: "Multiple Formats",
      desc: "Generate multiple-choice, true/false, or fill-in-the-blank question sets.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )
    },
    {
      title: "Detailed Rationale",
      desc: "Every single generated answer choice includes clear explanations so you understand the logic behind the solution.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    }
  ],
  faqs: [
    {
      q: "How does the AI Quiz Generator create questions?",
      a: "QuizGens reads your document (PDF, image, or text) and breaks it down into small semantic chunks. We then use similarity retrieval to provide Google Gemini AI with the relevant segments to create high-quality, course-relevant test items."
    },
    {
      q: "Can I customize the question settings?",
      a: "Yes. You can configure the question count (5 to 50), difficulty (Easy, Medium, Hard), and format (MCQ, True/False, Fill-in-the-Blank)."
    },
    {
      q: "Is there a limit to how many quizzes I can generate?",
      a: "We offer a daily free tier that resets every 24 hours so you can practice consistently."
    }
  ],
  benefits: [
    {
      title: "Eliminate Passive Review",
      desc: "Stop re-reading the same page over and over. Active testing is proven to build stronger neural recall."
    },
    {
      title: "Pinpoint Weaknesses Faster",
      desc: "Immediately identify which textbook chapters or concepts you failed to answer correctly."
    }
  ],
  targetAudience: [
    {
      title: "Active Students",
      desc: "Perfect for high school, college, and university students preparing for midterms, finals, board exams, or SATs."
    },
    {
      title: "Busy Educators",
      desc: "Teachers and tutors can generate classroom handouts, pop quizzes, and exam papers in seconds."
    },
    {
      title: "Lifelong Learners",
      desc: "Professionals studying for certifications, licensing tests, or language credentials."
    }
  ],
  howItWorksSteps: [
    { step: "1", title: "Select Source", desc: "Upload a PDF document, screenshot, notes image, or paste plain text summaries." },
    { step: "2", title: "Pick Formats", desc: "Select MCQ, True or False, or Fill in the Blanks formats." },
    { step: "3", title: "Set Rules", desc: "Select the difficulty level (Easy, Medium, Hard) and number of questions." },
    { step: "4", title: "Test Yourself", desc: "Click Generate, take the interactive test, and download your printable grading report." }
  ],
  relatedLinks: [
    { name: "PDF to MCQ Generator", href: "/pdf-to-mcq-generator" },
    { name: "Image to Quiz Generator", href: "/image-to-quiz-generator" },
    { name: "Text to Quiz Generator", href: "/text-to-quiz-generator" },
    { name: "MCQ Generator", href: "/mcq-generator" }
  ],
  relatedBlogs: [
    { name: "Best AI Quiz Generator Guide", href: "/blog/best-ai-quiz-generator" },
    { name: "Smarter Student Revision Tips", href: "/blog/students-guide-to-faster-revision" }
  ]
};

export default function Page() {
  return <SEOLandingTemplate data={pageData} />;
}
