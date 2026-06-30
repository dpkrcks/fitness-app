import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { OtpPurpose } from "@fit/shared-types";
import type { Env } from "../../config/env.schema";
import { PrismaService } from "../prisma/prisma.service";
import {
  OTP_DELIVERY,
  type OtpDelivery,
} from "../notifications/otp-delivery.interface";
import { durationToMs } from "./duration";

/** One generic, non-enumerating failure for every bad-verify path. */
const INVALID_CODE = "Invalid or expired code";

interface IssueParams {
  /** Owning user, when the account already exists (null for pre-account codes). */
  userId?: string;
  identifier: string;
  purpose: OtpPurpose;
}

/**
 * Email OTP: generate / hash / persist / verify a 6-digit code. A 6-digit code
 * is only 10^6 combinations, so security rests on strict rate-limiting — short
 * expiry, capped attempts, and a resend cooldown — not on the code's entropy.
 * Only the SHA-256 hash of the code is stored. (plan/15 §B)
 */
@Injectable()
export class OtpService {
  private readonly ttlMs: number;
  private readonly maxAttempts: number;
  private readonly cooldownSec: number;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(OTP_DELIVERY) private readonly delivery: OtpDelivery,
    config: ConfigService<Env, true>,
  ) {
    this.ttlMs = durationToMs(config.get("OTP_TTL", { infer: true }));
    this.maxAttempts = config.get("OTP_MAX_ATTEMPTS", { infer: true });
    this.cooldownSec = config.get("OTP_RESEND_COOLDOWN", { infer: true });
  }

  /**
   * Generate, persist (hashed), and deliver a fresh code. Enforces the resend
   * cooldown against the most recent code for this identifier + purpose.
   */
  async issue({ userId, identifier, purpose }: IssueParams): Promise<void> {
    await this.enforceCooldown(identifier, purpose);

    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    await this.prisma.verificationCode.create({
      data: {
        userId: userId ?? null,
        channel: "EMAIL",
        identifier,
        purpose,
        codeHash: this.hash(code),
        expiresAt: new Date(Date.now() + this.ttlMs),
      },
    });

    await this.delivery.send({ channel: "EMAIL", to: identifier, code, purpose });
  }

  /**
   * Verify a submitted code. On success the code is consumed and the associated
   * userId (if any) is returned. Every failure throws the same generic error so
   * callers can't enumerate identifiers or probe which check failed.
   */
  async verify(
    identifier: string,
    code: string,
    purpose: OtpPurpose,
  ): Promise<{ userId: string | null }> {
    const record = await this.prisma.verificationCode.findFirst({
      where: { identifier, purpose, consumedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (
      !record ||
      record.expiresAt.getTime() <= Date.now() ||
      record.attemptCount >= this.maxAttempts
    ) {
      throw new BadRequestException(INVALID_CODE);
    }

    const matches = this.constantTimeEqual(record.codeHash, this.hash(code));
    // Consume on success; otherwise burn one attempt (eventually locks the code).
    await this.prisma.verificationCode.update({
      where: { id: record.id },
      data: matches
        ? { consumedAt: new Date() }
        : { attemptCount: { increment: 1 } },
    });

    if (!matches) {
      throw new BadRequestException(INVALID_CODE);
    }
    return { userId: record.userId };
  }

  private async enforceCooldown(
    identifier: string,
    purpose: OtpPurpose,
  ): Promise<void> {
    if (this.cooldownSec <= 0) return;
    const last = await this.prisma.verificationCode.findFirst({
      where: { identifier, purpose },
      orderBy: { createdAt: "desc" },
    });
    if (!last) return;

    const elapsedSec = (Date.now() - last.createdAt.getTime()) / 1000;
    const remaining = Math.ceil(this.cooldownSec - elapsedSec);
    if (remaining > 0) {
      throw new HttpException(
        {
          code: "OTP_COOLDOWN",
          message: `Please wait ${remaining}s before requesting another code`,
          details: { retryAfterSeconds: remaining },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private hash(code: string): string {
    return createHash("sha256").update(code).digest("hex");
  }

  /** Length-checked constant-time compare of two hex digests. */
  private constantTimeEqual(a: string, b: string): boolean {
    const ab = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ab.length !== bb.length) return false;
    return timingSafeEqual(ab, bb);
  }
}
