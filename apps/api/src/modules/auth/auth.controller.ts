import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  resendOtpSchema,
  verifyOtpSchema,
  type AuthResult,
  type AuthTokens,
  type LoginInput,
  type RefreshInput,
  type RegisterInput,
  type RegisterResult,
  type ResendOtpInput,
  type UserPublic,
  type VerifyOtpInput,
} from "@fit/shared-types";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import type { AuthUser } from "./auth.types";

@ApiTags("auth")
@Controller("auth")
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  @HttpCode(201)
  @ApiCreatedResponse({
    description: "Account created; a verification code is sent. No tokens yet.",
  })
  register(
    @Body(new ZodValidationPipe(registerSchema)) dto: RegisterInput,
  ): Promise<RegisterResult> {
    return this.auth.register(dto);
  }

  @Post("verify-otp")
  @HttpCode(200)
  // Tight cap: the code itself is only 6 digits, so throttling is the real
  // brute-force defense (alongside the per-code attempt counter).
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOkResponse({ description: "Email verified; returns user + tokens." })
  verifyOtp(
    @Body(new ZodValidationPipe(verifyOtpSchema)) dto: VerifyOtpInput,
  ): Promise<AuthResult> {
    return this.auth.verifyOtp(dto);
  }

  @Post("resend-otp")
  @HttpCode(204)
  // Even tighter than verify: resending should be rare. The OTP service also
  // enforces a per-identifier cooldown on top of this per-IP cap.
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @ApiOkResponse({ description: "A new code is sent if the account can receive one." })
  async resendOtp(
    @Body(new ZodValidationPipe(resendOtpSchema)) dto: ResendOtpInput,
  ): Promise<void> {
    await this.auth.resendOtp(dto);
  }

  @Post("login")
  @HttpCode(200)
  // Slow credential stuffing without blocking a forgetful real user.
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOkResponse({ description: "Authenticated; returns user + tokens." })
  login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginInput,
  ): Promise<AuthResult> {
    return this.auth.login(dto);
  }

  @Post("refresh")
  @HttpCode(200)
  @ApiOkResponse({ description: "Returns a rotated token pair." })
  refresh(
    @Body(new ZodValidationPipe(refreshSchema)) dto: RefreshInput,
  ): Promise<AuthTokens> {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post("logout")
  @HttpCode(204)
  @ApiOkResponse({ description: "Refresh token revoked." })
  async logout(
    @Body(new ZodValidationPipe(refreshSchema)) dto: RefreshInput,
  ): Promise<void> {
    await this.auth.logout(dto.refreshToken);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: "The authenticated user." })
  me(@CurrentUser() user: AuthUser): Promise<UserPublic> {
    return this.auth.me(user.userId);
  }
}
