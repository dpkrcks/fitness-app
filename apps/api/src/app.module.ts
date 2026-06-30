import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { validateEnv, type Env } from "./config/env.schema";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { HealthModule } from "./modules/health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { MeModule } from "./modules/me/me.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        // Extract to a local so the inferred-key overload of `get` is chosen
        // (inlining lets pino's `level` type drive overload resolution).
        const level = config.get("LOG_LEVEL", { infer: true });
        return { pinoHttp: { level } };
      },
    }),
    // Rate-limit config (in-memory). Applied selectively via ThrottlerGuard on
    // the auth controller — not as a global guard — so health probes are free.
    // Default: 20 requests / 60s per route+IP; tighter caps on OTP routes.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
    PrismaModule,
    HealthModule,
    AuthModule,
    MeModule,
  ],
})
export class AppModule {}
