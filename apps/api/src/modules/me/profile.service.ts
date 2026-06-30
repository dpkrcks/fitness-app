import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  ActivityLevel,
  Goal,
  ProfileInput,
  ProfilePublic,
  Sex,
  Units,
} from "@fit/shared-types";
import { PrismaService } from "../prisma/prisma.service";

/** Persisted profile fields we project to clients. */
type ProfileRow = {
  displayName: string;
  dateOfBirth: Date;
  units: string;
  sex: string | null;
  heightCm: number | null;
  weightKg: number | null;
  goal: string | null;
  activityLevel: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /** Current user's profile, or 404 if onboarding hasn't run yet. */
  async get(userId: string): Promise<ProfilePublic> {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException("Profile not set up");
    }
    return this.toPublic(profile);
  }

  /** Create or complete the profile (idempotent upsert keyed by userId). */
  async save(userId: string, input: ProfileInput): Promise<ProfilePublic> {
    const data = {
      displayName: input.displayName,
      // Stored as a DATE; parse the YYYY-MM-DD at UTC midnight to avoid TZ drift.
      dateOfBirth: new Date(`${input.dateOfBirth}T00:00:00Z`),
      units: input.units,
      sex: input.sex ?? null,
      heightCm: input.heightCm ?? null,
      weightKg: input.weightKg ?? null,
      goal: input.goal ?? null,
      activityLevel: input.activityLevel ?? null,
    };
    const profile = await this.prisma.profile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
    return this.toPublic(profile);
  }

  private toPublic(p: ProfileRow): ProfilePublic {
    return {
      displayName: p.displayName,
      dateOfBirth: p.dateOfBirth.toISOString().slice(0, 10),
      units: p.units as Units,
      sex: p.sex as Sex | null,
      heightCm: p.heightCm,
      weightKg: p.weightKg,
      goal: p.goal as Goal | null,
      activityLevel: p.activityLevel as ActivityLevel | null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }
}
