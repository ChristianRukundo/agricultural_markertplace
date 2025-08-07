import { env } from "@/env.js";

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// Define specific types for metadata to replace 'any'
interface LogEntryMeta extends Record<string, unknown> {
  userId?: string;
  requestId?: string;
  // Add other common meta fields here as needed
}

interface RequestLogMeta {
  requestId: string;
  userAgent: string | null;
  ip: string;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  meta?: LogEntryMeta;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Structured logging service
 */
export class Logger {
  private logLevel: LogLevel;

  constructor() {
    this.logLevel =
      env.NODE_ENV === "production" ? LogLevel.INFO : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatLog(
    level: string,
    message: string,
    meta?: LogEntryMeta
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta && { meta }),
    };
  }

  private writeLog(logEntry: LogEntry) {
    if (env.NODE_ENV === "development") {
      const colorMap = {
        ERROR: "\x1b[31m", // Red
        WARN: "\x1b[33m", // Yellow
        INFO: "\x1b[36m", // Cyan
        DEBUG: "\x1b[37m", // White
      };

      const color =
        colorMap[logEntry.level as keyof typeof colorMap] || "\x1b[37m";
      const reset = "\x1b[0m";

      console.log(
        `${color}[${logEntry.timestamp}] ${logEntry.level}: ${logEntry.message}${reset}`,
        logEntry.meta ? logEntry.meta : ""
      );
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  error(message: string, error?: Error, meta?: LogEntryMeta) {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const logEntry = this.formatLog("ERROR", message, meta);

    if (error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    this.writeLog(logEntry);
  }

  warn(message: string, meta?: LogEntryMeta) {
    if (!this.shouldLog(LogLevel.WARN)) return;
    this.writeLog(this.formatLog("WARN", message, meta));
  }

  info(message: string, meta?: LogEntryMeta) {
    if (!this.shouldLog(LogLevel.INFO)) return;
    this.writeLog(this.formatLog("INFO", message, meta));
  }

  debug(message: string, meta?: LogEntryMeta) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    this.writeLog(this.formatLog("DEBUG", message, meta));
  }

  apiRequest(
    method: string,
    path: string,
    userId?: string,
    meta?: Record<string, unknown>
  ) {
    this.info(`API ${method} ${path}`, {
      type: "api_request",
      method,
      path,
      userId,
      ...meta,
    });
  }

  apiResponse(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: string
  ) {
    this.info(`API ${method} ${path} - ${statusCode} (${duration}ms)`, {
      type: "api_response",
      method,
      path,
      statusCode,
      duration,
      userId,
    });
  }

  databaseQuery(
    query: string,
    duration: number,
    meta?: Record<string, unknown>
  ) {
    this.debug(`Database query completed (${duration}ms)`, {
      type: "database_query",
      query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
      duration,
      ...meta,
    });
  }

  userAction(userId: string, action: string, meta?: Record<string, unknown>) {
    this.info(`User action: ${action}`, {
      type: "user_action",
      userId,
      action,
      ...meta,
    });
  }

  securityEvent(
    event: string,
    userId?: string,
    meta?: Record<string, unknown>
  ) {
    this.warn(`Security event: ${event}`, {
      type: "security_event",
      event,
      userId,
      ...meta,
    });
  }

  paymentEvent(
    event: string,
    orderId: string,
    amount?: number,
    meta?: Record<string, unknown>
  ) {
    this.info(`Payment event: ${event}`, {
      type: "payment_event",
      event,
      orderId,
      amount,
      ...meta,
    });
  }

  systemEvent(event: string, meta?: Record<string, unknown>) {
    this.info(`System event: ${event}`, {
      type: "system_event",
      event,
      ...meta,
    });
  }
}

export const logger = new Logger();

interface CustomRequest extends Request {
  requestId?: string;
  user?: { id: string }; // Assuming user can be attached by other middleware
  ip?: string;
  headers: Headers;
}

interface CustomResponse extends Response {
  statusCode: number; // In Node.js environment, res.statusCode is common
  end: (...args: unknown[]) => void;
}

// Express-style middleware for request logging
export function requestLogger() {
  return (req: CustomRequest, res: CustomResponse, next: () => void) => {
    const start = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    req.requestId = requestId;

    logger.apiRequest(
      req.method || "UNKNOWN",
      req.url || "UNKNOWN",
      req.user?.id,
      {
        requestId,
        userAgent: req.headers.get("user-agent"),
        ip: req.ip,
      }
    );

    const originalEnd = res.end;
    res.end = function (...args: unknown[]) {
      const duration = Date.now() - start;
      logger.apiResponse(
        req.method || "UNKNOWN",
        req.url || "UNKNOWN",
        res.statusCode,
        duration,
        req.user?.id
      );
      originalEnd.apply(this, args);
    };

    next();
  };
}
