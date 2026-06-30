import { z } from "zod";

/**
 * Auth contracts shared by api (request validation) and mobile (form validation
 * + TS types). Mirrors plan/14-auth-module-plan.md.
 */

/** Password policy enforced at registration. argon2 has no bcrypt-style byte
 *  limit, so we cap length only to bound hashing cost / abuse. */
const passwordPolicy = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

/** Emails are normalized (trimmed + lowercased) so lookups are case-insensitive. */
const emailField = z
  .email("Enter a valid email")
  .trim()
  .toLowerCase();

export const registerSchema = z.object({
  email: emailField,
  password: passwordPolicy,
});
export type RegisterInput = z.infer<typeof registerSchema>;

/** Login intentionally does NOT echo the password policy (no min length) — we
 *  must not leak credential rules or whether an account exists. */
export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** Body for POST /auth/refresh and /auth/logout. */
export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshInput = z.infer<typeof refreshSchema>;

/** Our own session tokens — issued regardless of how identity was established. */
export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type AuthTokens = z.infer<typeof AuthTokensSchema>;

/** Safe user projection returned to clients (never exposes passwordHash). */
export const UserPublicSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  emailVerified: z.boolean(),
  createdAt: z.iso.datetime(),
});
export type UserPublic = z.infer<typeof UserPublicSchema>;

/** Standard response for login + verify-otp: who you are + how to act as them. */
export const AuthResultSchema = z.object({
  user: UserPublicSchema,
  tokens: AuthTokensSchema,
});
export type AuthResult = z.infer<typeof AuthResultSchema>;

/** Register no longer issues tokens — the email must be verified first. */
export const RegisterResultSchema = z.object({
  user: UserPublicSchema,
});
export type RegisterResult = z.infer<typeof RegisterResultSchema>;

/** What an OTP challenge is for. Email signup is the only live purpose for now. */
export const OtpPurposeSchema = z.enum(["SIGNUP", "LOGIN", "PASSWORD_RESET"]);
export type OtpPurpose = z.infer<typeof OtpPurposeSchema>;

/** Submit a 6-digit code to verify an identifier (email for now). */
export const verifyOtpSchema = z.object({
  identifier: emailField,
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
  purpose: OtpPurposeSchema.default("SIGNUP"),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

/** Request a fresh code for an identifier. */
export const resendOtpSchema = z.object({
  identifier: emailField,
  purpose: OtpPurposeSchema.default("SIGNUP"),
});
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
