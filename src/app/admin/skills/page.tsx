"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skillSchema } from "@/lib/validations";
import { z } from "zod";
import { getCSRFToken } from "@/lib/csrf-client";
import { useLocale } from "@/hooks/useLocale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { Skill } from "@/types";

function SortableSkill({
  skill,
  onEdit,
  onDelete,
  onToggleVisibility,
}: {
  skill: Skill;
  onEdit: (skill: Skill) => void;
  onDelete: (id: number) => void;
  onToggleVisibility: (id: number, isVisible: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: skill.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="p-3">
        <button {...attributes} {...listeners} className="cursor-grab" aria-label="Drag to reorder skill">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="p-3 text-sm hidden sm:table-cell">{skill.category}</TableCell>
      <TableCell className="p-3 text-sm font-medium truncate max-w-[100px] sm:max-w-none">{skill.name}</TableCell>
      <TableCell className="p-3 hidden sm:table-cell">
        {skill.iconUrl ? (
          <Image
            src={skill.iconUrl}
            alt={skill.name}
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
            unoptimized
          />
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="p-3">
        <div className="flex items-center gap-2">
          <div className="w-12 sm:w-24 bg-secondary rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full"
              style={{ width: `${skill.proficiency}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{skill.proficiency}%</span>
        </div>
      </TableCell>
      <TableCell className="p-3 hidden md:table-cell">
        <Switch
          checked={skill.isVisible}
          onCheckedChange={(checked) => onToggleVisibility(skill.id, checked)}
        />
      </TableCell>
      <TableCell className="p-3">
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(skill)} aria-label={`Edit skill: ${skill.name}`}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(skill.id)} aria-label={`Delete skill: ${skill.name}`}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function SkillsPage() {
  const { t } = useLocale();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesData, setCategoriesData] = useState<{ category: string; categoryTh: string | null }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);
  const [activeTab, setActiveTab] = useState<"en" | "th">("en");
  const [mounted, setMounted] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<{ category: string; categoryTh: string | null } | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryTh, setNewCategoryTh] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryNameTh, setEditCategoryNameTh] = useState("");
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
  } = useForm<z.infer<typeof skillSchema>>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      proficiency: 50,
      sortOrder: 0,
      isVisible: true,
    },
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library
    const subscription = watch((value, { name }) => {
      if (name === "iconUrl") {
        setIconPreview(value.iconUrl || "");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/skills/categories");
      const data = await response.json();
      setCategoriesData(data.categories || []);
      const uniqueCategories = (data.categories || []).map((c: { category: string }) => c.category).sort();
      setCategories(uniqueCategories);
    } catch {
      toast.error(t("admin.skillsPage.failedToLoad"));
    }
  }, [t]);

  const fetchSkills = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/skills");
      const data = await response.json();
      const skillsData = data.items || data;
      setSkills(skillsData);

      // Fetch categories separately
      await fetchCategories();
    } catch {
      toast.error(t("admin.skillsPage.failedToLoad"));
    } finally {
      setIsLoading(false);
    }
  }, [t, fetchCategories]);

  useEffect(() => {
    fetchSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = skills.findIndex((skill) => skill.id === active.id);
      const newIndex = skills.findIndex((skill) => skill.id === over.id);

      const newSkills = arrayMove(skills, oldIndex, newIndex);
      setSkills(newSkills);

      // Update sortOrder
      const items = newSkills.map((skill, index) => ({
        id: skill.id,
        sortOrder: index,
      }));

      try {
        await fetch("/api/admin/skills/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": getCSRFToken(),
          },
          body: JSON.stringify({ items }),
        });
        toast.success(t("admin.skillsPage.reorderSuccess"));
      } catch {
        toast.error(t("admin.skillsPage.failedToReorder"));
        fetchSkills(); // Revert on error
      }
    }
  };

  const onSubmit = async (data: z.infer<typeof skillSchema>) => {
    setIsSaving(true);
    try {
      const url = editingSkill
        ? `/api/admin/skills/${editingSkill.id}`
        : "/api/admin/skills";
      const method = editingSkill ? "PUT" : "POST";

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
          editingSkill ? t("admin.skillsPage.skillUpdated") : t("admin.skillsPage.skillCreated")
        );
        setIsDialogOpen(false);
        reset();
        setEditingSkill(null);
        setIconPreview("");
        fetchSkills();
      } else {
        toast.error(t("admin.skillsPage.failedToSave"));
      }
    } catch {
      toast.error(t("admin.skillsPage.failedToSave"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setIconPreview(skill.iconUrl || "");
    reset(skill);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const skill = skills.find(s => s.id === id);
    if (skill) {
      setSkillToDelete(skill);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!skillToDelete) return;

    try {
      const response = await fetch(`/api/admin/skills/${skillToDelete.id}`, {
        method: "DELETE",
        headers: { "x-csrf-token": getCSRFToken() },
      });

      if (response.ok) {
        toast.success(t("admin.skillsPage.skillDeleted"));
        fetchSkills();
      } else {
        toast.error(t("admin.skillsPage.failedToDelete"));
      }
    } catch {
      toast.error(t("admin.skillsPage.failedToDelete"));
    } finally {
      setDeleteDialogOpen(false);
      setSkillToDelete(null);
    }
  };

  const handleToggleVisibility = async (id: number, isVisible: boolean) => {
    try {
      const response = await fetch(`/api/admin/skills/${id}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCSRFToken(),
        },
        body: JSON.stringify({ isVisible }),
      });

      if (response.ok) {
        toast.success(t("admin.skillsPage.visibilityUpdated"));
        fetchSkills();
      } else {
        toast.error(t("admin.skillsPage.failedToUpdateVisibility"));
      }
    } catch {
      toast.error(t("admin.skillsPage.failedToUpdateVisibility"));
    }
  };

  const handleNewSkill = () => {
    setEditingSkill(null);
    setIconPreview("");
    reset({
      name: "",
      category: "",
      iconUrl: "",
      proficiency: 50,
      sortOrder: skills.length,
      isVisible: true,
    });
    setIsDialogOpen(true);
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error(t("admin.skillsPage.categoryRequired"));
      return;
    }

    try {
      const response = await fetch("/api/admin/skills/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCSRFToken(),
        },
        body: JSON.stringify({
          category: newCategory,
          categoryTh: newCategoryTh || undefined,
        }),
      });

      if (response.ok) {
        toast.success(t("admin.skillsPage.categoryAdded"));
        setNewCategory("");
        setNewCategoryTh("");
        setCategoryDialogOpen(false);
        fetchCategories();
        fetchSkills();
      } else {
        const error = await response.json();
        toast.error(error.error || t("admin.skillsPage.failedToAddCategory"));
      }
    } catch {
      toast.error(t("admin.skillsPage.failedToAddCategory"));
    }
  };

  const handleDeleteCategory = async (category: string) => {
    setCategoryToDelete(category);
    setDeleteCategoryDialogOpen(true);
  };

  const handleEditCategory = (cat: { category: string; categoryTh: string | null }) => {
    setCategoryToEdit(cat);
    setEditCategoryName(cat.category);
    setEditCategoryNameTh(cat.categoryTh || "");
    setEditCategoryDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!categoryToEdit || !editCategoryName.trim()) {
      toast.error(t("admin.skillsPage.categoryRequired"));
      return;
    }

    try {
      const response = await fetch("/api/admin/skills/categories", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCSRFToken(),
        },
        body: JSON.stringify({
          oldCategory: categoryToEdit.category,
          newCategory: editCategoryName,
          newCategoryTh: editCategoryNameTh || undefined,
        }),
      });

      if (response.ok) {
        toast.success(t("admin.skillsPage.categoryUpdated"));
        setEditCategoryDialogOpen(false);
        setCategoryToEdit(null);
        setEditCategoryName("");
        setEditCategoryNameTh("");
        fetchCategories();
        fetchSkills();
      } else {
        const error = await response.json();
        toast.error(error.error || t("admin.skillsPage.failedToUpdateCategory"));
      }
    } catch {
      toast.error(t("admin.skillsPage.failedToUpdateCategory"));
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await fetch(`/api/admin/skills/categories?category=${encodeURIComponent(categoryToDelete)}`, {
        method: "DELETE",
        headers: { "x-csrf-token": getCSRFToken() },
      });

      if (response.ok) {
        toast.success(t("admin.skillsPage.categoryDeleted"));
        setDeleteCategoryDialogOpen(false);
        setCategoryToDelete(null);
        fetchCategories();
        fetchSkills();
      } else {
        const error = await response.json();
        toast.error(error.error || t("admin.skillsPage.failedToDeleteCategory"));
      }
    } catch {
      toast.error(t("admin.skillsPage.failedToDeleteCategory"));
    } finally {
      setDeleteCategoryDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
          <p className="text-sm text-muted-foreground">{mounted ? t("admin.skillsPage.loading") : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("admin.skillsPage.title")}</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">{t("admin.skillsPage.subtitle")}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                {t("admin.skillsPage.addCategory")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">{t("admin.skillsPage.addCategory")}</DialogTitle>
                <DialogDescription className="text-sm">{t("admin.skillsPage.manageCategoriesDesc")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="newCategory" className="text-sm font-medium">{t("admin.skillsPage.categoryNameLabel")} *</Label>
                  <Input
                    id="newCategory"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Frontend"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newCategoryTh" className="text-sm font-medium">{t("admin.skillsPage.categoryNameTh")}</Label>
                  <Input
                    id="newCategoryTh"
                    value={newCategoryTh}
                    onChange={(e) => setNewCategoryTh(e.target.value)}
                    placeholder="Frontend (ไม่จำเป็น)"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                    {t("admin.cancel")}
                  </Button>
                  <Button onClick={handleAddCategory}>{t("admin.skillsPage.addCategory")}</Button>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">{t("admin.skillsPage.existingCategories")}</h3>
                  {categoriesData.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">{t("admin.skillsPage.noCategories")}</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {categoriesData.map((cat) => (
                        <div
                          key={cat.category}
                          className="flex items-center justify-between gap-2 bg-secondary/50 hover:bg-secondary px-3 py-2.5 rounded-md transition-colors"
                        >
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-medium truncate">{cat.category}</span>
                            {cat.categoryTh && <span className="text-xs text-muted-foreground truncate">{cat.categoryTh}</span>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEditCategory(cat)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleDeleteCategory(cat.category)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setIconPreview("");
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleNewSkill} size="lg" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                {t("admin.skillsPage.addSkill")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">{editingSkill ? t("admin.skillsPage.editSkill") : t("admin.skillsPage.addNewSkill")}</DialogTitle>
                <DialogDescription className="text-sm">
                  {editingSkill ? t("admin.skillsPage.editSkillDesc") : t("admin.skillsPage.addNewSkillDesc")}
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
                  <Label htmlFor="name" className="text-sm font-medium">{t("admin.skillsPage.skillNameLabel")} *</Label>
                  <Input id="name" {...register("name")} placeholder="React" />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">{t("admin.skillsPage.categoryLabel")} *</Label>
                  <Select
                    onValueChange={(value) => setValue("category", value)}
                    defaultValue={editingSkill?.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("admin.skillsPage.selectCategory")} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="hidden" {...register("category")} />
                  {errors.category && (
                    <p className="text-xs text-red-500">{errors.category.message}</p>
                  )}
                </div>

                {activeTab === "th" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="nameTh" className="text-sm font-medium">{t("admin.skillsPage.skillNameTh")}</Label>
                      <Input id="nameTh" {...register("nameTh")} placeholder="React (ไม่จำเป็น)" />
                      {errors.nameTh && <p className="text-xs text-red-500">{errors.nameTh.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoryTh" className="text-sm font-medium">{t("admin.skillsPage.categoryTh")}</Label>
                      <Input id="categoryTh" {...register("categoryTh")} placeholder="Frontend (ไม่จำเป็น)" />
                      {errors.categoryTh && <p className="text-xs text-red-500">{errors.categoryTh.message}</p>}
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="iconUrl" className="text-sm font-medium">{t("admin.skillsPage.iconUrlLabel")}</Label>
                  <Input id="iconUrl" {...register("iconUrl")} placeholder="https://..." />
                  {errors.iconUrl && (
                    <p className="text-xs text-red-500">{errors.iconUrl.message}</p>
                  )}
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
                      <li><a href="https://devicon.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">Devicon</a> - Technology icons</li>
                      <li><a href="https://simpleicons.org/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">Simple Icons</a> - Brand/concept icons</li>
                      <li><a href="https://cdn.simpleicons.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">Simple Icons CDN</a> - https://cdn.simpleicons.org/[icon-slug]</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proficiency" className="text-sm font-medium">{t("admin.skillsPage.proficiencyLabel")}</Label>
                  <Input
                    id="proficiency"
                    type="number"
                    min="0"
                    max="100"
                    {...register("proficiency", { valueAsNumber: true })}
                  />
                  {errors.proficiency && (
                    <p className="text-xs text-red-500">{errors.proficiency.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isVisible"
                    checked={watch("isVisible")}
                    onCheckedChange={(checked) => setValue("isVisible", checked)}
                  />
                  <Label htmlFor="isVisible" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <Eye className="h-4 w-4" />
                    {t("admin.skillsPage.visible")}
                  </Label>
                </div>

                <div className="flex justify-end gap-2 sm:gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    {t("admin.skillsPage.cancelBtn")}
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? t("admin.skillsPage.saving") : editingSkill ? t("admin.skillsPage.update") : t("admin.skillsPage.create")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
                items={skills.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                      <TableHead className="whitespace-nowrap w-auto hidden sm:table-cell">{t("admin.skillsPage.tableCategory")}</TableHead>
                      <TableHead className="whitespace-nowrap w-auto">{t("admin.skillsPage.tableSkill")}</TableHead>
                      <TableHead className="whitespace-nowrap w-auto hidden sm:table-cell">{t("admin.skillsPage.tableIcon")}</TableHead>
                      <TableHead className="whitespace-nowrap w-auto">{t("admin.skillsPage.tableProficiency")}</TableHead>
                      <TableHead className="whitespace-nowrap w-16 hidden md:table-cell">{t("admin.skillsPage.tableVis")}</TableHead>
                      <TableHead className="whitespace-nowrap w-auto text-right">{t("admin.skillsPage.tableActions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skills.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {t("admin.skillsPage.noSkills")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      skills.map((skill) => (
                        <SortableSkill
                          key={skill.id}
                          skill={skill}
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
            <DialogTitle>{t("admin.skillsPage.confirmDeleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("admin.skillsPage.confirmDeleteDesc").replace("{name}", skillToDelete?.name || "")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSkillToDelete(null);
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

      <Dialog open={deleteCategoryDialogOpen} onOpenChange={setDeleteCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("admin.skillsPage.deleteCategoryTitle")}</DialogTitle>
            <DialogDescription>
              {t("admin.skillsPage.deleteCategoryDesc").replace("{category}", categoryToDelete || "")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteCategoryDialogOpen(false);
                setCategoryToDelete(null);
              }}
            >
              {t("admin.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCategory}>
              {t("admin.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editCategoryDialogOpen} onOpenChange={setEditCategoryDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{t("admin.skillsPage.editCategoryTitle")}</DialogTitle>
            <DialogDescription className="text-sm">{t("admin.skillsPage.editCategoryDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="editCategoryName" className="text-sm font-medium">{t("admin.skillsPage.categoryNameLabel")} *</Label>
              <Input
                id="editCategoryName"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                placeholder="Frontend"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editCategoryNameTh" className="text-sm font-medium">{t("admin.skillsPage.categoryNameTh")}</Label>
              <Input
                id="editCategoryNameTh"
                value={editCategoryNameTh}
                onChange={(e) => setEditCategoryNameTh(e.target.value)}
                placeholder="Frontend (ไม่จำเป็น)"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditCategoryDialogOpen(false)}>
                {t("admin.cancel")}
              </Button>
              <Button onClick={handleUpdateCategory}>{t("admin.save")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
