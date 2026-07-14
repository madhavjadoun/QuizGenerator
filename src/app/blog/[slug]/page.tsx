import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/lib/blog-data";
import BlogDetailClient from "@/components/shared/BlogDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return {};

  return {
    title: `${post.title} | QuizGens Blog`,
    description: post.snippet,
    alternates: {
      canonical: `https://quizgens.tech/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.snippet,
      url: `https://quizgens.tech/blog/${slug}`,
      type: "article",
      authors: [post.author],
      publishedTime: "2026-07-14",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.snippet,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) {
    notFound();
  }

  // Find related posts based on matching tags or fallback to general articles
  const related = BLOG_POSTS.filter(
    (p) => p.slug !== slug && p.tags.some((t) => post.tags.includes(t))
  ).slice(0, 3);
  
  const relatedPosts = related.length > 0 
    ? related 
    : BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  return <BlogDetailClient post={post} relatedPosts={relatedPosts} />;
}
