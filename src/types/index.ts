export interface About {
  id: number;
  name: string;
  title: string;
  titleTh?: string | null;
  bio: string;
  bioTh?: string | null;
  email: string;
  phone?: string | null;
  location?: string | null;
  locationTh?: string | null;
  avatarUrl?: string | null;
  resumeUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  status?: string | null;
  statusTh?: string | null;
  availability?: string | null;
  availabilityTh?: string | null;
  yearsOfExperience?: number | null;
  strengths?: string | null;
  strengthsTh?: string | null;
  goals?: string | null;
  goalsTh?: string | null;
  nowLearning?: string | null;
  nowLearningTh?: string | null;
  updatedAt: Date;
}

export interface Skill {
  id: number;
  name: string;
  nameTh?: string | null | undefined;
  category: string;
  categoryTh?: string | null | undefined;
  iconUrl?: string | null;
  proficiency: number;
  sortOrder: number;
  isVisible: boolean;
}

export interface Project {
  id: number;
  title: string;
  titleTh?: string | null;
  description: string;
  descriptionTh?: string | null;
  longDescription?: string;
  longDescriptionTh?: string | null;
  techStack: string[];
  stack?: string | null;
  githubUrl?: string | null;
  liveUrls?: string[];
  isFeatured: boolean;
  isVisible: boolean;
  sortOrder: number;
  createdAt: Date;
  images: Array<{
    id: number;
    url: string;
    sortOrder: number;
  }>;
  caseStudyProblem?: string | null;
  caseStudyProblemTh?: string | null;
  caseStudySolution?: string | null;
  caseStudySolutionTh?: string | null;
  caseStudyChallenges?: string | null;
  caseStudyChallengesTh?: string | null;
  caseStudyResults?: string | null;
  caseStudyResultsTh?: string | null;
  architectureDiagram?: string | null;
  architectureDiagramTh?: string | null;
  techStackUsed?: string | null;
  techStackUsedTh?: string | null;
  timeline?: string | null;
  timelineTh?: string | null;
  teamSize?: string | null;
  teamSizeTh?: string | null;
  keyLearnings?: string | null;
  keyLearningsTh?: string | null;
}

export interface Experience {
  id: number;
  company: string;
  position: string;
  positionTh?: string | null;
  description?: string;
  descriptionTh?: string | null;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  sortOrder: number;
}

export interface Education {
  id: number;
  degree: string;
  degreeTh?: string | null;
  institution: string;
  fieldOfStudy?: string;
  fieldOfStudyTh?: string | null;
  startDate: Date;
  endDate?: Date;
  gpa?: string;
  description?: string;
  descriptionTh?: string | null;
  sortOrder: number;
}

export interface BlogPost {
  id: number;
  title: string;
  titleTh?: string | null;
  slug: string;
  excerpt?: string;
  excerptTh?: string | null;
  content: string;
  contentTh?: string | null;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  readingTime?: number | null;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  images: Array<{
    id: number;
    url: string;
    sortOrder: number;
  }>;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface AdminUser {
  id: number;
  username: string;
  passwordHash: string;
  failedAttempts: number;
  lockedUntil?: Date | null;
  createdAt: Date;
}

export interface EngineeringHighlight {
  id: number;
  title: string;
  titleTh?: string | null;
  icon?: string | null;
  sortOrder: number;
  isVisible: boolean;
}

export interface ProjectImageWithLoading {
  id: number;
  url: string;
  sortOrder: number;
  isLoading?: boolean;
}

export interface BlogImageWithLoading {
  id: number;
  url: string;
  sortOrder: number;
  isLoading?: boolean;
}
