import { type NextRequest, NextResponse } from "next/server";
import { TRPCError } from "@trpc/server";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Rate limiter middleware for API routes and tRPC procedures.
 * Uses an in-memory store. For production, consider a distributed store like Redis.
 */
export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      message: "Too many requests, please try again later.",
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    };
  }

  /**
   * Check if a request from a given identifier should be rate limited.
   * @param identifier A unique string identifying the client (e.g., IP address, user ID).
   * @returns An object indicating if the request is limited and the reset time if it is.
   */
  async isRateLimited(
    identifier: string
  ): Promise<{ limited: boolean; resetTime?: number }> {
    const now = Date.now();

    this.cleanup();

    const record = store[identifier];

    if (!record) {
      store[identifier] = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      return { limited: false };
    }

    if (now > record.resetTime) {
      store[identifier] = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      return { limited: false };
    }

    if (record.count >= this.config.maxRequests) {
      return {
        limited: true,
        resetTime: record.resetTime,
      };
    }

    record.count++;
    return { limited: false };
  }

  /**
   * Clean up expired entries from the in-memory store.
   * This iterates through all stored keys and removes those whose `resetTime`
   * is in the past.
   */
  private cleanup() {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      const record = store[key];
      if (record && record.resetTime < now) {
        delete store[key];
      }
    });
  }

  /**
   * Get a unique identifier for rate limiting.
   * Prioritizes user ID if available, otherwise falls back to IP address.
   * @param req The NextRequest object.
   * @param userId Optional user ID from the session.
   * @returns A string identifier.
   */
  getIdentifier(req: NextRequest, userId?: string): string {
    if (userId) {
      return `user:${userId}`;
    }

    const forwarded = req.headers.get("x-forwarded-for");

    const ip = forwarded ? forwarded.split(",")[0] : "unknown";
    return `ip:${ip}`;
  }

  /**
   * Express-style middleware for Next.js API routes.
   * This is designed to be used directly in a Next.js Route Handler.
   * @returns A function that takes NextRequest and returns NextResponse or null.
   */
  middleware() {
    return async (req: NextRequest) => {
      const identifier = this.getIdentifier(req);
      const { limited, resetTime } = await this.isRateLimited(identifier);

      if (limited) {
        const retryAfterSeconds = resetTime
          ? Math.ceil((resetTime - Date.now()) / 1000)
          : 60;

        return NextResponse.json(
          {
            error: this.config.message,
            retryAfter: retryAfterSeconds,
          },
          {
            status: 429,
            headers: {
              "Retry-After": retryAfterSeconds.toString(),
              "X-RateLimit-Limit": this.config.maxRequests.toString(),
              "X-RateLimit-Remaining": "0",

              "X-RateLimit-Reset": resetTime
                ? Math.ceil(resetTime / 1000).toString()
                : "",
            },
          }
        );
      }

      return null;
    };
  }

  /**
   * tRPC middleware for rate limiting.
   * This is designed to be used within a tRPC router.
   * @returns A tRPC middleware function.
   */
  tRPCMiddleware() {
    return async (opts: { ctx: any; next: any; input?: any }) => {
      const { ctx, next } = opts;

      const userId = ctx.session?.user?.id;

      const identifier = userId ? `user:${userId}` : `ip:unknown`;

      const { limited, resetTime } = await this.isRateLimited(identifier);

      if (limited) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: this.config.message,
        });
      }

      return next();
    };
  }
}

export const rateLimiters = {
  general: new RateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  }),

  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
    message: "Too many authentication attempts, please try again later.",
  }),

  passwordReset: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
    message: "Too many password reset attempts, please try again later.",
  }),

  upload: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: "Too many upload attempts, please try again later.",
  }),

  messaging: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
    message: "Too many messages sent, please try again later.",
  }),
};
