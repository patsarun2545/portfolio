/* eslint-disable react-hooks/set-state-in-effect */
// Note: setState is called in async callbacks, not synchronously in effect body
"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { aboutSchema } from "@/lib/validations";
import { z } from "zod";
import { getCSRFToken } from "@/lib/csrf-client";
import { useLocale } from "@/hooks/useLocale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, Mail, Info, Share2 } from "lucide-react";

export default function AboutPage() {
  const { t } = useLocale();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"en" | "th">("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof aboutSchema>>({
    resolver: zodResolver(aboutSchema),
  });

  const fetchAbout = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/about");
      const data = await response.json();
      if (data) {
        Object.keys(data).forEach((key) => {
          setValue(key as keyof z.infer<typeof aboutSchema>, data[key]);
        });
        if (data.avatarUrl) {
          setAvatarPreview(data.avatarUrl);
        }
      }
    } catch {
      toast.error(t("admin.aboutPage.failedToLoad"));
    } finally {
      setIsLoading(false);
    }
  }, [setValue, t]);

  useEffect(() => {
    fetchAbout();
  }, [fetchAbout]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "Portfolio/about");

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.url) {
        setValue("avatarUrl", result.url);
        setAvatarPreview(result.url);
        toast.success(t("admin.aboutPage.avatarUploaded"));

        // Auto-save after upload
        try {
          const currentData = await fetch("/api/admin/about").then(res => res.json());
          const submitData = {
            ...currentData,
            avatarUrl: result.url,
            name: currentData?.name || "",
            title: currentData?.title || "",
            bio: currentData?.bio || "",
            email: currentData?.email || "",
          };
          const saveResponse = await fetch("/api/admin/about", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "x-csrf-token": getCSRFToken(),
            },
            body: JSON.stringify(submitData),
          });

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            console.error("Save error:", errorData);
            toast.error(`Failed to save avatar: ${errorData.error || "Unknown error"}`);
          }
        } catch (saveError) {
          console.error("Auto-save error:", saveError);
          toast.error(t("admin.aboutPage.failedToSaveAvatar"));
        }
      }
    } catch {
      toast.error(t("admin.aboutPage.failedToUploadAvatar"));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof aboutSchema>) => {
    setIsSaving(true);
    try {
      // Ensure optional URL fields are empty strings instead of undefined or null
      const submitData = {
        ...data,
        avatarUrl: data.avatarUrl ?? "",
        resumeUrl: data.resumeUrl ?? "",
        githubUrl: data.githubUrl ?? "",
        linkedinUrl: data.linkedinUrl ?? "",
        phone: data.phone ?? "",
        location: data.location ?? "",
        locationTh: data.locationTh ?? "",
      };

      const response = await fetch("/api/admin/about", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": getCSRFToken(),
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success(t("admin.aboutPage.aboutSaved"));
      } else {
        const errorData = await response.json();
        toast.error(errorData.details || t("admin.aboutPage.failedToSaveAbout"));
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(t("admin.aboutPage.failedToSaveAbout"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted-foreground/30 border-t-primary" />
          <p className="text-sm text-muted-foreground">{mounted ? t("admin.aboutPage.loading") : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("admin.aboutPage.title")}</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">{t("admin.aboutPage.subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Upload */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="p-1.5 rounded-md bg-blue-500">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              {t("admin.aboutPage.profilePicture")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="relative">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 shrink-0">
                  <AvatarImage src={avatarPreview} alt="Avatar preview" />
                  <AvatarFallback className="bg-muted">
                    <User className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3 w-full">
                <Label htmlFor="avatar" className="text-sm font-medium">{t("admin.aboutPage.uploadAvatar")}</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">{t("admin.aboutPage.avatarRecommendation")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="p-1.5 rounded-md bg-indigo-500">
                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              {t("admin.aboutPage.basicInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-5">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">{t("admin.aboutPage.nameLabel")} *</Label>
                <Input id="name" {...register("name")} placeholder="John Doe" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">{t("admin.aboutPage.titleLabel")} *</Label>
                <Input id="title" {...register("title")} placeholder="Full Stack Developer" />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium">{t("admin.aboutPage.bioLabel")} *</Label>
              <Textarea
                id="bio"
                {...register("bio")}
                placeholder="Tell us about yourself..."
                rows={4}
                className="resize-none"
              />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience" className="text-sm font-medium">{t("admin.aboutPage.yearsOfExperience")}</Label>
                <Input id="yearsOfExperience" type="number" {...register("yearsOfExperience", { valueAsNumber: true })} placeholder="0" />
                {errors.yearsOfExperience && <p className="text-xs text-destructive">{errors.yearsOfExperience.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability" className="text-sm font-medium">{t("admin.aboutPage.availability")}</Label>
                <Input id="availability" {...register("availability")} placeholder="Open to opportunities" />
                {errors.availability && <p className="text-xs text-destructive">{errors.availability.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">{t("admin.aboutPage.statusLabel")}</Label>
              <Textarea
                id="status"
                {...register("status")}
                placeholder="📍 Bangkok, Thailand | 🎓 Bachelor of Business Administration, Major in Business Computer"
                rows={2}
                className="resize-none"
              />
              {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="strengths" className="text-sm font-medium">{t("admin.aboutPage.strengthsLabel")}</Label>
              <Textarea
                id="strengths"
                {...register("strengths")}
                placeholder="Problem-solving, System design, Full-stack development"
                rows={2}
                className="resize-none"
              />
              {errors.strengths && <p className="text-xs text-destructive">{errors.strengths.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals" className="text-sm font-medium">{t("admin.aboutPage.goalsLabel")}</Label>
              <Textarea
                id="goals"
                {...register("goals")}
                placeholder="Build scalable systems, Contribute to open source, Mentor junior developers"
                rows={2}
                className="resize-none"
              />
              {errors.goals && <p className="text-xs text-destructive">{errors.goals.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nowLearning" className="text-sm font-medium">{t("admin.aboutPage.nowLearningLabel")}</Label>
              <Textarea
                id="nowLearning"
                {...register("nowLearning")}
                placeholder="Advanced TypeScript, System architecture patterns, Cloud infrastructure"
                rows={2}
                className="resize-none"
              />
              {errors.nowLearning && <p className="text-xs text-destructive">{errors.nowLearning.message}</p>}
            </div>

            {activeTab === "th" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="titleTh" className="text-sm font-medium">{t("admin.aboutPage.titleTh")}</Label>
                  <Input id="titleTh" {...register("titleTh")} placeholder="นักพัฒนาซอฟต์แวร์แบบเต็มรูปแบบ (ไม่จำเป็น)" />
                  {errors.titleTh && <p className="text-xs text-destructive">{errors.titleTh.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bioTh" className="text-sm font-medium">{t("admin.aboutPage.bioTh")}</Label>
                  <Textarea
                    id="bioTh"
                    {...register("bioTh")}
                    placeholder="แนะนำตัวเอง... (ไม่จำเป็น)"
                    rows={4}
                    className="resize-none"
                  />
                  {errors.bioTh && <p className="text-xs text-destructive">{errors.bioTh.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availabilityTh" className="text-sm font-medium">{t("admin.aboutPage.availabilityTh")}</Label>
                  <Input id="availabilityTh" {...register("availabilityTh")} placeholder="เปิดรับโอกาส (ไม่จำเป็น)" />
                  {errors.availabilityTh && <p className="text-xs text-destructive">{errors.availabilityTh.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="statusTh" className="text-sm font-medium">{t("admin.aboutPage.statusTh")}</Label>
                  <Textarea
                    id="statusTh"
                    {...register("statusTh")}
                    placeholder="📍 กรุงเทพฯ ประเทศไทย | 🎓 ปริญญาบริหารธุรกิจบัณฑิต สาขาคอมพิวเตอร์ธุรกิจ (ไม่จำเป็น)"
                    rows={2}
                    className="resize-none"
                  />
                  {errors.statusTh && <p className="text-xs text-destructive">{errors.statusTh.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strengthsTh" className="text-sm font-medium">{t("admin.aboutPage.strengthsTh")}</Label>
                  <Textarea
                    id="strengthsTh"
                    {...register("strengthsTh")}
                    placeholder="การแก้ปัญหา, การออกแบบระบบ, การพัฒนาซอฟต์แวร์แบบเต็มรูปแบบ (ไม่จำเป็น)"
                    rows={2}
                    className="resize-none"
                  />
                  {errors.strengthsTh && <p className="text-xs text-destructive">{errors.strengthsTh.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goalsTh" className="text-sm font-medium">{t("admin.aboutPage.goalsTh")}</Label>
                  <Textarea
                    id="goalsTh"
                    {...register("goalsTh")}
                    placeholder="สร้างระบบที่ขยายได้, มีส่วนร่วมในโอเพนซอร์ซ, เป็นเมนเตอร์นักพัฒนา (ไม่จำเป็น)"
                    rows={2}
                    className="resize-none"
                  />
                  {errors.goalsTh && <p className="text-xs text-destructive">{errors.goalsTh.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nowLearningTh" className="text-sm font-medium">{t("admin.aboutPage.nowLearningTh")}</Label>
                  <Textarea
                    id="nowLearningTh"
                    {...register("nowLearningTh")}
                    placeholder="TypeScript ขั้นสูง, รูปแบบสถาปัตยกรรมระบบ, โครงสร้างคลาวด์ (ไม่จำเป็น)"
                    rows={2}
                    className="resize-none"
                  />
                  {errors.nowLearningTh && <p className="text-xs text-destructive">{errors.nowLearningTh.message}</p>}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="p-1.5 rounded-md bg-green-500">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              {t("admin.aboutPage.contactInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">{t("admin.aboutPage.emailLabel")} *</Label>
              <Input id="email" type="email" {...register("email")} placeholder="john@example.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  {t("admin.aboutPage.phoneLabel")}
                </Label>
                <Input id="phone" {...register("phone")} placeholder="+1 234 567 890" />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  {t("admin.aboutPage.locationLabel")}
                </Label>
                <Input id="location" {...register("location")} placeholder="San Francisco, CA" />
                {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
              </div>
            </div>

            {activeTab === "th" && (
              <div className="space-y-2">
                <Label htmlFor="locationTh" className="text-sm font-medium">
                  {t("admin.aboutPage.locationTh")}
                </Label>
                <Input id="locationTh" {...register("locationTh")} placeholder="ห้วยขวาง, กรุงเทพฯ (ไม่จำเป็น)" />
                {errors.locationTh && <p className="text-xs text-destructive">{errors.locationTh.message}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="p-1.5 rounded-md bg-pink-500">
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              {t("admin.aboutPage.socialLinks")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="githubUrl" className="text-sm font-medium">{t("admin.aboutPage.githubUrlLabel")}</Label>
              <Input id="githubUrl" {...register("githubUrl")} placeholder="https://github.com/username" />
              {errors.githubUrl && <p className="text-xs text-destructive">{errors.githubUrl.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl" className="text-sm font-medium">{t("admin.aboutPage.linkedinUrlLabel")}</Label>
              <Input id="linkedinUrl" {...register("linkedinUrl")} placeholder="https://linkedin.com/in/username" />
              {errors.linkedinUrl && <p className="text-xs text-destructive">{errors.linkedinUrl.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="resumeUrl" className="text-sm font-medium">
                {t("admin.aboutPage.resumeUrlLabel")}
              </Label>
              <Input id="resumeUrl" {...register("resumeUrl")} placeholder="https://drive.google.com/..." />
              {errors.resumeUrl && <p className="text-xs text-destructive">{errors.resumeUrl.message}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSaving} size="lg" className="w-full sm:w-auto">
            {isSaving ? t("admin.aboutPage.saving") : t("admin.aboutPage.saveChanges")}
          </Button>
        </div>
      </form>
    </div>
  );
}
