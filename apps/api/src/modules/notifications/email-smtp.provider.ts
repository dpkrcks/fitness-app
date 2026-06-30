import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTransport, type Transporter } from "nodemailer";
import type { OtpPurpose } from "@fit/shared-types";
import type { Env } from "../../config/env.schema";
import type { OtpDelivery, OtpMessage } from "./otp-delivery.interface";

/**
 * Sends OTP codes over SMTP via nodemailer. Selected when `SMTP_HOST` is set;
 * works unchanged against Mailpit (dev) or any real relay. The transporter is
 * built lazily so it's only created when SMTP is actually the chosen sender.
 */
@Injectable()
export class EmailSmtpProvider implements OtpDelivery {
  private readonly logger = new Logger(EmailSmtpProvider.name);
  private readonly from: string;
  private transporter?: Transporter;

  constructor(private readonly config: ConfigService<Env, true>) {
    this.from = config.get("SMTP_FROM", { infer: true });
  }

  async send(message: OtpMessage): Promise<void> {
    if (message.channel !== "EMAIL") {
      throw new Error(`EmailSmtpProvider cannot deliver to ${message.channel}`);
    }
    await this.transport().sendMail({
      from: this.from,
      to: message.to,
      subject: this.subjectFor(message.purpose),
      text: this.bodyFor(message),
    });
    this.logger.log(`Sent ${message.purpose} code to ${message.to}`);
  }

  private transport(): Transporter {
    if (!this.transporter) {
      const port = this.config.get("SMTP_PORT", { infer: true });
      const user = this.config.get("SMTP_USER", { infer: true });
      const pass = this.config.get("SMTP_PASS", { infer: true });
      this.transporter = createTransport({
        host: this.config.get("SMTP_HOST", { infer: true }),
        port,
        // Implicit TLS only on 465; STARTTLS upgrade otherwise (587, Mailpit 1025).
        secure: port === 465,
        auth: user ? { user, pass } : undefined,
      });
    }
    return this.transporter;
  }

  private subjectFor(purpose: OtpPurpose): string {
    return purpose === "PASSWORD_RESET"
      ? "Your password reset code"
      : "Your verification code";
  }

  private bodyFor({ code }: OtpMessage): string {
    return `Your code is ${code}. It expires shortly. If you didn't request this, you can safely ignore this email.`;
  }
}
