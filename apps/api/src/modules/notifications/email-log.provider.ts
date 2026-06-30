import { Injectable, Logger } from "@nestjs/common";
import type { OtpDelivery, OtpMessage } from "./otp-delivery.interface";

/**
 * Dev fallback: writes the OTP to the API console instead of sending email.
 * Selected when no `SMTP_HOST` is configured, so the verify flow is testable
 * without a mail server. NEVER intended for production (boot warns loudly).
 */
@Injectable()
export class EmailLogProvider implements OtpDelivery {
  private readonly logger = new Logger("OtpDelivery");

  send({ to, code, purpose }: OtpMessage): Promise<void> {
    this.logger.warn(
      `[DEV OTP] ${purpose} code for ${to}: ${code} — no SMTP_HOST set, logging instead of emailing`,
    );
    return Promise.resolve();
  }
}
