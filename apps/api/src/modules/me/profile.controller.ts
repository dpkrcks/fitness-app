import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import {
  profileSchema,
  type ProfileInput,
  type ProfilePublic,
} from "@fit/shared-types";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { AuthUser } from "../auth/auth.types";
import { ProfileService } from "./profile.service";

@ApiTags("me")
@Controller("me/profile")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profiles: ProfileService) {}

  @Get()
  @ApiOkResponse({ description: "The current user's profile (404 if not set up)." })
  get(@CurrentUser() user: AuthUser): Promise<ProfilePublic> {
    return this.profiles.get(user.userId);
  }

  @Post()
  @ApiOkResponse({ description: "Create or complete the current user's profile." })
  save(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(profileSchema)) dto: ProfileInput,
  ): Promise<ProfilePublic> {
    return this.profiles.save(user.userId, dto);
  }
}
