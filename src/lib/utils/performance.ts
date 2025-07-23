import { logger } from "@/lib/logger"

interface PerformanceMetrics {
  duration: number
  memoryUsage: {
    before: NodeJS.MemoryUsage
    after: NodeJS.MemoryUsage
    delta: {
      heapUsed: number
      heapTotal: number
      external: number
    }
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static measurements = new Map<string, number>()

  /**
   * Start measuring performance for a given operation
   */
  static start(operationId: string): void {
    this.measurements.set(operationId, performance.now())
  }

  /**
   * End measurement and return metrics
   */
  static end(operationId: string): PerformanceMetrics | null {
    const startTime = this.measurements.get(operationId)
    if (!startTime) {
      logger.warn("Performance measurement not found", { operationId })
      return null
    }

    const endTime = performance.now()
    const duration = endTime - startTime

    this.measurements.delete(operationId)

    const memoryAfter = process.memoryUsage()

    return {
      duration,
      memoryUsage: {
        before: { heapUsed: 0, heapTotal: 0, external: 0, rss: 0, arrayBuffers: 0 },
        after: memoryAfter,
        delta: {
          heapUsed: 0,
          heapTotal: 0,
          external: 0,
        },
      },
    }
  }

  /**
   * Measure async function execution
   */
  static async measure<T>(
    operationName: string,
    fn: () => Promise<T>,
    logResult = true,
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const operationId = `${operationName}-${Date.now()}-${Math.random().toString(36).substring(7)}`
    const memoryBefore = process.memoryUsage()

    this.start(operationId)

    try {
      const result = await fn()
      const baseMetrics = this.end(operationId)

      if (!baseMetrics) {
        throw new Error("Failed to get performance metrics")
      }

      const metrics: PerformanceMetrics = {
        ...baseMetrics,
        memoryUsage: {
          before: memoryBefore,
          after: baseMetrics.memoryUsage.after,
          delta: {
            heapUsed: baseMetrics.memoryUsage.after.heapUsed - memoryBefore.heapUsed,
            heapTotal: baseMetrics.memoryUsage.after.heapTotal - memoryBefore.heapTotal,
            external: baseMetrics.memoryUsage.after.external - memoryBefore.external,
          },
        },
      }

      if (logResult) {
        logger.info(`Performance: ${operationName}`, {
          duration: `${metrics.duration.toFixed(2)}ms`,
          memoryDelta: `${(metrics.memoryUsage.delta.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        })
      }

      return { result, metrics }
    } catch (error) {
      this.end(operationId)
      throw error
    }
  }

  /**
   * Measure sync function execution
   */
  static measureSync<T>(
    operationName: string,
    fn: () => T,
    logResult = true,
  ): { result: T; metrics: PerformanceMetrics } {
    const operationId = `${operationName}-${Date.now()}-${Math.random().toString(36).substring(7)}`
    const memoryBefore = process.memoryUsage()

    this.start(operationId)

    try {
      const result = fn()
      const baseMetrics = this.end(operationId)

      if (!baseMetrics) {
        throw new Error("Failed to get performance metrics")
      }

      const metrics: PerformanceMetrics = {
        ...baseMetrics,
        memoryUsage: {
          before: memoryBefore,
          after: baseMetrics.memoryUsage.after,
          delta: {
            heapUsed: baseMetrics.memoryUsage.after.heapUsed - memoryBefore.heapUsed,
            heapTotal: baseMetrics.memoryUsage.after.heapTotal - memoryBefore.heapTotal,
            external: baseMetrics.memoryUsage.after.external - memoryBefore.external,
          },
        },
      }

      if (logResult) {
        logger.info(`Performance: ${operationName}`, {
          duration: `${metrics.duration.toFixed(2)}ms`,
          memoryDelta: `${(metrics.memoryUsage.delta.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        })
      }

      return { result, metrics }
    } catch (error) {
      this.end(operationId)
      throw error
    }
  }

  /**
   * Create a performance monitoring decorator
   */
  static createDecorator(operationName?: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value
      const name = operationName || `${target.constructor.name}.${propertyKey}`

      descriptor.value = async function (...args: any[]) {
        const { result } = await PerformanceMonitor.measure(name, () => originalMethod.apply(this, args))
        return result
      }

      return descriptor
    }
  }

  /**
   * Get system performance metrics
   */
  static getSystemMetrics() {
    const memoryUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()

    return {
      memory: {
        heapUsed: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotal: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
        external: Math.round((memoryUsage.external / 1024 / 1024) * 100) / 100,
        rss: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      uptime: process.uptime(),
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    }
  }

  /**
   * Monitor database query performance
   */
  static async monitorDatabaseQuery<T>(queryName: string, query: () => Promise<T>): Promise<T> {
    const { result, metrics } = await this.measure(`db:${queryName}`, query, false)

    // Log slow queries (> 1000ms)
    if (metrics.duration > 1000) {
      logger.warn("Slow database query detected", {
        query: queryName,
        duration: `${metrics.duration.toFixed(2)}ms`,
      })
    }

    // Log query performance for debugging
    logger.debug("Database query performance", {
      query: queryName,
      duration: `${metrics.duration.toFixed(2)}ms`,
      memoryDelta: `${(metrics.memoryUsage.delta.heapUsed / 1024 / 1024).toFixed(2)}MB`,
    })

    return result
  }
}

// Export decorator for easy use
export const measurePerformance = PerformanceMonitor.createDecorator
