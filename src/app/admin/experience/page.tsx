"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { experienceSchema } from "@/lib/validations";
import { z } from "zod";
import { getCSRFToken } from "@/lib/csrf-client";
import { useLocale } from "@/hooks/useLocale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { Experience } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Calendar as CalendarIcon, GripVertical } from "lucide-react";
import { format } from "date-fns";
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
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";


function SortableExperience({
  experience,
  onEdit,
  onDelete,
  t,
}: {
  experience: Experience;
  onEdit: (experience: Experience) => void;
  onDelete: (id: number) => void;
  t: (key: string) => string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: experience.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className="mb-4">
      <CardContent className="p-4 sm:p-5">
        <div className="flex justify-between items-start gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <button {...attributes} {...listeners} className="cursor-grab mt-1 shrink-0">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold">{experience.position}</h3>
              <p className="text-sm text-muted-foreground">{experience.company}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(experience.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })} -{" "}
                {experience.isCurrent
                  ? t("admin.experiencePage.present")
                  : experience.endDate
                    ? new Date(experience.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                    : "No end date"}
              </p>
              {experience.description && (
                <p className="mt-2 text-sm text-foreground line-clamp-2">{experience.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(experience)} aria-label={`Edit experience: ${experience.position} at ${experience.company}`}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDelete(experience.id)}
              aria-label={`Delete experience: ${experience.position} at ${experience.company}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ExperiencePage() {
  const { t } = useLocale();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<Experience | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);
  const [activeTab, setActiveTab] = useState<"en" | "th">("en");

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
    resolver: zodResolver(experienceSchema),
    defaultValues: {},
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const isCurrent = watch("isCurrent");

  const fetchExperiences = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/experience");
      const data = await response.json();
      setExperiences(data.items || data);
    } catch {
      toast.error(t("admin.experiencePage.failedToLoad"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = experiences.findIndex((experience) => experience.id === active.id);
      const newIndex = experiences.findIndex((experience) => experience.id === over.id);

      const newExperiences = arrayMove(experiences, oldIndex, newIndex);
      setExperiences(newExperiences);

      // Update sortOrder
      const items = newExperiences.map((experience, index) => ({
        id: experience.id,
        sortOrder: index,
      }));

      try {
        await fetch("/api/admin/experience/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCSRFToken(),
          },
          body: JSON.stringify({ items }),
        });
        toast.success(t("admin.experiencePage.reorderSuccess"));
      } catch {
        toast.error(t("admin.experiencePage.failedToReorder"));
        fetchExperiences(); // Revert on error
      }
    }
  };

  const onSubmit = async (data: z.infer<typeof experienceSchema>) => {
    setIsSaving(true);
    try {
      const url = editingExperience
        ? `/api/admin/experience/${editingExperience.id}`
        : "/api/admin/experience";
      const method = editingExperience ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCSRFToken(),
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(
          editingExperience
            ? t("admin.experiencePage.experienceUpdated")
            : t("admin.experiencePage.experienceCreated")
        );
        setIsDialogOpen(false);
        reset();
        setEditingExperience(null);
        setStartDate(undefined);
        setEndDate(undefined);
        fetchExperiences();
      } else {
        toast.error(t("admin.experiencePage.failedToSave"));
      }
    } catch {
      toast.error(t("admin.experiencePage.failedToSave"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience);
    reset({
      ...experience,
      positionTh: experience.positionTh || undefined,
      descriptionTh: experience.descriptionTh || undefined,
    });
    setStartDate(experience.startDate ? new Date(experience.startDate) : undefined);
    setEndDate(experience.endDate ? new Date(experience.endDate) : undefined);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const experience = experiences.find(e => e.id === id);
    if (experience) {
      setExperienceToDelete(experience);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!experienceToDelete) return;

    try {
      const response = await fetch(`/api/admin/experience/${experienceToDelete.id}`, {
        method: "DELETE",
        headers: { "x-csrf-token": getCSRFToken() },
      });

      if (response.ok) {
        toast.success(t("admin.experiencePage.experienceDeleted"));
        fetchExperiences();
      } else {
        toast.error(t("admin.experiencePage.failedToDelete"));
      }
    } catch {
      toast.error(t("admin.experiencePage.failedToDelete"));
    } finally {
      setDeleteDialogOpen(false);
      setExperienceToDelete(null);
    }
  };

  const handleNewExperience = () => {
    setEditingExperience(null);
    reset({
      company: "",
      position: "",
      description: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      sortOrder: experiences.length,
    });
    setStartDate(undefined);
    setEndDate(undefined);
    setIsDialogOpen(true);
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      setValue("startDate", format(date, "yyyy-MM-dd"));
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      setValue("endDate", format(date, "yyyy-MM-dd"));
    }
  };

  const handleIsCurrentChange = (checked: boolean) => {
    setValue("isCurrent", checked);
    if (checked) {
      setEndDate(undefined);
      setValue("endDate", "");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
          <p className="text-sm text-muted-foreground">{mounted ? t("admin.experiencePage.loading") : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("admin.experiencePage.title")}</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">{t("admin.experiencePage.subtitle")}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewExperience} size="lg" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              {t("admin.experiencePage.addExperience")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                {editingExperience ? t("admin.experiencePage.editExperience") : t("admin.experiencePage.addNewExperience")}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {editingExperience ? t("admin.experiencePage.editExperienceDesc") : t("admin.experiencePage.addNewExperienceDesc")}
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
                <Label htmlFor="company" className="text-sm font-medium">{t("admin.experiencePage.companyLabel")} *</Label>
                <Input id="company" {...register("company")} placeholder="Company Name" />
                {errors.company && (
                  <p className="text-xs text-destructive">{errors.company.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium">{t("admin.experiencePage.positionLabel")} *</Label>
                <Input id="position" {...register("position")} placeholder="Job Title" />
                {errors.position && (
                  <p className="text-xs text-destructive">{errors.position.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">{t("admin.experiencePage.descriptionLabel")}</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe your role and responsibilities"
                  rows={4}
                  className="resize-none"
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>

              {activeTab === "th" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="positionTh" className="text-sm font-medium">{t("admin.experiencePage.positionTh")}</Label>
                    <Input id="positionTh" {...register("positionTh")} placeholder="ตำแหน่งงาน" />
                    {errors.positionTh && (
                      <p className="text-xs text-destructive">{errors.positionTh.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descriptionTh" className="text-sm font-medium">{t("admin.experiencePage.descriptionTh")}</Label>
                    <Textarea
                      id="descriptionTh"
                      {...register("descriptionTh")}
                      placeholder="อธิบายหน้าที่และความรับผิดชอบของคุณ"
                      rows={4}
                      className="resize-none"
                    />
                    {errors.descriptionTh && (
                      <p className="text-xs text-destructive">{errors.descriptionTh.message}</p>
                    )}
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t("admin.experiencePage.startDateLabel")} *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-10"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : t("admin.experiencePage.pickDate")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={handleStartDateSelect}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input type="hidden" {...register("startDate")} />
                  {errors.startDate && (
                    <p className="text-xs text-destructive">{errors.startDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t("admin.experiencePage.endDateLabel")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-10"
                        disabled={isCurrent}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : t("admin.experiencePage.pickDate")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={handleEndDateSelect}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input type="hidden" {...register("endDate")} />
                  {errors.endDate && (
                    <p className="text-xs text-destructive">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isCurrent"
                  checked={isCurrent}
                  onCheckedChange={handleIsCurrentChange}
                />
                <Label htmlFor="isCurrent" className="text-sm font-medium cursor-pointer">{t("admin.experiencePage.isCurrentLabel")}</Label>
              </div>

              <div className="flex justify-end gap-2 sm:gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("admin.experiencePage.cancelBtn")}
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? t("admin.experiencePage.saving") : editingExperience ? t("admin.experiencePage.update") : t("admin.experiencePage.create")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("admin.experiencePage.confirmDeleteTitle")}</DialogTitle>
              <DialogDescription>
                {t("admin.experiencePage.confirmDeleteDesc").replace("{position}", experienceToDelete?.position || "").replace("{company}", experienceToDelete?.company || "")}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setExperienceToDelete(null);
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={experiences.map((e) => e.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {experiences.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">{t("admin.experiencePage.noExperience")}</p>
                </CardContent>
              </Card>
            ) : (
              experiences.map((experience) => (
                <SortableExperience
                  key={experience.id}
                  experience={experience}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  t={t}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
