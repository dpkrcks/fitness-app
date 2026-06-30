import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/** Protects a route with the access-token JWT strategy. */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
