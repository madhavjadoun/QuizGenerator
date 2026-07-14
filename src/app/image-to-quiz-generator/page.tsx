import type { Metadata } from "next";
import SEOLandingTemplate, { SEOLandingData } from "@/components/shared/SEOLandingTemplate";

export const metadata: Metadata = {
  title: "AI Image to Quiz Generator: Scan Notes & Board Photos | QuizGens",
  description: "Scan images, lecture screenshots, and handwritten notebook pages to generate interactive online revision quizzes instantly using OCR.",
  alternates: {
    canonical: "https://quizgens.tech/image-to-quiz-generator",
  },
  openGraph: {
    title: "AI Image to Quiz Generator – Convert Photos to Interactive Tests",
    description: "Scan whiteboard images, textbook screenshots, or hand-written summaries into digital revision questions.",
    url: "https://quizgens.tech/image-to-quiz-generator",
  },
};

const pageData: SEOLandingData = {
  keyword: "Image to Quiz Generator",
  title: "Image to Quiz Generator",
  subtitle: "Snap pictures of study guides, whiteboards, or lecture notes to convert them into digital revision tests using advanced OCR.",
  description: "Stop copying textbook pages by hand. Upload pictures or screenshots, extract the text contents, and convert them to interactive practice questions.",
  ctaText: "Convert Image to Quiz Now",
  features: [
    {
      title: "Optical Character Recognition (OCR)",
      desc: "Our neural net scans pictures to cleanly separate alphanumeric letters from surrounding pixels.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        </svg>
      )
    },
    {
      title: "Clean Layout Extraction",
      desc: "Distinguishes study text columns and lists from background diagrams, shadows, or borders.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zm0 8a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2z" />
        </svg>
      )
    },
    {
      title: "Support for Scanned Handwriting",
      desc: "Cleanly structured handwriting sheets in clear lighting are processed and indexed for question templates.",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      )
    }
  ],
  faqs: [
    {
      q: "What types of images are supported?",
      a: "QuizGens supports PNG, JPG, JPEG, and WEBP formats. Ensure the image is focused and has high-contrast lighting."
    },
    {
      q: "Can I convert photos of whiteboards into quizzes?",
      a: "Yes. Simply snap a photo of classroom board notes, upload it to the dashboard, and the system will read the lines to build questions."
    },
    {
      q: "Does the system keep original image copies?",
      a: "Images are securely uploaded to private buckets in Supabase Storage, maintaining isolated user-only management permissions."
    }
  ],
  benefits: [
    {
      title: "Zero Manual Typing",
      desc: "Avoid the hassle of transcribing board photos, textbook clips, or print handouts. The OCR does it instantly."
    },
    {
      title: "Repurpose Diagram Text",
      desc: "Turn textual guides or labels inside diagrams into test options for better anatomical or structural recall."
    }
  ],
  targetAudience: [
    {
      title: "Visual Learners",
      desc: "Students who take photo captures of blackboard lectures, presentation slides, or handwritten booklets."
    },
    {
      title: "Tutors & Instructors",
      desc: "Scan physical print sheets or handouts to instantly import questions into digital testing panels."
    },
    {
      title: "Revision Groups",
      desc: "Share screenshots of group study slides and verify who answers the generated MCQ questions best."
    }
  ],
  howItWorksSteps: [
    { step: "1", title: "Snap Picture", desc: "Take a photo of physical notes or screenshot a textbook page." },
    { step: "2", title: "Upload File", desc: "Drag and drop the image file into the ingestion box." },
    { step: "3", title: "AI OCR Index", desc: "Our preprocessor scans and extracts the text characters." },
    { step: "4", title: "Generate Quiz", desc: "Select question settings and let Gemini generate your practice test." }
  ],
  relatedLinks: [
    { name: "AI Quiz Generator", href: "/ai-quiz-generator" },
    { name: "PDF to MCQ Generator", href: "/pdf-to-mcq-generator" },
    { name: "Text to Quiz Generator", href: "/text-to-quiz-generator" },
    { name: "Quiz Maker from Notes", href: "/quiz-maker-from-notes" }
  ],
  relatedBlogs: [
    { name: "Convert Images to Quizzes via OCR", href: "/blog/convert-images-into-quizzes-using-ocr" },
    { name: "Smarter Student Revision Tips", href: "/blog/students-guide-to-faster-revision" }
  ]
};

export default function Page() {
  return <SEOLandingTemplate data={pageData} />;
}
