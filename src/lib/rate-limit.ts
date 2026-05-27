// Fallback in-memory rate limiter for development without Upstash
// WARNING: In-memory rate limiting is not suitable for production serverless deployments.
// Multiple instances won't share state, allowing rate limit bypass.
// Ensure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set in production.
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up old rate limit records periodically
let cleanupInterval: NodeJS.Timeout | null = null;

if (typeof window === "undefined" && !cleanupInterval) {
  cleanupInterval = setInterval(() => {
    try {
      const now = Date.now();
      for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
          rateLimitStore.delete(key);
        }
      }
    } catch (error) {
      console.error("Failed to clean up old rate limit records:", error);
    }
  }, 300000); // Clean up every 5 minutes
}

// Lazy initialization of Upstash Redis
let ratelimit: { limit: (identifier: string) => Promise<{ success: boolean }> } | null = null;
let uploadRatelimit: { limit: (identifier: string) => Promise<{ success: boolean }> } | null = null;
let upstashInitialized = false;

async function initializeUpstash() {
  if (upstashInitialized) return ratelimit;

  try {
    // Dynamic import to avoid build errors if packages are not installed
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const upstashModule = await import("@upstash/ratelimit");
      const redisModule = await import("@upstash/redis");

      const redis = new redisModule.Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      ratelimit = new upstashModule.Ratelimit({
        redis,
        limiter: upstashModule.Ratelimit.slidingWindow(60, "60 s"),
        analytics: true,
      });

      uploadRatelimit = new upstashModule.Ratelimit({
        redis,
        limiter: upstashModule.Ratelimit.slidingWindow(30, "60 s"),
        analytics: true,
      });

      console.log("Upstash Redis initialized successfully");
    } else if (process.env.NODE_ENV === "production") {
      throw new Error(
        "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required in production"
      );
    }
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      console.error("Upstash Redis initialization failed in production:", error);
      throw error;
    }
    console.warn(
      "Upstash Redis not available, using in-memory rate limiting (not recommended for production):",
      error
    );
  }

  upstashInitialized = true;
  return ratelimit;
}

export async function checkRateLimit(identifier: string): Promise<{ success: boolean }> {
  try {
    const limiter = await initializeUpstash();

    if (limiter) {
      const { success } = await limiter.limit(identifier);
      return { success };
    }

    // Block requests in production if Upstash Redis is unavailable
    if (process.env.NODE_ENV === "production") {
      console.error("Rate limiter not available in production");
      return { success: false };
    }

    // Fallback to in-memory rate limiting (development only)
    const now = Date.now();
    const resetTime = now + 60000; // 1 minute window
    const limit = 60; // 60 requests per minute

    const record = rateLimitStore.get(identifier);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(identifier, { count: 1, resetTime });
      return { success: true };
    }

    if (record.count >= limit) {
      return { success: false };
    }

    record.count++;
    return { success: true };
  } catch (error) {
    // Fail-closed: block requests if rate limiter fails for security
    console.error("Rate limit check failed:", error);
    return { success: false };
  }
}

export async function checkUploadRateLimit(identifier: string): Promise<{ success: boolean }> {
  try {
    await initializeUpstash();

    if (uploadRatelimit) {
      const { success } = await uploadRatelimit.limit(identifier);
      return { success };
    }

    // Block requests in production if Upstash Redis is unavailable
    if (process.env.NODE_ENV === "production") {
      console.error("Upload rate limiter not available in production");
      return { success: false };
    }

    // Fallback to in-memory rate limiting with higher limit for uploads (development only)
    const now = Date.now();
    const resetTime = now + 60000; // 1 minute window
    const limit = 30; // 30 uploads per minute

    const record = rateLimitStore.get(identifier);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(identifier, { count: 1, resetTime });
      return { success: true };
    }

    if (record.count >= limit) {
      return { success: false };
    }

    record.count++;
    return { success: true };
  } catch (error) {
    // Fail-closed: block requests if rate limiter fails for security
    console.error("Upload rate limit check failed:", error);
    return { success: false };
  }
}
