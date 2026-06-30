import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { Env } from "../../../config/env.schema";
import type { AccessTokenPayload, AuthUser } from "../auth.types";

/**
 * Validates the Bearer access token. Passport verifies the signature +
 * expiry against JWT_ACCESS_SECRET before `validate` runs; we just shape the
 * payload into the `AuthUser` attached to `req.user`.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<Env, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get("JWT_ACCESS_SECRET", { infer: true }),
    });
  }

  validate(payload: AccessTokenPayload): AuthUser {
    return { userId: payload.sub, email: payload.email };
  }
}
