"use client";

import { BlogPost } from "@prisma/client";
import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";
import ImageCarousel from "./ImageCarousel";

interface BlogPostWithImages extends BlogPost {
  images: Array<{ id: number; url: string; sortOrder: number }>;
}

interface BlogSectionProps {
  posts: BlogPostWithImages[];
}

export default function BlogSection({ posts }: BlogSectionProps) {
  const { locale, t } = useLocale();

  return (
    <section id="blog" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto animate-fade-in-up">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t("nav.blog")}
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {posts.map((post, index) => {
            const title = locale === "th" ? post.titleTh || post.title : post.title;
            const excerpt = locale === "th" ? post.excerptTh || post.excerpt : post.excerpt;
            return (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <div className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-full">
                  <ImageCarousel images={post.images} sizes="(max-width: 768px) 100vw, 33vw" priority={index === 0} />
                  <div className="p-4 sm:p-6">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                      {post.publishedAt && new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Bangkok" })}
                    </p>
                    <h3 className="text-base sm:text-lg xl:text-xl font-bold text-foreground mb-2 sm:mb-3 hover:text-primary transition-colors line-clamp-1">
                      {title}
                    </h3>
                    {excerpt && (
                      <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4 line-clamp-2">
                        {excerpt}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 sm:px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
