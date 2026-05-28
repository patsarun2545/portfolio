"use client";

import { BlogPost } from "@prisma/client";
import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";
import ImageCarousel from "./ImageCarousel";
import { useState } from "react";

interface BlogPostWithImages extends BlogPost {
  images: Array<{ id: number; url: string; sortOrder: number }>;
}

interface BlogSectionProps {
  posts: BlogPostWithImages[];
}

export default function BlogSection({ posts }: BlogSectionProps) {
  const { locale, t } = useLocale();
  const [showAll, setShowAll] = useState(false);
  const visiblePosts = showAll ? posts : posts.slice(0, 3);

  return (
    <section id="blog" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-6xl mx-auto animate-fade-in-up">
        <p className="font-mono text-xs text-primary tracking-widest uppercase mb-2 text-center">{"// BLOG"}</p>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-8 sm:mb-12 text-center">
          {t("nav.blog")}
        </h2>

        <div className="max-w-3xl mx-auto">
          {visiblePosts.map((post, index) => {
            const title = locale === "th" ? post.titleTh || post.title : post.title;
            const excerpt = locale === "th" ? post.excerptTh || post.excerpt : post.excerpt;
            const isLast = index === visiblePosts.length - 1;
            return (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <div className={`py-6 sm:py-8 group hover:bg-card transition-colors ${!isLast ? 'border-b border-border' : ''}`}>
                  <div className="flex flex-col md:flex-row md:gap-8 md:items-start">
                    {post.images && post.images.length > 0 && (
                      <div className="w-full aspect-video md:w-48 md:shrink-0 overflow-hidden rounded-sm mb-4 md:mb-0">
                        <div className="w-full h-full group-hover:scale-105 transition-transform duration-500">
                          <ImageCarousel images={post.images} sizes="(max-width: 768px) 100vw, 33vw" priority={index === 0} />
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-mono text-xs text-muted-foreground tracking-wider mb-2">
                        {post.publishedAt && new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Bangkok" })}
                      </p>
                      <h3 className="text-sm md:text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                        {title}
                      </h3>
                      {excerpt && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {excerpt}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-xs text-muted-foreground"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <span className="font-mono text-xs text-primary mt-2 block">{t("blog.readMore")}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {posts.length > 3 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowAll(!showAll)}
              className="font-mono text-xs text-primary uppercase tracking-widest border border-border hover:border-primary px-6 py-2 rounded-sm transition-colors"
            >
              {showAll ? t("blog.showLess") : t("blog.showMore")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
