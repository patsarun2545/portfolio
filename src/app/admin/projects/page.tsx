"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema } from "@/lib/validations";
import { z } from "zod";
import { getCSRFToken } from "@/lib/csrf-client";
import { useLocale } from "@/hooks/useLocale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { Project } from "@/types";
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
import { Plus, Pencil, Trash2, Star, Eye, X, GripVertical, ZoomIn } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ProjectImageWithLoading } from "@/types";

function SortableImage({ image, onDelete }: { image: ProjectImageWithLoading; onDelete: (id: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div {...attributes} {...listeners} className="absolute top-1 left-1 bg-background rounded p-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <GripVertical className="h-4 w-4" />
      </div>
      {image.isLoading ? (
        <div className="w-full h-32 bg-secondary rounded-lg flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
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
        aria-label="Delete project image"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function SortableProject({
  project,
  onEdit,
  onDelete,
  onToggleFeatured,
  onToggleVisibility,
  onImageClick,
}: {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
  onToggleFeatured: (id: number, isFeatured: boolean) => void;
  onToggleVisibility: (id: number, isVisible: boolean) => void;
  onImageClick: (url: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: project.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const firstImage = project.images && project.images.length > 0 ? project.images[0] : null;

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="p-3">
        <button {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="p-3 hidden sm:table-cell">
        {firstImage ? (
          <button
            onClick={() => onImageClick(firstImage.url)}
            className="relative w-12 h-12 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors group"
            aria-label="View image"
          >
            <Image
              src={firstImage.url}
              alt={project.title}
              fill
              sizes="48px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ZoomIn className="h-4 w-4 text-white" />
            </div>
          </button>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No img</span>
          </div>
        )}
      </TableCell>
      <TableCell className="p-3 text-sm font-medium truncate max-w-[150px]">{project.title}</TableCell>
      <TableCell className="p-3 text-sm max-w-xs truncate text-muted-foreground hidden sm:table-cell">
        {project.description}
      </TableCell>
      <TableCell className="p-3">
        <div className="flex flex-wrap gap-1">
          {project.techStack.slice(0, 2).map((tech) => (
            <Badge key={tech} variant="outline" className="text-xs">
              {tech}
            </Badge>
          ))}
          {project.techStack.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{project.techStack.length - 2}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="p-3 hidden md:table-cell">
        <Switch
          checked={project.isFeatured}
          onCheckedChange={(checked) => onToggleFeatured(project.id, checked)}
        />
      </TableCell>
      <TableCell className="p-3 hidden md:table-cell">
        <Switch
          checked={project.isVisible}
          onCheckedChange={(checked) => onToggleVisibility(project.id, checked)}
        />
      </TableCell>
      <TableCell className="p-3">
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(project)} aria-label={`Edit project: ${project.title}`}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(project.id)}
            aria-label={`Delete project: ${project.title}`}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function ProjectsPage() {
  const { t } = useLocale();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [techStackInput, setTechStackInput] = useState("");
  const [liveUrlsInput, setLiveUrlsInput] = useState("");
  const [images, setImages] = useState<ProjectImageWithLoading[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<"en" | "th">("en");
  const [mounted, setMounted] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string>("");

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {},
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const techStack = watch("techStack") || [];
  const liveUrls = watch("liveUrls") || [];

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/projects");
      const data = await response.json();
      setProjects(data.items || data);
    } catch {
      toast.error(t("admin.projectsPage.failedToLoad"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((project) => project.id === active.id);
      const newIndex = projects.findIndex((project) => project.id === over.id);

      const newProjects = arrayMove(projects, oldIndex, newIndex);
      setProjects(newProjects);

      // Update sortOrder
      const items = newProjects.map((project, index) => ({
        id: project.id,
        sortOrder: index,
      }));

      try {
        await fetch("/api/admin/projects/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCSRFToken(),
          },
          body: JSON.stringify({ items }),
        });
        toast.success(t("admin.projectsPage.reorderSuccess"));
      } catch {
        toast.error(t("admin.projectsPage.failedToReorder"));
        fetchProjects(); // Revert on error
      }
    }
  };

  const handleTechStackAdd = () => {
    if (techStackInput.trim() && !techStack.includes(techStackInput.trim())) {
      setValue("techStack", [...techStack, techStackInput.trim()]);
      setTechStackInput("");
    }
  };

  const handleTechStackRemove = (tech: string) => {
    setValue("techStack", techStack.filter((t: string) => t !== tech));
  };

  const handleTechStackKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTechStackAdd();
    }
  };

  const handleLiveUrlsAdd = () => {
    if (liveUrlsInput.trim() && !liveUrls.includes(liveUrlsInput.trim())) {
      setValue("liveUrls", [...liveUrls, liveUrlsInput.trim()]);
      setLiveUrlsInput("");
    }
  };

  const handleLiveUrlsRemove = (url: string) => {
    setValue("liveUrls", liveUrls.filter((u: string) => u !== url));
  };

  const handleLiveUrlsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLiveUrlsAdd();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const projectId = editingProject?.id;
    const uploadedUrls: string[] = [];
    const failedFiles: string[] = [];

    // Add placeholder images with loading state
    const tempImages: ProjectImageWithLoading[] = Array.from(files).map(() => ({
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
      formData.append("folder", "Portfolio/projects");

      try {
        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
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
        console.error("Upload error for", file.name, error);
        failedFiles.push(file.name);
        // Remove the failed temp image
        setImages(prev => prev.filter(img => img.id !== tempImage.id));
      }
    }

    // Show error for failed uploads
    if (failedFiles.length > 0) {
      toast.error(`${failedFiles.length} ${t("admin.projectsPage.imagesFailed")}`);
    }

    // If we have URLs and a projectId, save them all at once
    if (uploadedUrls.length > 0 && projectId) {
      try {
        await fetch(`/api/admin/projects/${projectId}/images`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCSRFToken(),
          },
          body: JSON.stringify({ urls: uploadedUrls }),
        });

        const imagesResponse = await fetch(`/api/admin/projects/${projectId}/images`);
        const imagesData = await imagesResponse.json();
        setImages(imagesData);
      } catch {
        toast.error(t("admin.projectsPage.failedToSaveImages"));
      }
    }

    if (uploadedUrls.length > 0) {
      toast.success(t("admin.projectsPage.imagesUploaded").replace("{count}", uploadedUrls.length.toString()));
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    const projectId = editingProject?.id;
    const image = images.find(img => img.id === imageId);

    // If image is still loading or has no projectId, just remove from local state
    if (!projectId || image?.isLoading) {
      setImages(images.filter(img => img.id !== imageId));
      return;
    }

    // Delete from database
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/images/${imageId}`, {
        method: "DELETE",
        headers: { "x-csrf-token": getCSRFToken() },
      });

      if (response.ok) {
        setImages(images.filter(img => img.id !== imageId));
        toast.success(t("admin.projectsPage.imageDeleted"));
      } else {
        toast.error(t("admin.projectsPage.failedToDeleteImage"));
      }
    } catch {
      toast.error(t("admin.projectsPage.failedToDeleteImage"));
    }
  };

  const handleImageReorder = async (newImages: ProjectImageWithLoading[]) => {
    const projectId = editingProject?.id;
    setImages(newImages);

    if (projectId) {
      try {
        await fetch(`/api/admin/projects/${projectId}/images`, {
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
        toast.error(t("admin.projectsPage.failedToReorderImages"));
      }
    }
  };

  const imageSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === Number(active.id));
      const newIndex = images.findIndex((img) => img.id === Number(over.id));
      const newImages = arrayMove(images, oldIndex, newIndex);
      handleImageReorder(newImages);
    }
  };

  const onSubmit = async (data: z.infer<typeof projectSchema>) => {
    setIsSaving(true);
    try {
      const url = editingProject
        ? `/api/admin/projects/${editingProject.id}`
        : "/api/admin/projects";
      const method = editingProject ? "PUT" : "POST";

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

        // If creating a new project, save the images
        if (!editingProject && images.length > 0) {
          const imageUrls = images.map(img => img.url).filter(url => url !== "");
          if (imageUrls.length > 0) {
            await fetch(`/api/admin/projects/${result.id}/images`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-csrf-token": getCSRFToken(),
              },
              body: JSON.stringify({ urls: imageUrls }),
            });
          }
        }

        toast.success(
          editingProject ? t("admin.projectsPage.projectUpdated") : t("admin.projectsPage.projectCreated")
        );
        setIsDialogOpen(false);
        reset();
        setEditingProject(null);
        setImages([]);
        fetchProjects();
      } else {
        toast.error(t("admin.projectsPage.failedToSave"));
      }
    } catch {
      toast.error(t("admin.projectsPage.failedToSave"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    reset({
      ...project,
      titleTh: project.titleTh || undefined,
      descriptionTh: project.descriptionTh || undefined,
      longDescriptionTh: project.longDescriptionTh || undefined,
      stack: project.stack || undefined,
      liveUrls: project.liveUrls || [],
    });
    setImages(project.images || []);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setProjectToDelete(project);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      const response = await fetch(`/api/admin/projects/${projectToDelete.id}`, {
        method: "DELETE",
        headers: { "x-csrf-token": getCSRFToken() },
      });

      if (response.ok) {
        toast.success(t("admin.projectsPage.projectDeleted"));
        fetchProjects();
      } else {
        toast.error(t("admin.projectsPage.failedToDelete"));
      }
    } catch {
      toast.error(t("admin.projectsPage.failedToDelete"));
    } finally {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleToggleFeatured = async (id: number, isFeatured: boolean) => {
    try {
      const response = await fetch(`/api/admin/projects/${id}/toggle-featured`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCSRFToken(),
        },
        body: JSON.stringify({ isFeatured }),
      });

      if (response.ok) {
        toast.success(t("admin.projectsPage.featuredStatusUpdated"));
        fetchProjects();
      } else {
        toast.error(t("admin.projectsPage.failedToUpdateFeatured"));
      }
    } catch {
      toast.error(t("admin.projectsPage.failedToUpdateFeatured"));
    }
  };

  const handleToggleVisibility = async (id: number, isVisible: boolean) => {
    try {
      const response = await fetch(`/api/admin/projects/${id}/toggle-visibility`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCSRFToken(),
        },
        body: JSON.stringify({ isVisible }),
      });

      if (response.ok) {
        toast.success(t("admin.projectsPage.visibilityUpdated"));
        fetchProjects();
      } else {
        toast.error(t("admin.projectsPage.failedToUpdateVisibility"));
      }
    } catch {
      toast.error(t("admin.projectsPage.failedToUpdateVisibility"));
    }
  };

  const handleNewProject = () => {
    setEditingProject(null);
    reset({
      title: "",
      description: "",
      longDescription: "",
      techStack: [],
      stack: "",
      githubUrl: "",
      liveUrls: [],
      isFeatured: false,
      isVisible: true,
      sortOrder: projects.length,
    });
    setImages([]);
    setIsDialogOpen(true);
  };

  const handleImageClick = (url: string) => {
    setLightboxImageUrl(url);
    setLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
          <p className="text-sm text-muted-foreground">{mounted ? t("admin.projectsPage.loading") : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("admin.projectsPage.title")}</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">{t("admin.projectsPage.subtitle")}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewProject} size="lg" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              {t("admin.projectsPage.addProject")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">{editingProject ? t("admin.projectsPage.editProject") : t("admin.projectsPage.addNewProject")}</DialogTitle>
              <DialogDescription className="text-sm">
                {editingProject ? t("admin.projectsPage.editProjectDesc") : t("admin.projectsPage.addNewProjectDesc")}
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
                <Label htmlFor="title" className="text-sm font-medium">{t("admin.projectsPage.titleLabel")} *</Label>
                <Input id="title" {...register("title")} placeholder="My Awesome Project" />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">{t("admin.projectsPage.descriptionLabel")} *</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Brief description of the project"
                  rows={3}
                  className="resize-y"
                />
                {errors.description && (
                  <p className="text-xs text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription" className="text-sm font-medium">{t("admin.projectsPage.longDescriptionLabel")}</Label>
                <Textarea
                  id="longDescription"
                  {...register("longDescription")}
                  placeholder="Detailed description of the project"
                  rows={5}
                  className="resize-y"
                />
                {errors.longDescription && (
                  <p className="text-xs text-red-500">{errors.longDescription.message}</p>
                )}
              </div>

              {/* Case Study Section */}
              <fieldset className="space-y-4 p-4 border rounded-lg">
                <legend className="text-sm font-medium px-2">{t("admin.projectsPage.caseStudySection")}</legend>
                <div className="space-y-2">
                  <Label htmlFor="caseStudyProblem" className="text-sm font-medium">{t("admin.projectsPage.caseStudyProblemLabel")}</Label>
                  <Textarea
                    id="caseStudyProblem"
                    {...register("caseStudyProblem")}
                    placeholder="Problem statement for case study"
                    rows={3}
                    className="resize-y"
                  />
                  {errors.caseStudyProblem && (
                    <p className="text-xs text-red-500">{errors.caseStudyProblem.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caseStudySolution" className="text-sm font-medium">{t("admin.projectsPage.caseStudySolutionLabel")}</Label>
                  <Textarea
                    id="caseStudySolution"
                    {...register("caseStudySolution")}
                    placeholder="Solution approach for case study"
                    rows={3}
                    className="resize-y"
                  />
                  {errors.caseStudySolution && (
                    <p className="text-xs text-red-500">{errors.caseStudySolution.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caseStudyChallenges" className="text-sm font-medium">{t("admin.projectsPage.caseStudyChallengesLabel")}</Label>
                  <Textarea
                    id="caseStudyChallenges"
                    {...register("caseStudyChallenges")}
                    placeholder="Challenges faced during development"
                    rows={3}
                    className="resize-y"
                  />
                  {errors.caseStudyChallenges && (
                    <p className="text-xs text-red-500">{errors.caseStudyChallenges.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caseStudyResults" className="text-sm font-medium">{t("admin.projectsPage.caseStudyResultsLabel")}</Label>
                  <Textarea
                    id="caseStudyResults"
                    {...register("caseStudyResults")}
                    placeholder="Results and outcomes"
                    rows={3}
                    className="resize-y"
                  />
                  {errors.caseStudyResults && (
                    <p className="text-xs text-red-500">{errors.caseStudyResults.message}</p>
                  )}
                </div>
              </fieldset>

              {/* Case Study Extended Section */}
              <fieldset className="space-y-4 p-4 border rounded-lg">
                <legend className="text-sm font-medium px-2">{t("admin.projectsPage.caseStudyExtendedSection")}</legend>
                <div className="space-y-2">
                  <Label htmlFor="techStackUsed" className="text-sm font-medium">{t("admin.projectsPage.techStackUsedLabel")}</Label>
                  <Textarea
                    id="techStackUsed"
                    {...register("techStackUsed")}
                    placeholder="Tech stack used in the project"
                    rows={2}
                    className="resize-y"
                  />
                  {errors.techStackUsed && (
                    <p className="text-xs text-red-500">{errors.techStackUsed.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline" className="text-sm font-medium">{t("admin.projectsPage.timelineLabel")}</Label>
                  <Input
                    id="timeline"
                    {...register("timeline")}
                    placeholder="e.g., 3 months"
                  />
                  {errors.timeline && (
                    <p className="text-xs text-red-500">{errors.timeline.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamSize" className="text-sm font-medium">{t("admin.projectsPage.teamSizeLabel")}</Label>
                  <Input
                    id="teamSize"
                    {...register("teamSize")}
                    placeholder="e.g., Solo project, 3 team members"
                  />
                  {errors.teamSize && (
                    <p className="text-xs text-red-500">{errors.teamSize.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keyLearnings" className="text-sm font-medium">{t("admin.projectsPage.keyLearningsLabel")}</Label>
                  <Textarea
                    id="keyLearnings"
                    {...register("keyLearnings")}
                    placeholder="Key learnings from the project"
                    rows={3}
                    className="resize-y"
                  />
                  {errors.keyLearnings && (
                    <p className="text-xs text-red-500">{errors.keyLearnings.message}</p>
                  )}
                </div>
              </fieldset>

              {/* Architecture Section */}
              <fieldset className="space-y-4 p-4 border rounded-lg">
                <legend className="text-sm font-medium px-2">{t("admin.projectsPage.architectureSection")}</legend>
                <div className="space-y-2">
                  <Label htmlFor="architectureDiagram" className="text-sm font-medium">{t("admin.projectsPage.architectureDiagramLabel")}</Label>
                  <Textarea
                    id="architectureDiagram"
                    {...register("architectureDiagram")}
                    placeholder="Architecture diagram (e.g., Component A → Component B → Database)"
                    rows={3}
                    className="resize-y font-mono text-sm"
                  />
                  {errors.architectureDiagram && (
                    <p className="text-xs text-red-500">{errors.architectureDiagram.message}</p>
                  )}
                </div>
              </fieldset>

              {activeTab === "th" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="titleTh" className="text-sm font-medium">{t("admin.projectsPage.titleTh")}</Label>
                    <Input id="titleTh" {...register("titleTh")} placeholder="โปรเจกตที่ยอดเยี่ยมของฉัน" />
                    {errors.titleTh && <p className="text-xs text-red-500">{errors.titleTh.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descriptionTh" className="text-sm font-medium">{t("admin.projectsPage.descriptionTh")}</Label>
                    <Textarea
                      id="descriptionTh"
                      {...register("descriptionTh")}
                      placeholder="คำอธิบายโปรเจกตแบบย่อ"
                      rows={3}
                      className="resize-y"
                    />
                    {errors.descriptionTh && (
                      <p className="text-xs text-red-500">{errors.descriptionTh.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longDescriptionTh" className="text-sm font-medium">{t("admin.projectsPage.longDescriptionTh")}</Label>
                    <Textarea
                      id="longDescriptionTh"
                      {...register("longDescriptionTh")}
                      placeholder="คำอธิบายโปรเจกตแบบละเอียด"
                      rows={5}
                      className="resize-y"
                    />
                    {errors.longDescriptionTh && (
                      <p className="text-xs text-red-500">{errors.longDescriptionTh.message}</p>
                    )}
                  </div>

                  {/* Case Study Section - Thai */}
                  <fieldset className="space-y-4 p-4 border rounded-lg">
                    <legend className="text-sm font-medium px-2">{t("admin.projectsPage.caseStudySection")}</legend>
                    <div className="space-y-2">
                      <Label htmlFor="caseStudyProblemTh" className="text-sm font-medium">{t("admin.projectsPage.caseStudyProblemThLabel")}</Label>
                      <Textarea
                        id="caseStudyProblemTh"
                        {...register("caseStudyProblemTh")}
                        placeholder="ปัญหาสำหรับ Case Study"
                        rows={3}
                        className="resize-y"
                      />
                      {errors.caseStudyProblemTh && (
                        <p className="text-xs text-red-500">{errors.caseStudyProblemTh.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="caseStudySolutionTh" className="text-sm font-medium">{t("admin.projectsPage.caseStudySolutionThLabel")}</Label>
                      <Textarea
                        id="caseStudySolutionTh"
                        {...register("caseStudySolutionTh")}
                        placeholder="วิธีแก้ปัญหาสำหรับ Case Study"
                        rows={3}
                        className="resize-y"
                      />
                      {errors.caseStudySolutionTh && (
                        <p className="text-xs text-red-500">{errors.caseStudySolutionTh.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="caseStudyChallengesTh" className="text-sm font-medium">{t("admin.projectsPage.caseStudyChallengesThLabel")}</Label>
                      <Textarea
                        id="caseStudyChallengesTh"
                        {...register("caseStudyChallengesTh")}
                        placeholder="ความท้าทายที่เผชิญระหว่างการพัฒนา"
                        rows={3}
                        className="resize-y"
                      />
                      {errors.caseStudyChallengesTh && (
                        <p className="text-xs text-red-500">{errors.caseStudyChallengesTh.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="caseStudyResultsTh" className="text-sm font-medium">{t("admin.projectsPage.caseStudyResultsThLabel")}</Label>
                      <Textarea
                        id="caseStudyResultsTh"
                        {...register("caseStudyResultsTh")}
                        placeholder="ผลลัพธ์และผลสำเร็จ"
                        rows={3}
                        className="resize-y"
                      />
                      {errors.caseStudyResultsTh && (
                        <p className="text-xs text-red-500">{errors.caseStudyResultsTh.message}</p>
                      )}
                    </div>
                  </fieldset>

                  {/* Case Study Extended Section - Thai */}
                  <fieldset className="space-y-4 p-4 border rounded-lg">
                    <legend className="text-sm font-medium px-2">{t("admin.projectsPage.caseStudyExtendedSection")}</legend>
                    <div className="space-y-2">
                      <Label htmlFor="techStackUsedTh" className="text-sm font-medium">{t("admin.projectsPage.techStackUsedThLabel")}</Label>
                      <Textarea
                        id="techStackUsedTh"
                        {...register("techStackUsedTh")}
                        placeholder="Tech stack ที่ใช้ในโปรเจกต์"
                        rows={2}
                        className="resize-y"
                      />
                      {errors.techStackUsedTh && (
                        <p className="text-xs text-red-500">{errors.techStackUsedTh.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timelineTh" className="text-sm font-medium">{t("admin.projectsPage.timelineThLabel")}</Label>
                      <Input
                        id="timelineTh"
                        {...register("timelineTh")}
                        placeholder="เช่น 3 เดือน"
                      />
                      {errors.timelineTh && (
                        <p className="text-xs text-red-500">{errors.timelineTh.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teamSizeTh" className="text-sm font-medium">{t("admin.projectsPage.teamSizeThLabel")}</Label>
                      <Input
                        id="teamSizeTh"
                        {...register("teamSizeTh")}
                        placeholder="เช่น โปรเจกต์เดี่ยว, ทีม 3 คน"
                      />
                      {errors.teamSizeTh && (
                        <p className="text-xs text-red-500">{errors.teamSizeTh.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="keyLearningsTh" className="text-sm font-medium">{t("admin.projectsPage.keyLearningsThLabel")}</Label>
                      <Textarea
                        id="keyLearningsTh"
                        {...register("keyLearningsTh")}
                        placeholder="สิ่งที่เรียนรู้จากโปรเจกต์"
                        rows={3}
                        className="resize-y"
                      />
                      {errors.keyLearningsTh && (
                        <p className="text-xs text-red-500">{errors.keyLearningsTh.message}</p>
                      )}
                    </div>
                  </fieldset>

                  {/* Architecture Section - Thai */}
                  <fieldset className="space-y-4 p-4 border rounded-lg">
                    <legend className="text-sm font-medium px-2">{t("admin.projectsPage.architectureSection")}</legend>
                    <div className="space-y-2">
                      <Label htmlFor="architectureDiagramTh" className="text-sm font-medium">{t("admin.projectsPage.architectureDiagramThLabel")}</Label>
                      <Textarea
                        id="architectureDiagramTh"
                        {...register("architectureDiagramTh")}
                        placeholder="Architecture Diagram (เช่น Component A → Component B → Database)"
                        rows={3}
                        className="resize-y font-mono text-sm"
                      />
                      {errors.architectureDiagramTh && (
                        <p className="text-xs text-red-500">{errors.architectureDiagramTh.message}</p>
                      )}
                    </div>
                  </fieldset>
                </>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("admin.projectsPage.techStackLabel")}</Label>
                <div className="flex gap-2">
                  <Input
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    onKeyDown={handleTechStackKeyDown}
                    placeholder={t("admin.projectsPage.techStackPlaceholder")}
                  />
                  <Button type="button" variant="outline" onClick={handleTechStackAdd}>
                    {t("admin.projectsPage.add")}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {techStack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="gap-1">
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleTechStackRemove(tech)}
                        className="hover:text-red-500"
                        aria-label={`Remove ${tech} from tech stack`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stack" className="text-sm font-medium">{t("admin.projectsPage.stackLabel")}</Label>
                <Input
                  id="stack"
                  {...register("stack")}
                  placeholder="MERN Stack"
                />
                {errors.stack && (
                  <p className="text-xs text-red-500">{errors.stack.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-2">
                  <Label htmlFor="githubUrl" className="text-sm font-medium">{t("admin.projectsPage.githubUrlLabel")}</Label>
                  <Input
                    id="githubUrl"
                    {...register("githubUrl")}
                    placeholder="https://github.com/..."
                  />
                  {errors.githubUrl && (
                    <p className="text-xs text-red-500">{errors.githubUrl.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t("admin.projectsPage.liveUrlsLabel")}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={liveUrlsInput}
                      onChange={(e) => setLiveUrlsInput(e.target.value)}
                      onKeyDown={handleLiveUrlsKeyDown}
                      placeholder="https://..."
                    />
                    <Button type="button" variant="outline" onClick={handleLiveUrlsAdd}>
                      {t("admin.projectsPage.add")}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {liveUrls.map((url, index) => (
                      <Badge key={url} variant="secondary" className="gap-1">
                        {index === 0 ? "Customer" : index === 1 ? "Admin" : `URL ${index + 1}`}
                        <button
                          type="button"
                          onClick={() => handleLiveUrlsRemove(url)}
                          className="hover:text-red-500"
                          aria-label="Remove URL from live URLs"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {errors.liveUrls && (
                    <p className="text-xs text-red-500">{errors.liveUrls.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="images" className="text-sm font-medium">{t("admin.projectsPage.imagesLabel")}</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
                {images.length > 0 && (
                  <DndContext sensors={imageSensors} collisionDetection={closestCenter} onDragEnd={handleImageDragEnd}>
                    <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {images.map((image) => (
                          <SortableImage key={image.id} image={image} onDelete={handleDeleteImage} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>

              <div className="flex items-center space-x-4 sm:space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFeatured"
                    checked={watch("isFeatured")}
                    onCheckedChange={(checked) => setValue("isFeatured", checked)}
                  />
                  <Label htmlFor="isFeatured" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <Star className="h-4 w-4" />
                    {t("admin.projectsPage.featured")}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isVisible"
                    checked={watch("isVisible")}
                    onCheckedChange={(checked) => setValue("isVisible", checked)}
                  />
                  <Label htmlFor="isVisible" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <Eye className="h-4 w-4" />
                    {t("admin.projectsPage.visible")}
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 sm:gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("admin.projectsPage.cancelBtn")}
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? t("admin.projectsPage.saving") : editingProject ? t("admin.projectsPage.update") : t("admin.projectsPage.create")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("admin.projectsPage.confirmDeleteTitle")}</DialogTitle>
              <DialogDescription>
                {t("admin.projectsPage.confirmDeleteDesc").replace("{title}", projectToDelete?.title || "")}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setProjectToDelete(null);
                }}
              >
                {t("admin.cancel")}
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                {t("admin.delete")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {lightboxOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(false);
              }}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={lightboxImageUrl}
                alt="Full size image"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={projects.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                      <TableHead className="whitespace-nowrap w-16 hidden sm:table-cell">{t("admin.projectsPage.image")}</TableHead>
                      <TableHead className="whitespace-nowrap w-auto">{t("admin.projectsPage.tableTitle")}</TableHead>
                      <TableHead className="whitespace-nowrap w-auto hidden sm:table-cell">{t("admin.projectsPage.tableDescription")}</TableHead>
                      <TableHead className="whitespace-nowrap w-auto">{t("admin.projectsPage.tableTechStack")}</TableHead>
                      <TableHead className="whitespace-nowrap w-16 hidden md:table-cell">{t("admin.projectsPage.tableFeatured")}</TableHead>
                      <TableHead className="whitespace-nowrap w-16 hidden md:table-cell">{t("admin.projectsPage.tableVisible")}</TableHead>
                      <TableHead className="whitespace-nowrap w-auto text-right">{t("admin.projectsPage.tableActions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {t("admin.projectsPage.noProjects")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      projects.map((project) => (
                        <SortableProject
                          key={project.id}
                          project={project}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onToggleFeatured={handleToggleFeatured}
                          onToggleVisibility={handleToggleVisibility}
                          onImageClick={handleImageClick}
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
