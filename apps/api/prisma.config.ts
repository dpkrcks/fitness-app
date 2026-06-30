// Prisma CLI config (migrations, introspection, generate).
// `dotenv/config` loads `.env` into process.env so `env()` can resolve below.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // CLI/migrations use Neon's DIRECT (unpooled) endpoint — DDL cannot run
    // through the PgBouncer pooler. The app runtime uses DATABASE_URL instead.
    url: env("DIRECT_URL"),
  },
});
