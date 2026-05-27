import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const aboutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  bio: z.string().min(1, "Bio is required"),
  titleTh: z.string().optional(),
  bioTh: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  locationTh: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  resumeUrl: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
});

export const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  category: z.string().min(1, "Category is required"),
  nameTh: z.string().nullable().optional(),
  categoryTh: z.string().nullable().optional(),
  iconUrl: z.union([z.string().url(), z.null(), z.undefined()]).optional(),
  proficiency: z.number().min(0).max(100),
  sortOrder: z.number(),
  isVisible: z.boolean(),
});

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  longDescription: z.string().optional(),
  titleTh: z.string().optional(),
  descriptionTh: z.string().optional(),
  longDescriptionTh: z.string().optional(),
  techStack: z.array(z.string()),
  stack: z.string().max(100).optional(),
  githubUrl: z.union([z.string().url(), z.null(), z.undefined()]).optional(),
  liveUrls: z.array(z.string().url()).default([]),
  isFeatured: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export const experienceSchema = z
  .object({
    company: z.string().min(1, "Company is required"),
    position: z.string().min(1, "Position is required"),
    description: z.string().optional(),
    positionTh: z.string().optional(),
    descriptionTh: z.string().optional(),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()).optional(),
    isCurrent: z.boolean().default(false),
    sortOrder: z.number().default(0),
  })
  .refine((data) => !(data.isCurrent && data.endDate), {
    message: "End date must be empty when currently working here",
    path: ["endDate"],
  });

export const educationSchema = z.object({
  degree: z.string().min(1, "Degree is required"),
  institution: z.string().min(1, "Institution is required"),
  fieldOfStudy: z.string().optional(),
  degreeTh: z.string().optional(),
  fieldOfStudyTh: z.string().optional(),
  description: z.string().optional(),
  descriptionTh: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  gpa: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val))
    .refine((val) => !val || !isNaN(parseFloat(val)), {
      message: "GPA must be a valid number",
    }),
  sortOrder: z.number().default(0),
});

export const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  titleTh: z.string().optional(),
  excerptTh: z.string().optional(),
  contentTh: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().or(z.date()).optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const messageUpdateSchema = z.object({
  id: z.number(),
  isRead: z.boolean(),
});

export const adminUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
