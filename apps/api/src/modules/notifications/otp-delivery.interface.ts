import type { OtpPurpose } from "@fit/shared-types";

/** Transports we can (eventually) deliver a code over. Only EMAIL is live. */
export type OtpChannel = "EMAIL" | "SMS";

/** A single OTP message handed to a delivery provider. */
export interface OtpMessage {
  channel: OtpChannel;
  to: string;
  code: string;
  purpose: OtpPurpose;
}

/**
 * Channel-agnostic OTP sender. Implemented once per transport (SMTP, dev-log,
 * and later SMS) so the OTP service never knows how a code is delivered.
 */
export interface OtpDelivery {
  send(message: OtpMessage): Promise<void>;
}

/** DI token for the active OtpDelivery implementation (resolved at module init). */
export const OTP_DELIVERY = Symbol("OTP_DELIVERY");
