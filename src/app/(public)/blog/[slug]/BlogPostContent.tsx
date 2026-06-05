"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Clock, ArrowLeft } from "lucide-react";
import { BlogPost } from "@prisma/client";
import dynamic from "next/dynamic";
import { useLocale } from "@/hooks/useLocale";
import ImageCarousel from "@/components/public/ImageCarousel";

const MarkdownRenderer = dynamic(() => import('./MarkdownRenderer'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-64 bg-muted/50 rounded-2xl" />
});

interface BlogPostWithImages extends BlogPost {
  images: Array<{ id: number; url: string; sortOrder: number }>;
}

interface BlogPostContentProps {
  post: BlogPostWithImages;
}

export default function BlogPostContent({ post }: BlogPostContentProps) {
  const { locale } = useLocale();
  const title = locale === "th" ? (post.titleTh || post.title) : post.title;
  const content = locale === "th" ? (post.contentTh || post.content) : post.content;

  // Calculate estimated reading time (average 200 words per minute)
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <article className="max-w-4xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="mb-8">
        <Link 
          href="/#blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          {locale === "th" ? "กลับไปบทความ" : "Back to Blog"}
        </Link>
      </div>

      {/* Image Carousel */}
      <div className="mb-8 sm:mb-12">
        <ImageCarousel images={post.images} sizes="(max-width: 896px) 100vw, 896px" priority={true} />
      </div>

      {/* Header Section */}
      <div className="mb-10 sm:mb-12">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
          {title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
          {post.publishedAt && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <time dateTime={new Date(post.publishedAt).toISOString()}>
                {format(new Date(post.publishedAt), "MMMM dd, yyyy")}
              </time>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{readingTime} {locale === "th" ? "นาที" : "min"} {locale === "th" ? "อ่าน" : "read"}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:text-foreground prose-headings:tracking-tight prose-headings:font-bold prose-headings:mt-10 prose-headings:mb-4 prose-h1:text-3xl prose-h1:sm:text-4xl prose-h1:mb-6 prose-h1:mt-12 prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:mb-4 prose-h2:mt-10 prose-h3:text-xl prose-h3:sm:text-2xl prose-h3:mb-3 prose-h3:mt-8 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-primary prose-code:bg-primary/10 prose-code:border prose-code:border-primary/20 prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:shadow-lg prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6 prose-li:mb-2 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-hr:border-border prose-hr:my-10 [&_p]:mb-6 [&_h1]:mt-12 [&_h1]:mb-6 [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:mt-8 [&_h3]:mb-3 [&_ul]:mb-6 [&_ul]:pl-6 [&_ul]:list-disc [&_ol]:mb-6 [&_ol]:pl-6 [&_ol]:list-decimal [&_li]:mb-2 [&_blockquote]:my-6 [&_pre]:my-6 [&_hr]:my-10">
        <MarkdownRenderer content={content} />
      </div>
    </article>
  );
}
