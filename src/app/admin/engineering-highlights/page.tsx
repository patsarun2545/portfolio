"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { engineeringHighlightSchema } from "@/lib/validations";
import { z } from "zod";
import { getCSRFToken } from "@/lib/csrf-client";
import { useLocale } from "@/hooks/useLocale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
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
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, Eye } from "lucide-react";
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
import type { EngineeringHighlight } from "@/types";

function SortableHighlight({
  highlight,
  onEdit,
  onDelete,
  onToggleVisibility,
}: {
  highlight: EngineeringHighlight;
  onEdit: (highlight: EngineeringHighlight) => void;
  onDelete: (id: number) => void;
  onToggleVisibility: (id: number, isVisible: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: highlight.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="p-3">
        <button {...attributes} {...listeners} className="cursor-grab" aria-label="Drag to reorder highlight">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="p-3 text-sm font-medium truncate max-w-[100px] sm:max-w-none">{highlight.title}</TableCell>
      <TableCell className="p-3 hidden sm:table-cell">
        {highlight.icon ? (
          <Image
            src={highlight.icon}
            alt={highlight.title}
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
            unoptimized
          />
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="p-3 text-sm text-muted-foreground hidden md:table-cell">{highlight.sortOrder}</TableCell>
      <TableCell className="p-3 hidden md:table-cell">
        <Switch
          checked={highlight.isVisible}
          onCheckedChange={(checked) => onToggleVisibility(highlight.id, checked)}
        />
      </TableCell>
      <TableCell className="p-3">
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(highlight)} aria-label={`Edit highlight: ${highlight.title}`}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(highlight.id)} aria-label={`Delete highlight: ${highlight.title}`}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function EngineeringHighlightsPage() {
  const { t } = useLocale();
  const [highlights, setHighlights] = useState<EngineeringHighlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<EngineeringHighlight | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [highlightToDelete, setHighlightToDelete] = useState<EngineeringHighlight | null>(null);
  const [activeTab, setActiveTab] = useState<"en" | "th">("en");
  const [mounted, setMounted] = useState(false);
  const [iconPreview, setIconPreview] = useState("");

  useEffect(() => {
    setMounted(true);
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
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof engineeringHighlightSchema>>({
    resolver: zodResolver(engineeringHighlightSchema),
    defaultValues: {
      title: "",
      titleTh: undefined,
      icon: null,
      sortOrder: 0,
      isVisible: true,
    },
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library
    const subscription = watch((value, { name }) => {
      if (name === "icon") {
        setIconPreview(value.icon || "");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const fetchHighlights = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/engineering-highlights");
      const data = await response.json();
      setHighlights(data.items);
    } catch {
      toast.error(t("admin.engineeringHighlightsPage.failedToLoad"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  const onSubmit = async (data: z.infer<typeof engineeringHighlightSchema>) => {
    setIsSaving(true);
    try {
      const url = editingHighlight
        ? `/api/admin/engineering-highlights/${editingHighlight.id}`
        : "/api/admin/engineering-highlights";
      const method = editingHighlight ? "PUT" : "POST";

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
          editingHighlight ? t("admin.engineeringHighlightsPage.highlightUpdated") : t("admin.engineeringHighlightsPage.highlightCreated")
        );
        setIsDialogOpen(false);
        reset();
        setEditingHighlight(null);
        fetchHighlights();
      } else {
        const errorData = await response.json();
        toast.error(errorData.details || t("admin.engineeringHighlightsPage.failedToSave"));
      }
    } catch {
      toast.error(t("admin.engineeringHighlightsPage.failedToSave"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (highlight: EngineeringHighlight) => {
    setEditingHighlight(highlight);
    setIconPreview(highlight.icon || "");
    reset({
      title: highlight.title,
      titleTh: highlight.titleTh || "",
      icon: highlight.icon,
      sortOrder: highlight.sortOrder,
      isVisible: highlight.isVisible,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    const highlight = highlights.find((h) => h.id === id);
    if (highlight) {
      setHighlightToDelete(highlight);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!highlightToDelete) return;

    try {
      const response = await fetch(`/api/admin/engineering-highlights/${highlightToDelete.id}`, {
        method: "DELETE",
        headers: {
          "x-csrf-token": getCSRFToken(),
        },
      });

      if (response.ok) {
        toast.success(t("admin.engineeringHighlightsPage.highlightDeleted"));
        setDeleteDialogOpen(false);
        setHighlightToDelete(null);
        fetchHighlights();
      } else {
        toast.error(t("admin.engineeringHighlightsPage.failedToDelete"));
      }
    } catch {
      toast.error(t("admin.engineeringHighlightsPage.failedToDelete"));
    }
  };

  const handleToggleVisibility = async (id: number, isVisible: boolean) => {
    try {
      const response = await fetch(`/api/admin/engineering-highlights/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCSRFToken(),
        },
        body: JSON.stringify({ isVisible }),
      });

      if (response.ok) {
        toast.success(t("admin.engineeringHighlightsPage.visibilityUpdated"));
        fetchHighlights();
      } else {
        toast.error(t("admin.engineeringHighlightsPage.failedToUpdateVisibility"));
      }
    } catch {
      toast.error(t("admin.engineeringHighlightsPage.failedToUpdateVisibility"));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = highlights.findIndex((h) => h.id === active.id);
      const newIndex = highlights.findIndex((h) => h.id === over.id);
      const newHighlights = arrayMove(highlights, oldIndex, newIndex);
      setHighlights(newHighlights);

      // Update sortOrder
      const items = newHighlights.map((highlight, index) => ({
        id: highlight.id,
        sortOrder: index,
      }));

      try {
        await fetch("/api/admin/engineering-highlights/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCSRFToken(),
          },
          body: JSON.stringify({ items }),
        });
        toast.success(t("admin.engineeringHighlightsPage.reorderSuccess"));
      } catch {
        toast.error(t("admin.engineeringHighlightsPage.failedToReorder"));
        fetchHighlights(); // Revert on error
      }
    }
  };

  const handleNewHighlight = () => {
    setEditingHighlight(null);
    setIconPreview("");
    reset({
      title: "",
      titleTh: "",
      icon: "",
      sortOrder: highlights.length,
      isVisible: true,
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted-foreground/30 border-t-primary" />
          <p className="text-sm text-muted-foreground">{mounted ? t("admin.engineeringHighlightsPage.loading") : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("admin.engineeringHighlightsPage.title")}</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">{t("admin.engineeringHighlightsPage.subtitle")}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setIconPreview("");
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={handleNewHighlight} size="lg" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              {t("admin.engineeringHighlightsPage.addHighlight")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingHighlight ? t("admin.engineeringHighlightsPage.editHighlight") : t("admin.engineeringHighlightsPage.addNewHighlight")}</DialogTitle>
              <DialogDescription className="text-sm">
                {editingHighlight ? t("admin.engineeringHighlightsPage.editHighlightDesc") : t("admin.engineeringHighlightsPage.addNewHighlightDesc")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <Label htmlFor="title" className="text-sm font-medium">{t("admin.engineeringHighlightsPage.titleLabel")} *</Label>
                <Input id="title" {...register("title")} placeholder="React" />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              {activeTab === "th" && (
                <div className="space-y-2">
                  <Label htmlFor="titleTh" className="text-sm font-medium">{t("admin.engineeringHighlightsPage.titleTh")}</Label>
                  <Input id="titleTh" {...register("titleTh")} placeholder="React (ไม่จำเป็น)" />
                  {errors.titleTh && <p className="text-xs text-destructive">{errors.titleTh.message}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="icon" className="text-sm font-medium">{t("admin.engineeringHighlightsPage.iconLabel")}</Label>
                <Input id="icon" {...register("icon")} placeholder="https://..." />
                {errors.icon && <p className="text-xs text-destructive">{errors.icon.message}</p>}
                {iconPreview && (
                  <div className="flex items-center gap-3 mt-2 p-3 bg-secondary/50 rounded-lg">
                    <Image
                      src={iconPreview}
                      alt="Icon preview"
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain flex-shrink-0"
                      onError={() => setIconPreview("")}
                      unoptimized
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Icon preview</p>
                      <p className="text-xs text-muted-foreground break-all">{iconPreview}</p>
                    </div>
                  </div>
                )}
                <div className="text-xs text-muted-foreground space-y-1 mt-2">
                  <p className="font-medium">Icon sources:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><a href="https://simpleicons.org/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">Simple Icons</a> - Brand/concept icons</li>
                    <li><a href="https://cdn.simpleicons.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">Simple Icons CDN</a> - https://cdn.simpleicons.org/[icon-slug]</li>
                    <li><a href="https://devicon.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">Devicon</a> - Technology icons</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder" className="text-sm font-medium">{t("admin.engineeringHighlightsPage.sortOrderLabel")}</Label>
                <Input id="sortOrder" type="number" {...register("sortOrder", { valueAsNumber: true })} placeholder="0" />
                {errors.sortOrder && <p className="text-xs text-destructive">{errors.sortOrder.message}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isVisible"
                  checked={watch("isVisible")}
                  onCheckedChange={(checked) => setValue("isVisible", checked)}
                />
                <Label htmlFor="isVisible" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <Eye className="h-4 w-4" />
                  {t("admin.engineeringHighlightsPage.visible")}
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("admin.engineeringHighlightsPage.cancelBtn")}
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? t("admin.engineeringHighlightsPage.saving") : editingHighlight ? t("admin.engineeringHighlightsPage.update") : t("admin.engineeringHighlightsPage.create")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={highlights.map((h) => h.id)} strategy={verticalListSortingStrategy}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                      <TableHead className="whitespace-nowrap w-auto">{t("admin.engineeringHighlightsPage.tableTitle")}</TableHead>
                      <TableHead className="whitespace-nowrap w-auto hidden sm:table-cell">{t("admin.engineeringHighlightsPage.tableIcon")}</TableHead>
                      <TableHead className="whitespace-nowrap w-auto hidden md:table-cell">{t("admin.engineeringHighlightsPage.tableSort")}</TableHead>
                      <TableHead className="whitespace-nowrap w-16 hidden md:table-cell">{t("admin.engineeringHighlightsPage.tableVis")}</TableHead>
                      <TableHead className="whitespace-nowrap w-auto text-right">{t("admin.engineeringHighlightsPage.tableActions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {highlights.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {t("admin.engineeringHighlightsPage.noHighlights")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      highlights.map((highlight) => (
                        <SortableHighlight
                          key={highlight.id}
                          highlight={highlight}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onToggleVisibility={handleToggleVisibility}
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("admin.engineeringHighlightsPage.confirmDeleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("admin.engineeringHighlightsPage.confirmDeleteDesc").replace("{title}", highlightToDelete?.title || "")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setHighlightToDelete(null);
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
  );
}