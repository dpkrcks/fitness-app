import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";

/** Uniform error shape returned for every unhandled/HTTP exception. */
interface ErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Catches everything and serializes it to `{ code, message, details }`.
 * Unknown (non-HTTP) errors are logged with a stack and reported as a generic
 * 500 so internal details never leak to clients.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body = this.toErrorBody(exception, status);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}: ${body.message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json(body);
  }

  private toErrorBody(exception: unknown, status: number): ErrorBody {
    if (!(exception instanceof HttpException)) {
      return { code: this.codeFor(status), message: "Internal server error" };
    }

    const res = exception.getResponse();
    if (typeof res === "string") {
      return { code: this.codeFor(status), message: res };
    }

    // Nest's built-in pipes/exceptions return an object; `message` may be an
    // array (e.g. validation errors) which we surface under `details`.
    const obj = res as Record<string, unknown>;
    const rawMessage = obj["message"];
    if (Array.isArray(rawMessage)) {
      return {
        code: this.codeFor(status),
        message: exception.message,
        details: rawMessage,
      };
    }
    return {
      code: this.codeFor(status),
      message: typeof rawMessage === "string" ? rawMessage : exception.message,
    };
  }

  /** Maps a status code to a stable string code, e.g. 404 -> "NOT_FOUND". */
  private codeFor(status: number): string {
    const name = HttpStatus[status];
    return typeof name === "string" ? name : `HTTP_${status}`;
  }
}
