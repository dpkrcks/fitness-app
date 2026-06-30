-- CreateTable
CREATE TABLE "profiles" (
    "user_id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "units" TEXT NOT NULL DEFAULT 'metric',
    "sex" TEXT,
    "height_cm" INTEGER,
    "weight_kg" DOUBLE PRECISION,
    "goal" TEXT,
    "activity_level" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
