import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { validateEnv, type Env } from "./config/env.schema";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { HealthModule } from "./modules/health/health.module";

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
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
