import { Injectable } from "@nestjs/common";
import type { OtpDelivery } from "./otp-delivery.interface";

/**
 * SMS transport placeholder. No free OSS SMS gateway exists at scale, so SMS
 * OTP is deferred (plan/15). The slot is kept so SMS drops in later behind the
 * same OtpDelivery interface; for now any attempt fails loudly rather than
 * silently dropping a message. Not registered in the module until a transport
 * is chosen.
 */
@Injectable()
export class SmsProvider implements OtpDelivery {
  send(): Promise<void> {
    return Promise.reject(
      new Error("SMS OTP delivery is not configured (deferred — plan/15)"),
    );
  }
}
