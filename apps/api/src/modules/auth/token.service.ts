import { createHash, randomBytes } from "node:crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { AuthTokens } from "@fit/shared-types";
import type { Env } from "../../config/env.schema";
import { PrismaService } from "../prisma/prisma.service";
import { durationToMs } from "./duration";
import type { AccessTokenPayload } from "./auth.types";

/** Minimal identity needed to sign tokens (avoids leaking the full user row). */
interface TokenSubject {
  id: string;
  email: string;
}

/**
 * Issues access JWTs and manages rotating, DB-backed refresh tokens.
 *
 * Refresh tokens are opaque 256-bit random strings; only their SHA-256 hash is
 * stored (deterministic → indexable for O(1) lookup). Each refresh rotates the
 * token; presenting an already-revoked token is treated as theft and revokes
 * every token for that user.
 */
@Injectable()
export class TokenService {
  private readonly refreshTtlMs: number;

  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    config: ConfigService<Env, true>,
  ) {
    this.refreshTtlMs = durationToMs(config.get("JWT_REFRESH_TTL", { infer: true }));
  }

  /** Sign a fresh access JWT + mint a new refresh token for a user. */
  async issueTokens(subject: TokenSubject): Promise<AuthTokens> {
    const payload: AccessTokenPayload = { sub: subject.id, email: subject.email };
    const accessToken = await this.jwt.signAsync(payload);
    const refreshToken = await this.mintRefreshToken(subject.id);
    return { accessToken, refreshToken };
  }

  /**
   * Validate + rotate a refresh token. Returns new tokens on success.
   * Throws (and triggers revoke-all on reuse) otherwise.
   */
  async rotate(rawToken: string): Promise<AuthTokens> {
    const tokenHash = this.hash(rawToken);
    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!existing) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Reuse of an already-revoked token → assume theft; revoke the whole family.
    if (existing.revokedAt) {
      await this.revokeAllForUser(existing.userId);
      throw new UnauthorizedException("Refresh token reuse detected");
    }

    if (existing.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException("Refresh token expired");
    }
    if (existing.user.deletedAt || !existing.user.email) {
      throw new UnauthorizedException("Account is not active");
    }

    // Rotate: revoke the presented token, then issue a fresh pair.
    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });
    return this.issueTokens(existing.user);
  }

  /** Revoke a single refresh token (logout). Idempotent + forgiving. */
  async revoke(rawToken: string): Promise<void> {
    const tokenHash = this.hash(rawToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async mintRefreshToken(userId: string): Promise<string> {
    const rawToken = randomBytes(32).toString("base64url"); // 256-bit opaque
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hash(rawToken),
        expiresAt: new Date(Date.now() + this.refreshTtlMs),
      },
    });
    return rawToken;
  }

  private async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private hash(rawToken: string): string {
    return createHash("sha256").update(rawToken).digest("hex");
  }
}
