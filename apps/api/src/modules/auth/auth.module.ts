import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import type { Env } from "../../config/env.schema";
import { NotificationsModule } from "../notifications/notifications.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TokenService } from "./token.service";
import { OtpService } from "./otp.service";
import { durationToMs } from "./duration";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    PassportModule,
    NotificationsModule,
    // Access-token signing config. Refresh tokens are opaque (not JWTs), so
    // only the access secret/TTL live here.
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get("JWT_ACCESS_SECRET", { infer: true }),
        signOptions: {
          // jsonwebtoken accepts a number of seconds for `expiresIn`.
          expiresIn: Math.floor(
            durationToMs(config.get("JWT_ACCESS_TTL", { infer: true })) / 1000,
          ),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, OtpService, JwtStrategy],
})
export class AuthModule {}
