"use client";

import Image from "next/image";
import { format } from "date-fns";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BlogPost } from "@prisma/client";
import dynamic from "next/dynamic";
import { useLocale } from "@/hooks/useLocale";

const MarkdownRenderer = dynamic(() => import('./MarkdownRenderer'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-64 bg-muted rounded" />
});

interface BlogPostWithImages extends BlogPost {
  images: Array<{ id: number; url: string; sortOrder: number }>;
}

interface BlogPostContentProps {
  post: BlogPostWithImages;
}

function ImageCarousel({ images }: { images: Array<{ id: number; url: string; sortOrder: number }> }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      <div className="relative h-48 sm:h-56 md:h-64 w-full mb-6 sm:mb-8 rounded-sm overflow-hidden">
        <Image
          src={images[0].url}
          alt="Blog image"
          fill
          sizes="(max-width: 896px) 100vw, 896px"
          className="object-cover rounded-sm"
        />
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative h-48 sm:h-56 md:h-64 w-full mb-6 sm:mb-8 rounded-sm overflow-hidden">
      <Image
        src={images[currentIndex].url}
        alt={`Blog image ${currentIndex + 1}`}
        fill
        sizes="(max-width: 896px) 100vw, 896px"
        className="object-cover rounded-sm"
      />
      <button
        onClick={prevImage}
        className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-background/80 border border-border hover:border-primary text-muted-foreground hover:text-primary p-1.5 transition-colors rounded-sm"
      >
        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
      <button
        onClick={nextImage}
        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-background/80 border border-border hover:border-primary text-muted-foreground hover:text-primary p-1.5 transition-colors rounded-sm"
      >
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`${index === currentIndex ? "w-4 h-0.5 bg-primary" : "w-2 h-0.5 bg-border"} transition-colors`}
          />
        ))}
      </div>
    </div>
  );
}

export default function BlogPostContent({ post }: BlogPostContentProps) {
  const { locale } = useLocale();
  const title = locale === "th" ? (post.titleTh || post.title) : post.title;
  const content = locale === "th" ? (post.contentTh || post.content) : post.content;

  return (
    <article className="max-w-4xl mx-auto py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <ImageCarousel images={post.images} />
      <div className="mb-8 sm:mb-10">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground mb-4 sm:mb-6">
          {title}
        </h1>
        <div className="border-b border-border pb-6 mb-10">
          <div className="flex items-center gap-4">
            {post.publishedAt && (
              <time dateTime={new Date(post.publishedAt).toISOString()} className="font-mono text-xs text-muted-foreground">
                {format(new Date(post.publishedAt), "MMMM dd, yyyy")}
              </time>
            )}
            {post.tags && post.tags.length > 0 && (
              <>
                <span className="text-muted-foreground">•</span>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs border border-border px-2 py-0.5 rounded-sm text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:text-foreground prose-headings:tracking-tight prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4 prose-h1:text-2xl prose-h1:sm:text-3xl prose-h1:mb-4 prose-h1:mt-8 prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:mb-3 prose-h2:mt-6 prose-h3:text-lg prose-h3:sm:text-xl prose-h3:mb-2 prose-h3:mt-4 prose-p:text-muted-foreground prose-p:leading-loose prose-p:mb-4 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-primary prose-code:bg-card prose-code:border prose-code:border-border prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:shadow-md prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4 prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4 prose-li:mb-1 prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-hr:border-border prose-hr:my-8 [&_p]:mb-6 [&_h1]:mt-10 [&_h1]:mb-4 [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:mb-4 [&_ul]:pl-6 [&_ul]:list-disc [&_ol]:mb-4 [&_ol]:pl-6 [&_ol]:list-decimal [&_li]:mb-2 [&_blockquote]:my-6 [&_pre]:my-6 [&_hr]:my-8">
        <MarkdownRenderer content={content} />
      </div>
    </article>
  );
}
