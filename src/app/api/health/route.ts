import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { logger } from "@/lib/logger"

/**
 * Health check endpoint for monitoring and load balancers
 */
export async function GET() {
  const startTime = Date.now()

  try {
    // Check database connectivity
    await db.$queryRaw`SELECT 1`

    const responseTime = Date.now() - startTime

    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "unknown",
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      responseTime,
      checks: {
        database: "healthy",
        memory: {
          used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
          total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        },
      },
    }

    logger.debug("Health check completed", { responseTime })

    return NextResponse.json(healthData, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    const responseTime = Date.now() - startTime

    logger.error("Health check failed", error as Error, { responseTime })

    const healthData = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "unknown",
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      responseTime,
      checks: {
        database: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    }

    return NextResponse.json(healthData, {
      status: 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  }
}
