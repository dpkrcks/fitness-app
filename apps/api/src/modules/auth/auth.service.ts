import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import * as argon2 from "argon2";
import type {
  AuthResult,
  AuthTokens,
  LoginInput,
  RegisterInput,
  RegisterResult,
  ResendOtpInput,
  UserPublic,
  VerifyOtpInput,
} from "@fit/shared-types";
import { PrismaService } from "../prisma/prisma.service";
import { TokenService } from "./token.service";
import { OtpService } from "./otp.service";

/** Persisted user fields we project to clients. */
type UserRow = {
  id: string;
  email: string;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  deletedAt: Date | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
    private readonly otp: OtpService,
  ) {}

  /**
   * Create an email/password account and send a verification code. No session
   * tokens are issued until the email is verified (see {@link verifyOtp}).
   */
  async register(input: RegisterInput): Promise<RegisterResult> {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await argon2.hash(input.password, {
      type: argon2.argon2id,
    });
    const user = await this.prisma.user.create({
      data: { email: input.email, passwordHash },
    });

    await this.otp.issue({
      userId: user.id,
      identifier: user.email,
      purpose: "SIGNUP",
    });
    return { user: this.toPublic(user) };
  }

  /** Verify credentials and start a session. Unverified emails are refused. */
  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });
    // Generic error in every credential branch — never reveal which part failed.
    if (!user || !user.passwordHash || user.deletedAt) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const valid = await argon2.verify(user.passwordHash, input.password);
    if (!valid) {
      throw new UnauthorizedException("Invalid credentials");
    }
    // Only after proving the password do we reveal verification state, and route
    // the client to the verify screen via a stable code.
    if (!user.emailVerifiedAt) {
      throw new ForbiddenException({
        code: "EMAIL_NOT_VERIFIED",
        message: "Email not verified",
      });
    }

    const tokens = await this.tokens.issueTokens(user);
    return { user: this.toPublic(user), tokens };
  }

  /**
   * Verify a signup code, mark the email verified, and start a session. This is
   * the first point an account receives tokens.
   */
  async verifyOtp(input: VerifyOtpInput): Promise<AuthResult> {
    const { userId } = await this.otp.verify(
      input.identifier,
      input.code,
      input.purpose,
    );
    // SIGNUP codes always carry the owning userId; fall back to email lookup.
    const user = userId
      ? await this.prisma.user.findUnique({ where: { id: userId } })
      : await this.prisma.user.findUnique({ where: { email: input.identifier } });
    if (!user || user.deletedAt) {
      throw new UnauthorizedException();
    }

    const verified = user.emailVerifiedAt
      ? user
      : await this.prisma.user.update({
          where: { id: user.id },
          data: { emailVerifiedAt: new Date() },
        });

    const tokens = await this.tokens.issueTokens(verified);
    return { user: this.toPublic(verified), tokens };
  }

  /**
   * Re-send a verification code. Always resolves the same way regardless of
   * whether the account exists or is already verified (no enumeration); a code
   * is only actually issued for an existing, unverified account.
   */
  async resendOtp(input: ResendOtpInput): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.identifier },
    });
    if (user && !user.emailVerifiedAt && !user.deletedAt) {
      await this.otp.issue({
        userId: user.id,
        identifier: user.email,
        purpose: input.purpose,
      });
    }
  }

  /** Rotate a refresh token into a new token pair. */
  async refresh(refreshToken: string): Promise<AuthTokens> {
    return this.tokens.rotate(refreshToken);
  }

  /** Revoke a refresh token (logout). */
  async logout(refreshToken: string): Promise<void> {
    await this.tokens.revoke(refreshToken);
  }

  /** Resolve the authenticated user for GET /auth/me. */
  async me(userId: string): Promise<UserPublic> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new UnauthorizedException();
    }
    return this.toPublic(user);
  }

  private toPublic(user: UserRow): UserPublic {
    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerifiedAt != null,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
