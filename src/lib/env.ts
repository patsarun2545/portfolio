import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL").optional(),
  ALLOWED_ORIGINS: z.string().optional(),
  IMAGEKIT_PUBLIC_KEY: z.string().min(1, "IMAGEKIT_PUBLIC_KEY is required"),
  IMAGEKIT_PRIVATE_KEY: z.string().min(1, "IMAGEKIT_PRIVATE_KEY is required"),
  IMAGEKIT_URL_ENDPOINT: z.string().url("IMAGEKIT_URL_ENDPOINT must be a valid URL"),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
});

// Validate environment variables at build time
export const env = envSchema.parse(process.env);

// Always validate at runtime for security
try {
  envSchema.parse(process.env);
} catch (error) {
  console.error("❌ Invalid environment variables:");
  if (error instanceof z.ZodError) {
    error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    });
  }
  const shouldThrow =
    process.env.NODE_ENV === "production" || process.env.STRICT_ENV_VALIDATION === "true";
  if (shouldThrow) {
    throw new Error("Invalid environment variables");
  }
}
