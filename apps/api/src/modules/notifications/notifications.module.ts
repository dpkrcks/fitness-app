import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "../../config/env.schema";
import { EmailLogProvider } from "./email-log.provider";
import { EmailSmtpProvider } from "./email-smtp.provider";
import { OTP_DELIVERY } from "./otp-delivery.interface";

/**
 * Resolves the active OTP delivery provider once at init: SMTP when `SMTP_HOST`
 * is configured, otherwise the dev-log provider. In production without SMTP it
 * still falls back to logging but shouts about it — codes-to-console is dev-only.
 */
@Module({
  providers: [
    EmailSmtpProvider,
    EmailLogProvider,
    {
      provide: OTP_DELIVERY,
      inject: [ConfigService, EmailSmtpProvider, EmailLogProvider],
      useFactory: (
        config: ConfigService<Env, true>,
        smtp: EmailSmtpProvider,
        log: EmailLogProvider,
      ) => {
        if (config.get("SMTP_HOST", { infer: true })) {
          return smtp;
        }
        if (config.get("NODE_ENV", { infer: true }) === "production") {
          new Logger("NotificationsModule").error(
            "No SMTP_HOST set in production — OTP codes are being LOGGED, not emailed. Configure SMTP_* now.",
          );
        }
        return log;
      },
    },
  ],
  exports: [OTP_DELIVERY],
})
export class NotificationsModule {}
