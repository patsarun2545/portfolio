"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blogSchema } from "@/lib/validations";
import { z } from "zod";
import { getCSRFToken } from "@/lib/csrf-client";
import { useLocale } from "@/hooks/useLocale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { BlogPost } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, X } from "lucide-react";
import dynamic from "next/dynamic";
import { closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DndContext } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates, useSortable, rectSortingStrategy, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BlogImageWithLoading } from "@/types";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

function SortableBlogPost({ post, onEdit, onDelete, onTogglePublish, t }: { post: BlogPost; onEdit: (post: BlogPost) => void; onDelete: (id: number) => void; onTogglePublish: (id: number, isPublished: boolean) => void; t: (key: string) => string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: post.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="p-3">
        <button {...attributes} {...listeners} className="cursor-grab" aria-label="Drag to reorder post">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="p-3 text-sm font-medium truncate max-w-[120px] sm:max-w-none">{post.title}</TableCell>
      <TableCell className="p-3 text-sm text-muted-foreground hidden sm:table-cell truncate max-w-xs">{post.slug}</TableCell>
      <TableCell className="p-3">
        <Badge variant={post.isPublished ? "default" : "secondary"} className="text-xs">
          {post.isPublished ? t("admin.publish") : t("admin.unpublish")}
        </Badge>
      </TableCell>
      <TableCell className="p-3 text-sm text-muted-foreground hidden md:table-cell">
        {post.publishedAt
          ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
          : t("admin.blogPage.notPublished")}
      </TableCell>
      <TableCell className="p-3">
        <div className="flex gap-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 hidden sm:inline-flex"
            onClick={() => onTogglePublish(post.id, !post.isPublished)}
          >
            {post.isPublished ? t("admin.unpublish") : t("admin.publish")}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(post)} aria-label={`Edit post: ${post.title}`}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(post.id)}
            aria-label={`Delete post: ${post.title}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function SortableImage({ image, onDelete, isDeleting }: { image: BlogImageWithLoading; onDelete: (id: number) => void; isDeleting: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div {...attributes} {...listeners} className="absolute top-1 left-1 bg-card rounded p-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <GripVertical className="h-4 w-4" />
      </div>
      {image.isLoading ? (
        <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground/30 border-t-primary" />
        </div>
      ) : (
        <Image
          src={image.url}
          alt="Preview"
          width={200}
          height={200}
          className="w-full h-32 object-cover rounded-lg"
        />
      )}
      <button
        type="button"
        onClick={() => onDelete(image.id)}
        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        disabled={isDeleting}
        aria-label="Delete image"
      >
        {isDeleting ? (
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-destructive-foreground/30 border-t-destructive-foreground" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export default function BlogPage() {
  const { t } = useLocale();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [images, setImages] = useState<BlogImageWithLoading[]>([]);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [activeTab, setActiveTab] = useState<"en" | "th">("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues: {},
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const title = watch("title");

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/blog");
      const data = await response.json();
      setPosts(data.items || data);
    } catch {
      toast.error(t("admin.blogPage.failedToLoad"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const generatedSlug = useMemo(() => {
    if (!title) return null;

    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check for existing slugs in local state first (for immediate feedback)
    const postsArray = posts as BlogPost[];
    const editingPostId = editingPost?.id;

    let hasExistingSlug = false;
    for (let i = 0; i < postsArray.length; i++) {
      const post = postsArray[i];
      if (post.slug === slug && post.id !== editingPostId) {
        hasExistingSlug = true;
        break;
      }
    }

    if (hasExistingSlug) {
      let counter = 2;
      let newSlug = `${slug}-${counter}`;
      let slugTaken = true;
      while (slugTaken) {
        slugTaken = false;
        for (let i = 0; i < postsArray.length; i++) {
          const post = postsArray[i];
          if (post.slug === newSlug && post.id !== editingPostId) {
            slugTaken = true;
            counter++;
            newSlug = `${slug}-${counter}`;
            break;
          }
        }
      }
      slug = newSlug;
    }

    return slug;
  }, [title, editingPost, posts]);

  useEffect(() => {
    if (generatedSlug) {
      setValue("slug", generatedSlug);
    }
  }, [generatedSlug, setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const postId = editingPost?.id;
    const uploadedUrls: string[] = [];
    const failedFiles: string[] = [];

    // Add placeholder images with loading state
    const tempImages: BlogImageWithLoading[] = Array.from(files).map(() => ({
      id: Date.now() + Math.random(),
      url: "",
      sortOrder: images.length,
      isLoading: true,
    }));

    setImages(prev => [...prev, ...tempImages]);

    // Upload all files
    for (let i = 0; i < Array.from(files).length; i++) {
      const file = Array.from(files)[i];
      const tempImage = tempImages[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "Portfolio/blog");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const result = await response.json();

        if (result.url) {
          uploadedUrls.push(result.url);

          // Update the temp image with the actual URL and remove loading state
          setImages(prev =>
            prev.map(img =>
              img.id === tempImage.id
                ? { ...img, url: result.url, isLoading: false }
                : img
            )
          );
        } else {
          failedFiles.push(file.name);
          // Remove the failed temp image
          setImages(prev => prev.filter(img => img.id !== tempImage.id));
        }
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          toast.error(t("admin.blogPage.uploadTimeout"));
        } else {
          console.error("Upload error for", file.name, error);
          failedFiles.push(file.name);
        }
        // Remove the failed temp image
        setImages(prev => prev.filter(img => img.id !== tempImage.id));
      }
    }

    // Show error for failed uploads
    if (failedFiles.length > 0) {
      toast.error(t("admin.blogPage.imagesFailed").replace("{count}", failedFiles.length.toString()));
    }

    // If we have URLs and a postId, save them all at once
    if (uploadedUrls.length > 0 && postId) {
      try {
        await fetch(`/api/admin/blog/${postId}/images`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCSRFToken(),
          },
          body: JSON.stringify({ urls: uploadedUrls }),
        });

        const imagesResponse = await fetch(`/api/admin/blog/${postId}/images`);
        const imagesData = await imagesResponse.json();
        setImages(imagesData);
      } catch {
        toast.error(t("admin.blogPage.failedToSaveImages"));
      }
    }

    if (uploadedUrls.length > 0) {
      toast.success(t("admin.blogPage.imagesUploaded").replace("{count}", uploadedUrls.length.toString()));
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    const postId = editingPost?.id;
    const image = images.find(img => img.id === imageId);

    // If image is still loading or has no postId, just remove from local state
    if (!postId || image?.isLoading) {
      setImages(images.filter(img => img.id !== imageId));
      return;
    }

    setDeletingImageId(imageId);
    // Delete from database
    try {
      const response = await fetch(`/api/admin/blog/${postId}/images/${imageId}`, {
        method: "DELETE",
        headers: { "x-csrf-token": getCSRFToken() },
      });

      if (response.ok) {
        setImages(images.filter(img => img.id !== imageId));
        toast.success(t("admin.blogPage.imageDeleted"));
      } else {
        toast.error(t("admin.blogPage.failedToDeleteImage"));
      }
    } catch {
      toast.error(t("admin.blogPage.failedToDeleteImage"));
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleImageReorder = async (newImages: BlogImageWithLoading[]) => {
    const postId = editingPost?.id;
    setImages(newImages);

    if (postId) {
      try {
        await fetch(`/api/admin/blog/${postId}/images`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCSRFToken(),
          },
          body: JSON.stringify({
            images: newImages.map((img, index) => ({
              id: img.id,
              sortOrder: index,
            })),
          }),
        });
      } catch {
        toast.error(t("admin.blogPage.failedToReorder"));
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === Number(active.id));
      const newIndex = images.findIndex((img) => img.id === Number(over.id));
      const newImages = arrayMove(images, oldIndex, newIndex);
      handleImageReorder(newImages);
    }
  };

  const handlePostDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = posts.findIndex((post) => post.id === active.id);
      const newIndex = posts.findIndex((post) => post.id === over.id);
      const newPosts = arrayMove(posts, oldIndex, newIndex);
      setPosts(newPosts);

      // Update sortOrder
      const items = newPosts.map((post, index) => ({
        id: post.id,
        sortOrder: index,
      }));

      try {
        await fetch("/api/admin/blog/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCSRFToken(),
          },
          body: JSON.stringify({ items }),
        });
        toast.success(t("admin.blogPage.reorderSuccess"));
      } catch {
        toast.error(t("admin.blogPage.failedToReorder"));
        fetchPosts(); // Revert on error
      }
    }
  };

  const saveImages = async (postId: number) => {
    if (images.length > 0) {
      const imageUrls = images.map(img => img.url).filter(url => url !== "");
      if (imageUrls.length > 0) {
        const response = await fetch(`/api/admin/blog/${postId}/images`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCSRFToken(),
          },
          body: JSON.stringify({ urls: imageUrls }),
        });
        if (!response.ok) {
          throw new Error("Failed to save images");
        }
      }
    }
  };

  const onSubmit = async (data: z.infer<typeof blogSchema>) => {
    setIsSaving(true);
    try {
      const url = editingPost
        ? `/api/admin/blog/${editingPost.id}`
        : "/api/admin/blog";
      const method = editingPost ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCSRFToken(),
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();

        // If creating a new post, save the images
        if (!editingPost) {
          await saveImages(result.id);
        }

        toast.success(
          editingPost ? t("admin.blogPage.postUpdated") : t("admin.blogPage.postCreated")
        );
        setIsDialogOpen(false);
        reset();
        setEditingPost(null);
        setImages([]);
        fetchPosts();
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          // Handle slug collision by auto-generating a new slug
          const currentSlug = data.slug;
          let counter = 2;
          let newSlug = `${currentSlug}-${counter}`;
          let slugTaken = true;
          let retrySuccess = false;

          // Try up to 10 times to find an available slug
          while (slugTaken && counter <= 10) {
            try {
              const retryResponse = await fetch(url, {
                method,
                headers: {
                  "Content-Type": "application/json",
                  "x-csrf-token": getCSRFToken(),
                },
                body: JSON.stringify({ ...data, slug: newSlug }),
              });

              if (retryResponse.ok) {
                const result = await retryResponse.json();

                // If creating a new post, save the images
                if (!editingPost) {
                  await saveImages(result.id);
                }

                toast.success(t("admin.blogPage.postCreated"));
                setIsDialogOpen(false);
                reset();
                setEditingPost(null);
                setImages([]);
                fetchPosts();
                retrySuccess = true;
                slugTaken = false;
              } else {
                counter++;
                newSlug = `${currentSlug}-${counter}`;
              }
            } catch {
              counter++;
              newSlug = `${currentSlug}-${counter}`;
            }
          }

          if (!retrySuccess) {
            toast.error(t("admin.blogPage.slugExists"));
          }
        } else {
          toast.error(errorData.error || t("admin.blogPage.failedToSave"));
        }
      }
    } catch {
      toast.error(t("admin.blogPage.failedToSave"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    reset({
      ...post,
      titleTh: post.titleTh || undefined,
      excerptTh: post.excerptTh || undefined,
      contentTh: post.contentTh || undefined,
    });
    setImages(post.images || []);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const post = posts.find(p => p.id === id);
    if (post) {
      setPostToDelete(post);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;

    try {
      const response = await fetch(`/api/admin/blog/${postToDelete.id}`, {
        method: "DELETE",
        headers: { "x-csrf-token": getCSRFToken() },
      });

      if (response.ok) {
        toast.success(t("admin.blogPage.postDeleted"));
        fetchPosts();
      } else {
        toast.error(t("admin.blogPage.failedToDelete"));
      }
    } catch {
      toast.error(t("admin.blogPage.failedToDelete"));
    } finally {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  const handleTogglePublish = async (id: number, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCSRFToken(),
        },
        body: JSON.stringify({ isPublished }),
      });

      if (response.ok) {
        toast.success(t("admin.blogPage.publishStatusUpdated"));
        fetchPosts();
      } else {
        toast.error(t("admin.blogPage.failedToUpdatePublish"));
      }
    } catch {
      toast.error(t("admin.blogPage.failedToUpdatePublish"));
    }
  };

  const handleNewPost = () => {
    setEditingPost(null);
    reset({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      isPublished: false,
      tags: [],
    });
    setImages([]);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted-foreground/30 border-t-primary" />
          <p className="text-sm text-muted-foreground">{mounted ? t("admin.blogPage.loading") : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("admin.blogPage.title")}</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">{t("admin.blogPage.subtitle")}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewPost} size="lg" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              {t("admin.blogPage.addPost")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">{editingPost ? t("admin.blogPage.editPost") : t("admin.blogPage.addNewPost")}</DialogTitle>
              <DialogDescription className="text-sm">
                {editingPost ? t("admin.blogPage.editPostDesc") : t("admin.blogPage.addNewPostDesc")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
              {/* Language Tabs */}
              <div className="flex gap-2 border-b border-border pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("en")}
                  className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${activeTab === "en"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                    }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("th")}
                  className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${activeTab === "th"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                    }`}
                >
                  ภาษาไทย
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">{t("admin.blogPage.titleLabel")} *</Label>
                <Input id="title" {...register("title")} placeholder="My Blog Post" />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium">{t("admin.blogPage.slugLabel")} *</Label>
                <Input id="slug" {...register("slug")} placeholder="my-blog-post" />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-sm font-medium">{t("admin.blogPage.excerptLabel")}</Label>
                <Textarea
                  id="excerpt"
                  {...register("excerpt")}
                  placeholder="Brief summary of the post"
                  rows={3}
                  className="resize-none"
                />
                {errors.excerpt && (
                  <p className="text-xs text-destructive">{errors.excerpt.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium">{t("admin.blogPage.contentLabel")} *</Label>
                <div data-color-mode="light">
                  <MDEditor
                    value={watch("content") || ""}
                    onChange={(val) => setValue("content", val || "")}
                    height={300}
                  />
                </div>
                {errors.content && (
                  <p className="text-xs text-destructive">{errors.content.message}</p>
                )}
              </div>

              {activeTab === "th" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="titleTh" className="text-sm font-medium">{t("admin.blogPage.titleTh")}</Label>
                    <Input id="titleTh" {...register("titleTh")} placeholder="โพสต์บล็อกของฉัน" />
                    {errors.titleTh && <p className="text-xs text-destructive">{errors.titleTh.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerptTh" className="text-sm font-medium">{t("admin.blogPage.excerptTh")}</Label>
                    <Textarea
                      id="excerptTh"
                      {...register("excerptTh")}
                      placeholder="สรุปเนื้อหาโพสต์แบบย่อ"
                      rows={3}
                      className="resize-none"
                    />
                    {errors.excerptTh && (
                      <p className="text-xs text-destructive">{errors.excerptTh.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contentTh" className="text-sm font-medium">{t("admin.blogPage.contentTh")}</Label>
                    <div data-color-mode="light">
                      <MDEditor
                        value={watch("contentTh") || ""}
                        onChange={(val) => setValue("contentTh", val || "")}
                        height={300}
                      />
                    </div>
                    {errors.contentTh && (
                      <p className="text-xs text-destructive">{errors.contentTh.message}</p>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="images" className="text-sm font-medium">{t("admin.blogPage.images")}</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
                {images.length > 0 && (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {images.map((image) => (
                          <SortableImage
                            key={image.id}
                            image={image}
                            onDelete={handleDeleteImage}
                            isDeleting={deletingImageId === image.id}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublished"
                  checked={watch("isPublished")}
                  onCheckedChange={(checked) => setValue("isPublished", checked)}
                />
                <Label htmlFor="isPublished" className="text-sm font-medium cursor-pointer">{t("admin.blogPage.published")}</Label>
              </div>

              <div className="flex justify-end gap-2 sm:gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("admin.blogPage.cancelBtn")}
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? t("admin.blogPage.saving") : editingPost ? t("admin.blogPage.update") : t("admin.blogPage.create")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("admin.blogPage.confirmDeleteTitle")}</DialogTitle>
              <DialogDescription>
                {t("admin.blogPage.confirmDeleteDesc").replace("{title}", postToDelete?.title || "")}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setPostToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                {t("admin.delete")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePostDragEnd}>
              <SortableContext items={posts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                      <TableHead className="whitespace-nowrap w-auto">{t("admin.blogPage.titleLabel")}</TableHead>
                      <TableHead className="whitespace-nowrap w-auto hidden sm:table-cell">{t("admin.blogPage.slugLabel")}</TableHead>
                      <TableHead className="whitespace-nowrap w-16">{t("admin.blogPage.status")}</TableHead>
                      <TableHead className="whitespace-nowrap w-auto hidden md:table-cell">{t("admin.blogPage.date")}</TableHead>
                      <TableHead className="whitespace-nowrap w-auto text-right">{t("admin.blogPage.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {t("admin.blogPage.noPosts")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      posts.map((post) => (
                        <SortableBlogPost
                          key={post.id}
                          post={post}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onTogglePublish={handleTogglePublish}
                          t={t}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
