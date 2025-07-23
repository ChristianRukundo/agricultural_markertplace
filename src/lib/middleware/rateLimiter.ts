import { type NextRequest, NextResponse } from "next/server"
import { TRPCError } from "@trpc/server"

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store for rate limiting (use Redis in production)
const store: RateLimitStore = {}

/**
 * Rate limiter middleware for API routes
 */
export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = {
      message: "Too many requests, please try again later.",
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    }
  }

  /**
   * Check if request should be rate limited
   */
  async isRateLimited(identifier: string): Promise<{ limited: boolean; resetTime?: number }> {
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Clean up expired entries
    this.cleanup(windowStart)

    const record = store[identifier]

    if (!record) {
      // First request from this identifier
      store[identifier] = {
        count: 1,
        resetTime: now + this.config.windowMs,
      }
      return { limited: false }
    }

    if (now > record.resetTime) {
      // Window has expired, reset
      store[identifier] = {
        count: 1,
        resetTime: now + this.config.windowMs,
      }
      return { limited: false }
    }

    if (record.count >= this.config.maxRequests) {
      // Rate limit exceeded
      return {
        limited: true,
        resetTime: record.resetTime,
      }
    }

    // Increment counter
    record.count++
    return { limited: false }
  }

  /**
   * Clean up expired entries from store
   */
  private cleanup(windowStart: number) {
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < windowStart) {
        delete store[key]
      }
    })
  }

  /**
   * Get identifier for rate limiting (IP address, user ID, etc.)
   */
  getIdentifier(req: NextRequest, userId?: string): string {
    if (userId) {
      return `user:${userId}`
    }

    // Use IP address as fallback
    const forwarded = req.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : req.ip || "unknown"
    return `ip:${ip}`
  }

  /**
   * Express-style middleware for Next.js API routes
   */
  middleware() {
    return async (req: NextRequest) => {
      const identifier = this.getIdentifier(req)
      const { limited, resetTime } = await this.isRateLimited(identifier)

      if (limited) {
        return NextResponse.json(
          {
            error: this.config.message,
            retryAfter: resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : undefined,
          },
          {
            status: 429,
            headers: {
              "Retry-After": resetTime ? Math.ceil((resetTime - Date.now()) / 1000).toString() : "60",
              "X-RateLimit-Limit": this.config.maxRequests.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": resetTime ? Math.ceil(resetTime / 1000).toString() : "",
            },
          },
        )
      }

      return null // Continue to next middleware/handler
    }
  }

  /**
   * tRPC middleware for rate limiting
   */
  tRPCMiddleware() {
    return async (opts: { ctx: any; next: any; input?: any }) => {
      const { ctx, next } = opts

      // Get user ID from session if available
      const userId = ctx.session?.user?.id

      // Create a mock request object for identifier extraction
      const identifier = userId ? `user:${userId}` : `ip:unknown`

      const { limited, resetTime } = await this.isRateLimited(identifier)

      if (limited) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: this.config.message,
        })
      }

      return next()
    }
  }
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // General API rate limiting
  general: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
  }),

  // Authentication endpoints (more restrictive)
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 requests per 15 minutes
    message: "Too many authentication attempts, please try again later.",
  }),

  // Password reset (very restrictive)
  passwordReset: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 requests per hour
    message: "Too many password reset attempts, please try again later.",
  }),

  // File upload
  upload: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 uploads per minute
    message: "Too many upload attempts, please try again later.",
  }),

  // SMS/Email sending
  messaging: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 messages per hour
    message: "Too many messages sent, please try again later.",
  }),
}
