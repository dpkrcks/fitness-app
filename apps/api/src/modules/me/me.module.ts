import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

/** "Me" — the authenticated user's own resources (profile now; more later). */
@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class MeModule {}
