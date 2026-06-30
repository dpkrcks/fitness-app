import { BadRequestException, type PipeTransform } from "@nestjs/common";
import type { ZodType } from "zod";

/**
 * Validates a request payload against a zod schema (from @fit/shared-types).
 * On failure throws a 400 whose `details` lists each offending field — the
 * exception filter serializes it as `{ code, message, details }`.
 *
 * Instantiate per use: `@Body(new ZodValidationPipe(loginSchema))`.
 */
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: "Validation failed",
        details: result.error.issues.map((issue) => ({
          path: issue.path.join(".") || "(root)",
          message: issue.message,
        })),
      });
    }
    return result.data;
  }
}
