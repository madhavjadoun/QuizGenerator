import type { Metadata } from "next";
import SEOLandingTemplate, { SEOLandingData } from "@/components/shared/SEOLandingTemplate";

export const metadata: Metadata = {
  title: "How to Generate Quiz from PDF Files Automatically | QuizGens",
  description: "Looking to generate quizzes from PDF textbooks or slides? Upload your academic documents to instantly create targeted test prep questions.",
  alternates: {
    canonical: "https://quizgens.tech/generate-quiz-from-pdf",
  },
  openGraph: {
    title: "Generate Quiz from PDF – Step-by-Step AI Assessment Guide",
    description: "Learn how to turn textbooks, slides, and syllabus files in PDF format into interactive assessments.",
    url: "https://quizgens.tech/generate-quiz-from-pdf",
  },
};

const pageData: SEOLandingData = {
  keyword: "Generate Quiz from PDF",
  title: "Generate Quiz from PDF",
  subtitle: "Learn how to transform lecture slides, textbooks, and syllabus guides into custom mock tests using AI.",
  description: "Stop passively reviewing heavy academic PDFs. Upload files up to 25MB and let Google Gemini AI build interactive MCQ, Fill-in-the-Blank, and True/False tests.",
  ctaText: "Generate Quiz from PDF Free",
  features: [
    {
      title: "Scanned PDF OCR Scanning",
      desc: "Automatically extracts text lines from scanned textbook pages and images.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h.01M16 12h.01M8 16h.01m-3.022-4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 9c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      title: "RAG Semantic Retrieval",
      desc: "Our retrieval structure ensures that the generated questions stick to your provided material, eliminating random hallucinations.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      title: "Explanations & Rationale",
      desc: "Every question comes with descriptive explanations, serving as a dynamic tutor for your study sessions.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ],
  faqs: [
    {
      q: "Can I generate tests from password-protected PDFs?",
      a: "No. You must remove passwords and encryption from your files before uploading them to the platform."
    },
    {
      q: "What is the maximum file size for PDFs?",
      a: "The maximum file size supported is 25 MB per upload."
    },
    {
      q: "Can I download the questions for offline study?",
      a: "Yes. Use the download button in the generated quiz dashboard to save the questions as a clean PDF worksheet."
    }
  ],
  benefits: [
    {
      title: "Save Hours of Lesson Prep",
      desc: "Educators can turn curriculum guides or lecture materials into ready-made assessments in seconds."
    },
    {
      title: "Boost Information Retention",
      desc: "Replacing passive textbook reading with active retrieval improves long-term memory retention."
    }
  ],
  targetAudience: [
    {
      title: "K-12 & College Students",
      desc: "Perfect for reviewing textbook chapters, class slides, and reading assignments."
    },
    {
      title: "High School Teachers",
      desc: "Build worksheets and mock tests to challenge students and track conceptual alignment."
    },
    {
      title: "Professional Candidates",
      desc: "Prepare for CPA, MCAT, LSAT, or bar examinations using customized PDF questionnaires."
    }
  ],
  howItWorksSteps: [
    { step: "1", title: "Select PDF", desc: "Choose a textbook or study guide PDF file (up to 25MB)." },
    { step: "2", title: "Upload File", desc: "Drag and drop the file into the upload zone to parse it." },
    { step: "3", title: "Set Parameters", desc: "Choose the number of questions, format, and difficulty level." },
    { step: "4", title: "Practice & Export", desc: "Take the quiz, check your answers, and download a printable report." }
  ],
  relatedLinks: [
    { name: "AI Quiz Generator", href: "/ai-quiz-generator" },
    { name: "PDF to MCQ Generator", href: "/pdf-to-mcq-generator" },
    { name: "Image to Quiz Generator", href: "/image-to-quiz-generator" },
    { name: "Quiz Maker from Notes", href: "/quiz-maker-from-notes" }
  ],
  relatedBlogs: [
    { name: "How to Generate Quizzes from PDFs", href: "/blog/generate-quiz-from-pdf" },
    { name: "Students Guide to Fast Revision", href: "/blog/students-guide-to-faster-revision" }
  ]
};

export default function Page() {
  return <SEOLandingTemplate data={pageData} />;
}
