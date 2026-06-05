import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import BlogPostContent from "./BlogPostContent";
import { getServerLocale } from "@/lib/i18n/server";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  const post = await prisma.blogPost.findUnique({
    where: { slug, isPublished: true },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const title = locale === "th" ? (post.titleTh ?? post.title) : post.title;
  const excerpt = locale === "th" ? (post.excerptTh ?? post.excerpt) : post.excerpt;
  const firstImage = post.images[0]?.url;

  return {
    title: title,
    description: excerpt || "",
    openGraph: {
      title: title,
      description: excerpt || "",
      images: firstImage ? [firstImage] : [],
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug, isPublished: true },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!post) notFound();

  return <BlogPostContent post={post} />;
}
