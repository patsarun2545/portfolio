/* eslint-disable react-hooks/set-state-in-effect */
// Note: setState is called in async callbacks, not synchronously in effect body
"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { educationSchema } from "@/lib/validations";
import { z } from "zod";
import { getCSRFToken } from "@/lib/csrf-client";
import { useLocale } from "@/hooks/useLocale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { Education } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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


function SortableEducation({
  education,
  onEdit,
  onDelete,
  t,
}: {
  education: Education;
  onEdit: (education: Education) => void;
  onDelete: (id: number) => void;
  t: (key: string) => string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: education.id,
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
              <h3 className="text-base sm:text-lg font-semibold">{education.degree}</h3>
              <p className="text-sm text-muted-foreground">{education.institution}</p>
              {education.fieldOfStudy && (
                <p className="text-xs text-muted-foreground mt-1">{education.fieldOfStudy}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(education.startDate), "MMM yyyy")} -{" "}
                {education.endDate
                  ? format(new Date(education.endDate), "MMM yyyy")
                  : t("admin.educationPage.present")}
              </p>
              {education.gpa && (
                <p className="text-xs text-muted-foreground mt-1">GPA: {education.gpa}</p>
              )}
              {education.description && (
                <p className="mt-2 text-sm text-foreground line-clamp-2">{education.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(education)} aria-label={`Edit education: ${education.degree} at ${education.institution}`}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDelete(education.id)}
              aria-label={`Delete education: ${education.degree} at ${education.institution}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EducationPage() {
  const { t } = useLocale();
  const [educations, setEducations] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [educationToDelete, setEducationToDelete] = useState<Education | null>(null);
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
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(educationSchema),
    defaultValues: {},
  });

  const fetchEducations = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/education");
      const data = await response.json();
      setEducations(data.items || data);
    } catch {
      toast.error(t("admin.educationPage.failedToLoad"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchEducations();
  }, [fetchEducations]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = educations.findIndex((education) => education.id === active.id);
      const newIndex = educations.findIndex((education) => education.id === over.id);

      const newEducations = arrayMove(educations, oldIndex, newIndex);
      setEducations(newEducations);

      // Update sortOrder
      const items = newEducations.map((education, index) => ({
        id: education.id,
        sortOrder: index,
      }));

      try {
        await fetch("/api/admin/education/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCSRFToken(),
          },
          body: JSON.stringify({ items }),
        });
        toast.success(t("admin.educationPage.reorderSuccess"));
      } catch {
        toast.error(t("admin.educationPage.failedToReorder"));
        fetchEducations(); // Revert on error
      }
    }
  };

  const onSubmit = async (data: z.infer<typeof educationSchema>) => {
    setIsSaving(true);
    try {
      const url = editingEducation
        ? `/api/admin/education/${editingEducation.id}`
        : "/api/admin/education";
      const method = editingEducation ? "PUT" : "POST";

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
          editingEducation
            ? t("admin.educationPage.educationUpdated")
            : t("admin.educationPage.educationCreated")
        );
        setIsDialogOpen(false);
        reset();
        setEditingEducation(null);
        setStartDate(undefined);
        setEndDate(undefined);
        fetchEducations();
      } else {
        toast.error(t("admin.educationPage.failedToSave"));
      }
    } catch {
      toast.error(t("admin.educationPage.failedToSave"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (education: Education) => {
    setEditingEducation(education);
    reset({
      ...education,
      startDate: new Date(education.startDate).toISOString().split('T')[0],
      endDate: education.endDate ? new Date(education.endDate).toISOString().split('T')[0] : undefined,
      gpa: education.gpa,
      degreeTh: education.degreeTh || undefined,
      fieldOfStudyTh: education.fieldOfStudyTh || undefined,
      descriptionTh: education.descriptionTh || undefined,
    });
    setStartDate(education.startDate ? new Date(education.startDate) : undefined);
    setEndDate(education.endDate ? new Date(education.endDate) : undefined);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const education = educations.find(e => e.id === id);
    if (education) {
      setEducationToDelete(education);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!educationToDelete) return;

    try {
      const response = await fetch(`/api/admin/education/${educationToDelete.id}`, {
        method: "DELETE",
        headers: { "x-csrf-token": getCSRFToken() },
      });

      if (response.ok) {
        toast.success(t("admin.educationPage.educationDeleted"));
        fetchEducations();
      } else {
        toast.error(t("admin.educationPage.failedToDelete"));
      }
    } catch {
      toast.error(t("admin.educationPage.failedToDelete"));
    } finally {
      setDeleteDialogOpen(false);
      setEducationToDelete(null);
    }
  };

  const handleNewEducation = () => {
    setEditingEducation(null);
    reset({
      degree: "",
      institution: "",
      fieldOfStudy: "",
      description: "",
      startDate: "",
      endDate: "",
      gpa: undefined,
      sortOrder: educations.length,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
          <p className="text-sm text-muted-foreground">{mounted ? t("admin.educationPage.loading") : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("admin.educationPage.title")}</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">{t("admin.educationPage.subtitle")}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewEducation} size="lg" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              {t("admin.educationPage.addEducation")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                {editingEducation ? t("admin.educationPage.editEducation") : t("admin.educationPage.addNewEducation")}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {editingEducation ? t("admin.educationPage.editEducationDesc") : t("admin.educationPage.addNewEducationDesc")}
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
                <Label htmlFor="degree" className="text-sm font-medium">{t("admin.educationPage.degreeLabel")} *</Label>
                <Input id="degree" {...register("degree")} placeholder="Bachelor of Science" />
                {errors.degree && (
                  <p className="text-xs text-destructive">{errors.degree.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution" className="text-sm font-medium">{t("admin.educationPage.institutionLabel")} *</Label>
                <Input
                  id="institution"
                  {...register("institution")}
                  placeholder="University Name"
                />
                {errors.institution && (
                  <p className="text-xs text-destructive">{errors.institution.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fieldOfStudy" className="text-sm font-medium">{t("admin.educationPage.fieldOfStudyLabel")}</Label>
                <Input
                  id="fieldOfStudy"
                  {...register("fieldOfStudy")}
                  placeholder="Computer Science"
                />
                {errors.fieldOfStudy && (
                  <p className="text-xs text-destructive">{errors.fieldOfStudy.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">{t("admin.educationPage.descriptionLabel")}</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe your studies and achievements"
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
                    <Label htmlFor="degreeTh" className="text-sm font-medium">{t("admin.educationPage.degreeTh")}</Label>
                    <Input id="degreeTh" {...register("degreeTh")} placeholder="วิทยาศาสตรบัณฑิต" />
                    {errors.degreeTh && (
                      <p className="text-xs text-destructive">{errors.degreeTh.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fieldOfStudyTh" className="text-sm font-medium">{t("admin.educationPage.fieldOfStudyTh")}</Label>
                    <Input
                      id="fieldOfStudyTh"
                      {...register("fieldOfStudyTh")}
                      placeholder="วิทยาการคอมพิวเตอร์"
                    />
                    {errors.fieldOfStudyTh && (
                      <p className="text-xs text-destructive">{errors.fieldOfStudyTh.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descriptionTh" className="text-sm font-medium">{t("admin.educationPage.descriptionTh")}</Label>
                    <Textarea
                      id="descriptionTh"
                      {...register("descriptionTh")}
                      placeholder="อธิบายการศึกษาและความสำเร็จของคุณ"
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
                  <Label className="text-sm font-medium">{t("admin.educationPage.startDateLabel")} *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-10"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : t("admin.educationPage.pickDate")}
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
                  <Label className="text-sm font-medium">{t("admin.educationPage.endDateLabel")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-10"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : t("admin.educationPage.pickDate")}
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

              <div className="space-y-2">
                <Label htmlFor="gpa" className="text-sm font-medium">{t("admin.educationPage.gpaLabel")}</Label>
                <Input id="gpa" type="number" step="0.01" {...register("gpa")} placeholder="3.5" />
                {errors.gpa && <p className="text-xs text-destructive">{errors.gpa.message}</p>}
              </div>

              <div className="flex justify-end gap-2 sm:gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("admin.educationPage.cancelBtn")}
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? t("admin.educationPage.saving") : editingEducation ? t("admin.educationPage.update") : t("admin.educationPage.create")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("admin.educationPage.confirmDeleteTitle")}</DialogTitle>
              <DialogDescription>
                {t("admin.educationPage.confirmDeleteDesc").replace("{degree}", educationToDelete?.degree || "")}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setEducationToDelete(null);
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
          items={educations.map((e) => e.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {educations.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">{t("admin.educationPage.noEducation")}</p>
                </CardContent>
              </Card>
            ) : (
              educations.map((education) => (
                <SortableEducation
                  key={education.id}
                  education={education}
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
