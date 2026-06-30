-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verified_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "verification_codes" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "channel" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verification_codes_identifier_purpose_idx" ON "verification_codes"("identifier", "purpose");
