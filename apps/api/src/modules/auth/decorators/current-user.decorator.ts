import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { AuthUser } from "../auth.types";

/**
 * Injects the authenticated user (set by JwtStrategy) into a handler param.
 * Only meaningful on routes guarded by JwtAuthGuard.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<Request & { user: AuthUser }>();
    return request.user;
  },
);
