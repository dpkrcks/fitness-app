/** Claims we put in the access JWT. `sub` is the user id. */
export interface AccessTokenPayload {
  sub: string;
  email: string;
}

/** Shape attached to `req.user` by the JWT strategy / exposed via @CurrentUser. */
export interface AuthUser {
  userId: string;
  email: string;
}
