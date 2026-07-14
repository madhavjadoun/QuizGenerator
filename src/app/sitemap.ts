import { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://quizgens.tech";

  const staticPages = [
    "",
    "/login",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
    "/ai-quiz-generator",
    "/pdf-to-mcq-generator",
    "/image-to-quiz-generator",
    "/text-to-quiz-generator",
    "/generate-quiz-from-pdf",
    "/quiz-maker-from-notes",
    "/mcq-generator",
    "/true-false-generator",
    "/fill-in-the-blanks-generator",
    "/blog",
    "/tools",
    "/author/madhav-jadoun",
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticPages.map((page) => {
    let priority = 0.5;
    let changeFrequency: "daily" | "weekly" | "monthly" | "yearly" = "monthly";

    if (page === "") {
      priority = 1.0;
      changeFrequency = "daily";
    } else if (page.endsWith("-generator") || page.includes("from-pdf") || page.includes("from-notes")) {
      priority = 0.9;
      changeFrequency = "weekly";
    } else if (page === "/blog" || page === "/tools") {
      priority = 0.8;
      changeFrequency = "daily";
    } else if (page === "/author/madhav-jadoun") {
      priority = 0.6;
      changeFrequency = "weekly";
    }

    return {
      url: `${baseUrl}${page}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    };
  });

  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...sitemapEntries, ...blogEntries];
}